import { escapeHtml, formatDateTime, isSupabaseConfigured, supabase } from './supabase-client.js';
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
    $('#albumAdminList').innerHTML = albums.length ? albums.map((item) => `<div><strong>${escapeHtml(item.title)}</strong><span>${item.event_date || ''}</span><button data-delete-album="${item.id}">Excluir</button></div>`).join('') : '<p>Nenhum álbum.</p>';
    $('#photoAlbum').innerHTML = albums.length ? albums.map((item) => `<option value="${item.id}">${escapeHtml(item.title)}</option>`).join('') : '<option value="">Crie um álbum primeiro</option>';
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
    event.preventDefault(); const form = new FormData(event.currentTarget); const albumId = form.get('album_id'); const files = [...form.getAll('photos')].filter((file) => file.size);
    const message = event.currentTarget.querySelector('.form-status'); if (!albumId || !files.length) { message.textContent = 'Escolha um álbum e pelo menos uma foto.'; return; }
    let complete = 0; for (const file of files) { if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 10485760) { message.textContent = 'Use apenas JPG, PNG ou WebP de até 10 MB.'; return; } const extension = file.name.split('.').pop().toLowerCase(); const path = `${albumId}/${crypto.randomUUID()}.${extension}`; message.textContent = `Enviando ${complete + 1} de ${files.length}…`; const { error: uploadError } = await supabase.storage.from('gallery').upload(path, file, { contentType: file.type }); if (uploadError) { message.textContent = 'Falha no envio. Confira sua permissão e tente novamente.'; return; } const { error: dbError } = await supabase.from('photos').insert({ album_id: albumId, storage_path: path, alt_text: `Foto do álbum`, position: complete }); if (dbError) { message.textContent = 'Foto enviada, mas não foi registrada no álbum.'; return; } if (complete === 0) await supabase.from('albums').update({ cover_path: path }).eq('id', albumId).is('cover_path', null); complete++; }
    message.textContent = `${complete} foto(s) enviada(s) com sucesso.`; event.currentTarget.reset(); dropZone.firstChild.textContent = 'Arraste fotos aqui ou clique para selecionar';
  });
  document.addEventListener('click', async (event) => { const id = event.target.dataset.deleteEvent; const album = event.target.dataset.deleteAlbum; if (!id && !album) return; if (!confirm('Excluir este item?')) return; const { error } = await supabase.from(id ? 'events' : 'albums').delete().eq('id', id || album); status(error ? 'Não foi possível excluir.' : 'Item excluído.'); refresh(); });
}
