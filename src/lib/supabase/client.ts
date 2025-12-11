import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Use placeholder values during build time if env vars are not set
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  // Debug logging
  console.log('[Supabase Client] URL:', url);
  console.log('[Supabase Client] Has Anon Key:', !!anonKey && anonKey !== 'placeholder-anon-key');
  console.log('[Supabase Client] Is Placeholder:', url === 'https://placeholder.supabase.co');

  return createBrowserClient(url, anonKey);
}