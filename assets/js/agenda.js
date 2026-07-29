import { escapeHtml, formatDateTime, isSupabaseConfigured, storageUrl, supabase } from './supabase-client.js';
const list = document.querySelector('#agendaList');
if (!isSupabaseConfigured) list.innerHTML = '<p class="empty-state">A agenda ficará disponível após a configuração do Supabase.</p>';
else {
  const { data, error } = await supabase.from('events').select('*').eq('published', true).gte('starts_at', new Date().toISOString()).order('starts_at');
  list.innerHTML = error ? '<p class="empty-state">Não foi possível carregar a agenda.</p>' : data.length ? data.map((event) => `<article class="event-card">${event.image_path ? `<img src="${storageUrl(event.image_path)}" alt="" loading="lazy">` : ''}<div><p class="card-kicker">${escapeHtml(event.department || 'Igreja')}</p><h2>${escapeHtml(event.title)}</h2><p class="event-meta"><time datetime="${event.starts_at}">${formatDateTime(event.starts_at)}</time>${event.location ? ` · ${escapeHtml(event.location)}` : ''}</p><p>${escapeHtml(event.description || '')}</p></div></article>`).join('') : '<p class="empty-state">Nenhum evento futuro cadastrado.</p>';
}
