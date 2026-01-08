import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/servers/[id]/server-databases/sync
 * Sendet Konfiguration an Agent und triggert Reload
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // Server mit Auth-Token laden
    const { data: server } = await adminSupabase
      .from('monitored_servers')
      .select('*')
      .eq('id', id)
      .single();

    if (!server) {
      return NextResponse.json({ error: 'Server nicht gefunden' }, { status: 404 });
    }

    // Alle aktiven Datenbanken fuer diesen Server laden (MIT Passwort)
    const { data: databases } = await adminSupabase
      .from('server_databases')
      .select('*')
      .eq('server_id', id)
      .eq('is_active', true)
      .order('name');

    // Config an Agent senden
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const agentUrl = `http://${server.host}:${server.agent_port}/config/reload`;
      const response = await fetch(agentUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${server.auth_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          databases: databases?.map(db => ({
            id: db.id,
            name: db.name,
            host: db.host,
            port: db.port,
            database: db.database_name,
            user: db.username,
            password: db.password,
            ssl: db.ssl_enabled
          })) || []
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({
          error: errorData.error || 'Agent-Fehler',
          success: false
        }, { status: 502 });
      }

      const result = await response.json();
      return NextResponse.json({
        success: true,
        databases_synced: databases?.length || 0,
        agent_response: result
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('[Server Databases Sync] Agent fetch error:', fetchError);
      return NextResponse.json({
        error: 'Server nicht erreichbar',
        success: false
      }, { status: 503 });
    }

  } catch (error) {
    console.error('[Server Databases Sync] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
