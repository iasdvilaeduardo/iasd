import { escapeHtml, formatDateTime, isSupabaseConfigured, storageUrl, supabase } from './supabase-client.js';

const eventList = document.querySelector('#upcomingEvents');
const albumList = document.querySelector('#featuredAlbums');

function emptyState(container, text) {
  if (container) container.innerHTML = `<p class="empty-state">${escapeHtml(text)}</p>`;
}

function eventCard(event) {
  const image = event.image_path ? `<img src="${storageUrl(event.image_path)}" alt="" loading="lazy" decoding="async">` : '';
  return `<article class="event-card">${image}<div><p class="card-kicker">${escapeHtml(event.department || 'Igreja')}</p><h3>${escapeHtml(event.title)}</h3><p class="event-meta"><time datetime="${event.starts_at}">${formatDateTime(event.starts_at)}</time>${event.location ? ` · ${escapeHtml(event.location)}` : ''}</p><p>${escapeHtml(event.description || '')}</p></div></article>`;
}

function albumCard(album) {
  const cover = album.cover_path ? `<img src="${storageUrl(album.cover_path)}" alt="Capa do álbum ${escapeHtml(album.title)}" loading="lazy" decoding="async">` : '<div class="album-placeholder" aria-hidden="true">📷</div>';
  return `<a class="album-card" href="gallery.html#album-${album.id}">${cover}<div><p class="card-kicker">${album.event_date ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${album.event_date}T00:00:00`)) : 'Galeria'}</p><h3>${escapeHtml(album.title)}</h3><p>${escapeHtml(album.description || 'Veja as fotos deste momento especial.')}</p></div></a>`;
}

async function loadContent() {
  if (!isSupabaseConfigured) {
    emptyState(eventList, 'A agenda será exibida aqui assim que o Supabase for conectado.');
    emptyState(albumList, 'Os álbuns em destaque aparecerão aqui.');
    return;
  }
  const now = new Date().toISOString();
  const [{ data: events, error: eventError }, { data: albums, error: albumError }] = await Promise.all([
    supabase.from('events').select('*').eq('published', true).gte('starts_at', now).order('starts_at').limit(3),
    supabase.from('albums').select('*').eq('published', true).order('event_date', { ascending: false }).limit(3)
  ]);
  if (eventError) emptyState(eventList, 'Não foi possível carregar os próximos eventos agora.');
  else eventList.innerHTML = events?.length ? events.map(eventCard).join('') : '<p class="empty-state">Nenhum evento futuro cadastrado.</p>';
  if (albumError) emptyState(albumList, 'Não foi possível carregar os álbuns agora.');
  else albumList.innerHTML = albums?.length ? albums.map(albumCard).join('') : '<p class="empty-state">Ainda não há álbuns publicados.</p>';
}
loadContent();
