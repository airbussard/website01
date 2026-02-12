import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/servers/[id]/containers
 * Proxy zu Agent /containers - Holt Container-Liste
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // Server mit Auth-Token laden
    const server = await prisma.monitored_servers.findUnique({
      where: { id },
    });

    if (!server) {
      return NextResponse.json({ error: 'Server nicht gefunden' }, { status: 404 });
    }

    // Agent anfragen mit Timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const agentUrl = `http://${server.host}:${server.agent_port}/containers`;
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
          containers: []
        }, { status: 502 });
      }

      const data = await response.json();
      return NextResponse.json({ containers: data.containers || [] });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('[Servers API] Agent fetch error:', fetchError);
      return NextResponse.json({
        error: 'Server nicht erreichbar',
        containers: []
      }, { status: 503 });
    }

  } catch (error) {
    console.error('[Servers API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
