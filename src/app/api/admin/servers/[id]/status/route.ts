import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/servers/[id]/status
 * Proxy zu Agent /status - Holt Live-Stats vom Server
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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
    const { data: server, error: serverError } = await adminSupabase
      .from('monitored_servers')
      .select('*')
      .eq('id', id)
      .single();

    if (serverError || !server) {
      return NextResponse.json({ error: 'Server nicht gefunden' }, { status: 404 });
    }

    // Agent anfragen mit Timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const agentUrl = `http://${server.host}:${server.agent_port}/status`;
      const response = await fetch(agentUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${server.auth_token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json({
          error: 'Agent-Fehler',
          online: false,
          agentStatus: response.status
        }, { status: 502 });
      }

      const status = await response.json();
      return NextResponse.json({ status, online: true });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('[Servers API] Agent fetch error:', fetchError);
      return NextResponse.json({
        error: 'Server nicht erreichbar',
        online: false
      }, { status: 503 });
    }

  } catch (error) {
    console.error('[Servers API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
