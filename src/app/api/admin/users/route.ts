import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/users
 * Lädt alle Benutzer (nur für Admins)
 */
export async function GET(request: NextRequest) {
  try {
    // Auth prüfen
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Admin-Rolle prüfen
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Keine Admin-Berechtigung' },
        { status: 403 }
      );
    }

    // Query-Parameter
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '15');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Admin Client für Abfrage verwenden (umgeht RLS)
    const adminSupabase = createAdminSupabaseClient();

    let query = adminSupabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    // Filter by role
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    // Search
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Users API] Error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Benutzer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: data || [],
      totalCount: count || 0,
      page,
      limit,
    });

  } catch (error) {
    console.error('[Users API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
