-- Execute uma vez no SQL Editor após publicar esta versão.
alter table public.photos add column if not exists thumb_path text;
alter table public.photos add column if not exists display_path text;
alter table public.photos add column if not exists original_path text;
create index if not exists photos_album_position_idx on public.photos (album_id, position, created_at);

-- A galeria armazena o original intacto e duas versões WebP para navegação.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']
where id = 'gallery';

-- Fotos antigas continuam funcionando: o arquivo atual é tratado como original/display até serem reenviadas.
update public.photos
set original_path = coalesce(original_path, storage_path),
    display_path = coalesce(display_path, storage_path),
    thumb_path = coalesce(thumb_path, storage_path)
where original_path is null or display_path is null or thumb_path is null;
