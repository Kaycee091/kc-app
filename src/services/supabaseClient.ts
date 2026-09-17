import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read env variables safely (Vite exposes them via import.meta.env)
const supabaseUrl: string = (import.meta as any).env?.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey: string = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? '';

/**
 * True only when real Supabase credentials are configured.
 * The app falls back to local-storage / demo mode when false.
 */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Always create a real Supabase client (uses placeholder URL when unconfigured).
// The placeholder URL causes every supabase call to return a network error,
// which is caught gracefully in authService / supabaseAuthService.
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);
