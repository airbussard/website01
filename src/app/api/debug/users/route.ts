import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * DEBUG ENDPOINT - Temporär zum Debuggen des RLS-Problems
 * Zeigt ENV-Status und direkte DB-Abfrage ohne Auth-Check
 *
 * WICHTIG: Nach Debugging wieder entfernen!
 */
export async function GET() {
  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) || 'MISSING',
    },
  };

  try {
    const adminSupabase = createAdminSupabaseClient();
    debug.adminClientCreated = true;

    // Direkte Abfrage aller Profile ohne Auth-Check
    const { data, error, count } = await adminSupabase
      .from('profiles')
      .select('id, email, role, full_name', { count: 'exact' });

    debug.queryResult = {
      success: !error,
      error: error?.message,
      errorCode: error?.code,
      count: count,
      dataLength: data?.length || 0,
      users: data?.map(u => ({
        email: u.email,
        role: u.role,
        name: u.full_name
      })),
    };
  } catch (err) {
    debug.adminClientCreated = false;
    debug.error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(debug);
}
