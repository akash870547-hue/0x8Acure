import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare global {
  interface Window {
    SUPABASE_CONFIG?: { url?: string; anonKey?: string };
  }
}

const url = import.meta.env.VITE_SUPABASE_URL || window.SUPABASE_CONFIG?.url;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || window.SUPABASE_CONFIG?.anonKey;

export const supabaseClient: SupabaseClient | null = url && anonKey
  ? createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  })
  : null;
