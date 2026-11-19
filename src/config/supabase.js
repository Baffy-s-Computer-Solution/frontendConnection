import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'career_bucket';

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabasePublishableKey);

export const supabase =
  isSupabaseConfigured()
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

const buildHeaders = (headers = {}) => ({
  apikey: supabasePublishableKey,
  Authorization: `Bearer ${supabasePublishableKey}`,
  ...headers,
});

export const supabaseFetch = async (path, options = {}) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload.message || payload.error || response.statusText;
    throw new Error(message);
  }

  return payload;
};

export const getSupabasePublicUrl = (path) =>
  `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${encodeURIComponent(path).replace(/%2F/g, '/')}`;

export const supabaseConfig = {
  url: supabaseUrl,
  publishableKey: supabasePublishableKey,
  bucket: supabaseBucket,
  configured: isSupabaseConfigured(),
  client: supabase,
};

export default supabaseConfig;
