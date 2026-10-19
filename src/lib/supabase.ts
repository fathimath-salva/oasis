import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { createTimeoutFetch } from './authRequests';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const validateConfiguration = (): string | null => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable account and database features.';
  }
  try {
    const parsed = new URL(supabaseUrl);
    const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if ((parsed.protocol !== 'https:' && !(isLocal && parsed.protocol === 'http:')) || !parsed.hostname) {
      return 'Supabase URL must use HTTPS (HTTP is allowed for localhost development).';
    }
  } catch {
    return 'VITE_SUPABASE_URL is not a valid URL.';
  }
  if (/your-project-id|mock-oasis|mock-anon-key/i.test(`${supabaseUrl} ${supabaseAnonKey}`)) {
    return 'Supabase configuration still contains a placeholder value.';
  }
  if (supabaseAnonKey.startsWith('sb_secret_')) {
    return 'A Supabase secret key cannot be used in browser configuration. Use the public publishable/anon key.';
  }
  if (supabaseAnonKey.startsWith('eyJ')) {
    try {
      const payload = supabaseAnonKey.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
      const decoded: unknown = payload ? JSON.parse(atob(payload)) : null;
      if (typeof decoded === 'object' && decoded !== null && 'role' in decoded && decoded.role !== 'anon') {
        return 'The browser key is not an anon key. Use the public publishable/anon key.';
      }
    } catch {
      return 'VITE_SUPABASE_ANON_KEY is not a valid public key.';
    }
  } else if (!supabaseAnonKey.startsWith('sb_publishable_')) {
    return 'VITE_SUPABASE_ANON_KEY must be a public publishable/anon key.';
  }
  return null;
};

export const supabaseConfigurationError = validateConfiguration();
export const isSupabaseConfigured = supabaseConfigurationError === null;

// Configuration is optional at build time so the existing localStorage-backed
// public site can still build and run. No fake client or credentials are used.
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      // Supabase JS currently defaults to implicit. Keep it explicit: recovery
      // links must work across devices, while PKCE verifiers are browser-local.
      // The SDK consumes the implicit URL callback and emits PASSWORD_RECOVERY.
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
      global: { fetch: createTimeoutFetch(fetch) },
    })
  : null;

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabase) throw new Error(supabaseConfigurationError ?? 'Supabase client is unavailable.');
  return supabase;
};
