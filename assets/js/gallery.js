import { escapeHtml, formatDate, isSupabaseConfigured, storageUrl, supabase } from './supabase-client.js';

const list = document.querySelector('#albumList');
const albumDialog = document.querySelector('#albumDialog');
const photoGrid = document.querySelector('#albumPhotoGrid');
const lightbox = document.querySelector('#lightbox');
let currentPhotos = [];
let position = 0;

function showImage(index) {
  position = (index + currentPhotos.length) % currentPhotos.length;
  const photo = currentPhotos[position];
  lightbox.querySelector('img').src = storageUrl(photo.storage_path);
  lightbox.querySelector('img').alt = photo.alt_text || 'Foto do álbum';
  lightbox.showModal();
}

function openAlbum(album) {
  currentPhotos = [...album.photos].sort((a, b) => a.position - b.position);
  document.querySelector('#albumDialogDate').textContent = formatDate(album.event_date);
  document.querySelector('#albumDialogTitle').textContent = album.title;
  document.querySelector('#albumDialogDescription').textContent = album.description || '';
  photoGrid.innerHTML = currentPhotos.length
    ? currentPhotos.map((photo, index) => `<button type="button" data-index="${index}"><img src="${storageUrl(photo.storage_path)}" alt="${escapeHtml(photo.alt_text || `Foto de ${album.title}`)}" loading="lazy"></button>`).join('')
    : '<p class="empty-state">Este álbum ainda não tem fotos.</p>';
  albumDialog.showModal();
}

document.querySelector('.dialog-close').onclick = () => albumDialog.close();
lightbox.querySelector('.lightbox-close').onclick = () => lightbox.close();
lightbox.querySelector('.lightbox-next').onclick = () => showImage(position + 1);
lightbox.querySelector('.lightbox-previous').onclick = () => showImage(position - 1);
photoGrid.addEventListener('click', (event) => { const index = event.target.closest('[data-index]')?.dataset.index; if (index !== undefined) showImage(Number(index)); });

if (!isSupabaseConfigured) {
  list.innerHTML = '<p class="empty-state">A galeria ficará disponível após a configuração do Supabase.</p>';
} else {
  const { data: albums, error } = await supabase.from('albums').select('*, photos(*)').eq('published', true).order('event_date', { ascending: false });
  list.innerHTML = error ? '<p class="empty-state">Não foi possível carregar a galeria.</p>' : albums.length
    ? albums.map((album) => `<article class="album-card gallery-album"><button type="button" data-album="${album.id}">${album.cover_path ? `<img src="${storageUrl(album.cover_path)}" alt="Capa do álbum ${escapeHtml(album.title)}" loading="lazy">` : '<div class="album-placeholder" aria-hidden="true">📷</div>'}<div><p class="card-kicker">${formatDate(album.event_date)}</p><h2>${escapeHtml(album.title)}</h2><p>${escapeHtml(album.description || 'Clique para abrir este álbum.')}</p><span class="open-album">Abrir álbum →</span></div></button></article>`).join('')
    : '<p class="empty-state">Ainda não há álbuns publicados.</p>';
  list.addEventListener('click', (event) => { const id = event.target.closest('[data-album]')?.dataset.album; if (id) openAlbum(albums.find((album) => album.id === id)); });
}
