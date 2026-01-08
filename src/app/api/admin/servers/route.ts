import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/servers
 * Liste aller ueberwachten Server
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();

    // Admin-Rolle pruefen
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // Server laden
    const { data: servers, error } = await adminSupabase
      .from('monitored_servers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[Servers API] Error:', error);
      return NextResponse.json({ error: 'Fehler beim Laden der Server' }, { status: 500 });
    }

    // Auth-Token aus Response entfernen (Sicherheit)
    const safeServers = (servers || []).map(s => ({
      ...s,
      auth_token: '***'
    }));

    return NextResponse.json({ servers: safeServers });
  } catch (error) {
    console.error('[Servers API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/admin/servers
 * Neuen Server hinzufuegen
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();

    // Admin-Rolle pruefen
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    const body = await request.json();
    const { name, host, agent_port = 9999, auth_token } = body;

    if (!name || !host || !auth_token) {
      return NextResponse.json(
        { error: 'name, host und auth_token sind erforderlich' },
        { status: 400 }
      );
    }

    const { data: server, error } = await adminSupabase
      .from('monitored_servers')
      .insert({
        name,
        host,
        agent_port,
        auth_token,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('[Servers API] Insert error:', error);
      return NextResponse.json({ error: 'Fehler beim Erstellen des Servers' }, { status: 500 });
    }

    return NextResponse.json({
      server: { ...server, auth_token: '***' }
    }, { status: 201 });
  } catch (error) {
    console.error('[Servers API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
