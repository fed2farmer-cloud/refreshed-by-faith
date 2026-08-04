import { createClient } from '@supabase/supabase-js';

const projectUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/(rest\/v1)?\/?$/, '');
const publicKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

export const supabaseConfig = {
  hasUrl: Boolean(projectUrl),
  hasKey: Boolean(publicKey),
};

export const supabase = projectUrl && publicKey
  ? createClient(projectUrl, publicKey)
  : null;
