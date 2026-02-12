import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Alle aktiven Datenbanken fuer diesen Server laden (MIT Passwort)
    const databases = await prisma.server_databases.findMany({
      where: {
        server_id: id,
        is_active: true,
      },
      orderBy: { name: 'asc' },
    });

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
          databases: databases.map(db => ({
            id: db.id,
            name: db.name,
            host: db.host,
            port: db.port,
            database: db.database_name,
            user: db.username,
            password: db.password,
            ssl: db.ssl_enabled
          }))
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
        databases_synced: databases.length,
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
