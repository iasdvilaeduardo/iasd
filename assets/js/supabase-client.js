import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const config = window.IASD_CONFIG || {};
export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;

export function storageUrl(path) {
  if (!path || !supabase) return '';
  return supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl;
}

export function storageDownloadUrl(path) {
  if (!path || !supabase) return '';
  return supabase.storage.from('gallery').getPublicUrl(path, { download: true }).data.publicUrl;
}

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

export function formatDate(value, options = { dateStyle: 'medium' }) {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR', options).format(new Date(`${value}T00:00:00`));
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
