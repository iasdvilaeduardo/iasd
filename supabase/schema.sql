-- Execute este arquivo uma única vez no SQL Editor do Supabase.
create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'editor', 'visitor');
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.app_role not null default 'visitor',
  created_at timestamptz not null default now()
);
create table public.events (
  id uuid primary key default gen_random_uuid(), title text not null check (char_length(title) between 1 and 120),
  description text, starts_at timestamptz not null, location text, department text, image_path text,
  published boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.albums (
  id uuid primary key default gen_random_uuid(), title text not null check (char_length(title) between 1 and 120),
  description text, event_date date, cover_path text, published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.photos (
  id uuid primary key default gen_random_uuid(), album_id uuid not null references public.albums(id) on delete cascade,
  storage_path text not null unique, thumb_path text, display_path text, original_path text,
  alt_text text, position integer not null default 0, created_at timestamptz not null default now()
);

create or replace function public.is_editor() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor'))
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1))); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security; alter table public.events enable row level security; alter table public.albums enable row level security; alter table public.photos enable row level security;
create policy "profile is visible to owner" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "published events are public" on public.events for select using (published or public.is_editor());
create policy "editors manage events" on public.events for all using (public.is_editor()) with check (public.is_editor());
create policy "published albums are public" on public.albums for select using (published or public.is_editor());
create policy "editors manage albums" on public.albums for all using (public.is_editor()) with check (public.is_editor());
create policy "photos in published albums are public" on public.photos for select using (exists(select 1 from public.albums where albums.id=photos.album_id and (albums.published or public.is_editor())));
create policy "editors manage photos" on public.photos for all using (public.is_editor()) with check (public.is_editor());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('gallery','gallery',true,52428800,array['image/jpeg','image/png','image/webp']) on conflict (id) do nothing;
create policy "public reads gallery files" on storage.objects for select using (bucket_id='gallery');
create policy "editors upload gallery files" on storage.objects for insert to authenticated with check (bucket_id='gallery' and public.is_editor());
create policy "editors update gallery files" on storage.objects for update to authenticated using (bucket_id='gallery' and public.is_editor());
create policy "editors delete gallery files" on storage.objects for delete to authenticated using (bucket_id='gallery' and public.is_editor());

-- Após criar sua primeira conta em Authentication > Users, promova-a uma vez:
-- update public.profiles set role = 'admin' where id = 'UUID-DO-USUARIO';
