import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project-id')
);

// Fallback dummy client if credentials aren't provided yet so app doesn't crash on import
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock-oasis.supabase.co', 'mock-anon-key');

if (!isSupabaseConfigured) {
  console.info(
    '%c[THE OASIS] Running in persistent local database mode. Supabase credentials can be added to .env anytime for cloud sync.',
    'color: #A8B7A0; font-weight: bold; background: #26352A; padding: 4px 8px; border-radius: 4px;'
  );
}
