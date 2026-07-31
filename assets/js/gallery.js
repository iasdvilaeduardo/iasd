import { escapeHtml, formatDate, isSupabaseConfigured, storageDownloadUrl, storageUrl, supabase } from './supabase-client.js';

const PAGE_SIZE = 36;
const list = document.querySelector('#albumList');
const albumDialog = document.querySelector('#albumDialog');
const photoGrid = document.querySelector('#albumPhotoGrid');
const photoSentinel = document.querySelector('#photoSentinel');
const lightbox = document.querySelector('#lightbox');
const downloadLink = document.querySelector('#downloadPhoto');
let currentAlbum = null;
let currentPhotos = [];
let photoOffset = 0;
let hasMorePhotos = false;
let position = 0;
let observer;

function photoPath(photo, variant) { return photo[`${variant}_path`] || photo.storage_path; }
function skeletons(amount = 8) { return Array.from({ length: amount }, () => '<span class="photo-skeleton" aria-hidden="true"></span>').join(''); }
function showImage(index) {
  position = (index + currentPhotos.length) % currentPhotos.length;
  const photo = currentPhotos[position];
  lightbox.querySelector('img').src = storageUrl(photoPath(photo, 'display'));
  lightbox.querySelector('img').alt = photo.alt_text || `Foto de ${currentAlbum.title}`;
  downloadLink.href = storageDownloadUrl(photoPath(photo, 'original'));
  downloadLink.download = `${currentAlbum.title.replaceAll(/[^a-z0-9]+/gi, '-').toLowerCase()}-${position + 1}`;
  lightbox.showModal();
}
async function loadNextPhotos() {
  if (!currentAlbum || !hasMorePhotos) return;
  hasMorePhotos = false; photoSentinel.textContent = 'Carregando fotos…';
  const { data, error } = await supabase.from('photos').select('id,storage_path,thumb_path,display_path,original_path,alt_text,position').eq('album_id', currentAlbum.id).order('position').order('created_at').range(photoOffset, photoOffset + PAGE_SIZE - 1);
  if (error) { photoSentinel.textContent = 'Não foi possível carregar mais fotos.'; return; }
  const start = currentPhotos.length; currentPhotos.push(...data); photoOffset += data.length; hasMorePhotos = data.length === PAGE_SIZE;
  photoGrid.insertAdjacentHTML('beforeend', data.map((photo, index) => `<button type="button" data-index="${start + index}"><img src="${storageUrl(photoPath(photo, 'thumb'))}" alt="${escapeHtml(photo.alt_text || `Foto de ${currentAlbum.title}`)}" loading="lazy" decoding="async" width="400" height="400"></button>`).join(''));
  photoSentinel.textContent = hasMorePhotos ? 'Role para carregar mais fotos.' : (currentPhotos.length ? `${currentPhotos.length} foto(s) carregada(s).` : 'Este álbum ainda não tem fotos.');
}
async function openAlbum(album) {
  currentAlbum = album; currentPhotos = []; photoOffset = 0; hasMorePhotos = true;
  document.querySelector('#albumDialogDate').textContent = formatDate(album.event_date);
  document.querySelector('#albumDialogTitle').textContent = album.title;
  document.querySelector('#albumDialogDescription').textContent = album.description || '';
  photoGrid.innerHTML = skeletons(); photoSentinel.textContent = 'Carregando fotos…'; albumDialog.showModal();
  await loadNextPhotos();
  history.replaceState(null, '', `?album=${encodeURIComponent(album.id)}`);
}
document.querySelector('.dialog-close').onclick = () => { albumDialog.close(); history.replaceState(null, '', 'gallery.html'); };
lightbox.querySelector('.lightbox-close').onclick = () => lightbox.close();
lightbox.querySelector('.lightbox-next').onclick = () => showImage(position + 1);
lightbox.querySelector('.lightbox-previous').onclick = () => showImage(position - 1);
photoGrid.addEventListener('click', (event) => { const index = event.target.closest('[data-index]')?.dataset.index; if (index !== undefined) showImage(Number(index)); });
observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) loadNextPhotos(); }, { root: albumDialog, rootMargin: '400px' });
observer.observe(photoSentinel);

if (!isSupabaseConfigured) {
  list.innerHTML = '<p class="empty-state">A galeria ficará disponível após a configuração do Supabase.</p>';
} else {
  const { data: albums, error } = await supabase.from('albums').select('id,title,description,event_date,cover_path').eq('published', true).order('event_date', { ascending: false });
  list.innerHTML = error ? '<p class="empty-state">Não foi possível carregar a galeria.</p>' : albums.length
    ? albums.map((album) => `<article class="album-card gallery-album"><button type="button" data-album="${album.id}">${album.cover_path ? `<img src="${storageUrl(album.cover_path)}" alt="Capa do álbum ${escapeHtml(album.title)}" loading="lazy" decoding="async" width="600" height="450">` : '<div class="album-placeholder" aria-hidden="true">📷</div>'}<div><p class="card-kicker">${formatDate(album.event_date)}</p><h2>${escapeHtml(album.title)}</h2><p>${escapeHtml(album.description || 'Clique para abrir este álbum.')}</p><span class="open-album">Abrir álbum →</span></div></button></article>`).join('')
    : '<p class="empty-state">Ainda não há álbuns publicados.</p>';
  list.addEventListener('click', (event) => { const id = event.target.closest('[data-album]')?.dataset.album; if (id) openAlbum(albums.find((album) => album.id === id)); });
  const requestedAlbum = new URLSearchParams(location.search).get('album');
  if (requestedAlbum) { const album = albums.find((item) => item.id === requestedAlbum); if (album) openAlbum(album); }
}
