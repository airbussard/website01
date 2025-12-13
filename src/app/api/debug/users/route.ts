import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

// Build-Timestamp um zu verifizieren dass neuer Code läuft
const BUILD_TIME = new Date().toISOString();

/**
 * DEBUG ENDPOINT - Temporär zum Debuggen des Nutzerverwaltungs-Problems
 *
 * Aufruf: https://getemergence.com/api/debug/users
 *
 * WICHTIG: Nach Debugging wieder entfernen!
 */
export async function GET() {
  const debug: Record<string, unknown> = {
    buildTime: BUILD_TIME,
    requestTime: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || 'MISSING',
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    },
  };

  try {
    const adminSupabase = createAdminSupabaseClient();
    debug.adminClientCreated = true;

    // Direkte Abfrage ALLER Profile ohne jegliche Einschränkung
    const { data, error, count } = await adminSupabase
      .from('profiles')
      .select('id, email, role, full_name, created_at', { count: 'exact' });

    debug.queryResult = {
      success: !error,
      error: error ? { message: error.message, code: error.code, details: error.details } : null,
      totalCount: count,
      returnedRows: data?.length || 0,
      users: data?.map(u => ({
        id: u.id.substring(0, 8) + '...',
        email: u.email,
        role: u.role,
        name: u.full_name,
        created: u.created_at
      })),
    };
  } catch (err) {
    debug.adminClientCreated = false;
    debug.catchError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(debug, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
