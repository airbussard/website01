import { createBrowserClient } from '@supabase/ssr';

// Singleton instance to prevent re-renders and infinite loops
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Use placeholder values during build time if env vars are not set
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  supabaseClient = createBrowserClient(url, anonKey);
  return supabaseClient;
}