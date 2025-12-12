import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client mit Service-Role Key
 * Umgeht RLS-Policies - nur für Server-seitige Admin-Operationen verwenden!
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
