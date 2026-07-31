import { escapeHtml, formatDateTime, isSupabaseConfigured, storageUrl, supabase } from './supabase-client.js';
import { createGalleryVariants } from './gallery-image.js';

const $ = (selector) => document.querySelector(selector);
const status = (message) => { $('#adminNotice').textContent = message; };

if (!isSupabaseConfigured) {
  $('#loginView').innerHTML = '<h1>Configuração necessária</h1><p>Preencha <code>assets/js/config.js</code> com a URL e a chave pública do Supabase.</p>';
} else {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) showDashboard(session.user);
  $('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
    $('.form-status').textContent = error ? 'Não foi possível entrar. Verifique seus dados.' : '';
    if (!error) location.reload();
  });
  $('#signOut').onclick = async () => { await supabase.auth.signOut(); location.reload(); };
}

async function showDashboard(user) {
  $('#loginView').hidden = true; $('#dashboardView').hidden = false;
  const { data: profile } = await supabase.from('profiles').select('role,display_name').eq('id', user.id).single();
  if (!profile || profile.role === 'visitor') { $('#dashboardView').hidden = true; $('#loginView').innerHTML = '<h1>Acesso não autorizado</h1><p>Sua conta não possui permissão editorial.</p>'; return; }
  $('#adminIdentity').textContent = `${profile.display_name || user.email} · ${profile.role === 'admin' ? 'Administrador' : 'Editor'}`;

  const refresh = async () => {
    const [{ data: events }, { data: albums }] = await Promise.all([supabase.from('events').select('*').order('starts_at', { ascending: false }), supabase.from('albums').select('*').order('event_date', { ascending: false })]);
    $('#eventAdminList').innerHTML = events.length ? events.map((item) => `<div><strong>${escapeHtml(item.title)}</strong><span>${formatDateTime(item.starts_at)}</span><button data-delete-event="${item.id}">Excluir</button></div>`).join('') : '<p>Nenhum evento.</p>';
    $('#albumAdminList').innerHTML = albums.length ? albums.map((item) => `<div><strong>${escapeHtml(item.title)}</strong><span>${item.event_date || ''}</span><button type="button" data-manage-album="${item.id}">Fotos</button><button data-delete-album="${item.id}">Excluir</button></div>`).join('') : '<p>Nenhum álbum.</p>';
    $('#photoAlbum').innerHTML = albums.length ? albums.map((item) => `<option value="${item.id}">${escapeHtml(item.title)}</option>`).join('') : '<option value="">Crie um álbum primeiro</option>';
  };
  const openPhotoManager = async (albumId) => {
    const [{ data: album }, { data: photos, error }] = await Promise.all([supabase.from('albums').select('title').eq('id', albumId).single(), supabase.from('photos').select('*').eq('album_id', albumId).order('position')]);
    $('#photoManager').hidden = false; $('#photoManagerTitle').textContent = `Fotos · ${album?.title || 'álbum'}`;
    $('#photoAdminList').innerHTML = error ? '<p>Não foi possível carregar as fotos.</p>' : photos.length ? photos.map((photo) => `<article><img src="${storageUrl(photo.thumb_path || photo.storage_path)}" alt="${escapeHtml(photo.alt_text || '')}" loading="lazy" decoding="async"><button type="button" data-delete-photo="${photo.id}" data-paths="${escapeHtml(JSON.stringify([photo.storage_path, photo.thumb_path, photo.display_path, photo.original_path].filter(Boolean)))}" data-album="${albumId}">Remover foto</button></article>`).join('') : '<p>Este álbum ainda não tem fotos.</p>';
    $('#photoManager').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  await refresh();

  $('#eventForm').addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const { error } = await supabase.from('events').insert({ title: form.get('title'), description: form.get('description'), starts_at: new Date(form.get('starts_at')).toISOString(), location: form.get('location'), department: form.get('department'), published: form.get('published') === 'on' }); status(error ? 'Erro ao salvar evento.' : 'Evento salvo.'); if (!error) { event.currentTarget.reset(); refresh(); } });
  $('#albumForm').addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const { error } = await supabase.from('albums').insert({ title: form.get('title'), description: form.get('description'), event_date: form.get('event_date') || null, published: form.get('published') === 'on' }); status(error ? 'Erro ao criar álbum.' : 'Álbum criado. Agora selecione-o para enviar fotos.'); if (!error) { event.currentTarget.reset(); refresh(); } });
  const fileInput = $('#uploadForm input[type=file]'); const dropZone = $('#dropZone');
  ['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add('is-dragging'); }));
  ['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove('is-dragging'); }));
  dropZone.addEventListener('drop', (event) => { fileInput.files = event.dataTransfer.files; dropZone.firstChild.textContent = `${fileInput.files.length} foto(s) selecionada(s) — `; });
  fileInput.addEventListener('change', () => { if (fileInput.files.length) dropZone.firstChild.textContent = `${fileInput.files.length} foto(s) selecionada(s) — `; });
  $('#uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const albumId = form.get('album_id'); const files = [...form.getAll('photos')].filter((file) => file.size); const message = event.currentTarget.querySelector('.form-status');
    if (!albumId || !files.length) { message.textContent = 'Escolha um álbum e pelo menos uma foto.'; return; }
    let complete = 0; for (const file of files) { if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 52428800) { message.textContent = 'Use apenas JPG, PNG ou WebP de até 50 MB.'; return; } message.textContent = `Otimizando ${complete + 1} de ${files.length}…`; let variants; try { variants = await createGalleryVariants(file); } catch { message.textContent = 'Não foi possível otimizar esta imagem neste navegador.'; return; } const id = crypto.randomUUID(); const extension = file.name.split('.').pop().toLowerCase(); const paths = { thumb: `${albumId}/thumb/${id}.webp`, display: `${albumId}/display/${id}.webp`, original: `${albumId}/original/${id}.${extension}` }; message.textContent = `Enviando ${complete + 1} de ${files.length}…`; const uploads = await Promise.all([supabase.storage.from('gallery').upload(paths.thumb, variants.thumb, { contentType: 'image/webp' }), supabase.storage.from('gallery').upload(paths.display, variants.display, { contentType: 'image/webp' }), supabase.storage.from('gallery').upload(paths.original, variants.original, { contentType: file.type })]); if (uploads.some((result) => result.error)) { await supabase.storage.from('gallery').remove(Object.values(paths)); message.textContent = 'Falha no envio. Confira sua permissão e tente novamente.'; return; } const { error: dbError } = await supabase.from('photos').insert({ album_id: albumId, storage_path: paths.display, thumb_path: paths.thumb, display_path: paths.display, original_path: paths.original, alt_text: 'Foto do álbum', position: complete }); if (dbError) { await supabase.storage.from('gallery').remove(Object.values(paths)); message.textContent = 'Foto enviada, mas não foi registrada no álbum. Execute a migração do banco.'; return; } if (complete === 0) await supabase.from('albums').update({ cover_path: paths.thumb }).eq('id', albumId).is('cover_path', null); complete++; }
    message.textContent = `${complete} foto(s) enviada(s) com sucesso.`; event.currentTarget.reset(); dropZone.firstChild.textContent = 'Arraste fotos aqui ou clique para selecionar';
  });
  $('#closePhotoManager').onclick = () => { $('#photoManager').hidden = true; };
  document.addEventListener('click', async (event) => {
    const id = event.target.dataset.deleteEvent; const album = event.target.dataset.deleteAlbum; const manageAlbum = event.target.dataset.manageAlbum; const photo = event.target.dataset.deletePhoto;
    if (manageAlbum) { openPhotoManager(manageAlbum); return; }
    if (photo) { if (!confirm('Remover somente esta foto?')) return; const albumId = event.target.dataset.album; const paths = JSON.parse(event.target.dataset.paths); const storageError = (await supabase.storage.from('gallery').remove(paths)).error; const dbError = storageError ? storageError : (await supabase.from('photos').delete().eq('id', photo)).error; if (!dbError) { const [{ data: albumData }, { data: remainingPhotos }] = await Promise.all([supabase.from('albums').select('cover_path').eq('id', albumId).single(), supabase.from('photos').select('thumb_path,storage_path').eq('album_id', albumId).order('position').limit(1)]); if (paths.includes(albumData?.cover_path)) await supabase.from('albums').update({ cover_path: remainingPhotos?.[0]?.thumb_path || remainingPhotos?.[0]?.storage_path || null }).eq('id', albumId); } status(dbError ? 'Não foi possível remover a foto.' : 'Foto removida.'); if (!dbError) openPhotoManager(albumId); return; }
    if (!id && !album) return; if (!confirm('Excluir este item?')) return; const { error } = await supabase.from(id ? 'events' : 'albums').delete().eq('id', id || album); status(error ? 'Não foi possível excluir.' : 'Item excluído.'); refresh();
  });
}
