import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string; containerId: string }>;
}

/**
 * GET /api/admin/servers/[id]/containers/[containerId]
 * Container-Details vom Agent
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, containerId } = await params;
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

    const { data: server } = await adminSupabase
      .from('monitored_servers')
      .select('*')
      .eq('id', id)
      .single();

    if (!server) {
      return NextResponse.json({ error: 'Server nicht gefunden' }, { status: 404 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const agentUrl = `http://${server.host}:${server.agent_port}/containers/${containerId}`;
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
        return NextResponse.json({ error: 'Container nicht gefunden' }, { status: 404 });
      }

      const container = await response.json();
      return NextResponse.json({ container });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('[Servers API] Agent fetch error:', fetchError);
      return NextResponse.json({ error: 'Server nicht erreichbar' }, { status: 503 });
    }

  } catch (error) {
    console.error('[Servers API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/admin/servers/[id]/containers/[containerId]?action=restart|limits|logs
 * Container-Aktionen
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, containerId } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action || !['restart', 'limits', 'logs'].includes(action)) {
      return NextResponse.json(
        { error: 'Ungueltige Aktion. Erlaubt: restart, limits, logs' },
        { status: 400 }
      );
    }

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

    const { data: server } = await adminSupabase
      .from('monitored_servers')
      .select('*')
      .eq('id', id)
      .single();

    if (!server) {
      return NextResponse.json({ error: 'Server nicht gefunden' }, { status: 404 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), action === 'logs' ? 10000 : 30000);

    try {
      let agentUrl: string;
      let method: string;
      let body: string | undefined;

      switch (action) {
        case 'restart':
          agentUrl = `http://${server.host}:${server.agent_port}/containers/${containerId}/restart`;
          method = 'POST';
          break;

        case 'limits':
          agentUrl = `http://${server.host}:${server.agent_port}/containers/${containerId}/limits`;
          method = 'POST';
          const requestBody = await request.json();
          body = JSON.stringify(requestBody);
          break;

        case 'logs':
          const tail = searchParams.get('tail') || '100';
          agentUrl = `http://${server.host}:${server.agent_port}/containers/${containerId}/logs?tail=${tail}`;
          method = 'GET';
          break;

        default:
          return NextResponse.json({ error: 'Ungueltige Aktion' }, { status: 400 });
      }

      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${server.auth_token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      };

      if (body) {
        fetchOptions.body = body;
      }

      const response = await fetch(agentUrl, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({
          error: errorData.error || 'Agent-Fehler',
          details: errorData
        }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('[Servers API] Agent fetch error:', fetchError);
      return NextResponse.json({ error: 'Server nicht erreichbar' }, { status: 503 });
    }

  } catch (error) {
    console.error('[Servers API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
