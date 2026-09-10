let createClientFunc: any;

try {
  const supabaseModule = require('@supabase/supabase-js');
  createClientFunc = supabaseModule.createClient;
} catch (e) {
  createClientFunc = (url: string, key: string) => ({
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  });
}

// Read env variables safely
const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  !supabaseUrl.includes('placeholder')
);

// Fallback dummy client if no keys provided so app does not crash
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-anon-key';

export const supabase: any = createClientFunc(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabaseAnonKey : fallbackKey
);
