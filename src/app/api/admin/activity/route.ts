import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/activity
 * Lädt alle Aktivitäten (nur für Manager/Admins)
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

    // Admin Client erstellen (umgeht RLS)
    const adminSupabase = createAdminSupabaseClient();

    // Manager/Admin-Rolle prüfen (mit Admin-Client um RLS zu umgehen)
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || (profile?.role !== 'admin' && profile?.role !== 'manager')) {
      console.error('[Activity API] Role check failed:', profileError, 'Role:', profile?.role);
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Query-Parameter
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    const entityType = searchParams.get('entityType');
    const search = searchParams.get('search');

    let query = adminSupabase
      .from('activity_log')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url),
        project:pm_projects(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    // Filter by entity type
    if (entityType && entityType !== 'all') {
      query = query.eq('entity_type', entityType);
    }

    // Search (optional - in details oder user name)
    if (search) {
      // Suche wird clientseitig gefiltert, da Supabase keine nested search unterstützt
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Activity API] Error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Aktivitäten' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      activities: data || [],
      totalCount: count || 0,
      page,
      limit,
    });

  } catch (error) {
    console.error('[Activity API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
