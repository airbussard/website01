import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/servers
 * Liste aller ueberwachten Server
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // Server laden
    const servers = await prisma.monitored_servers.findMany({
      orderBy: { name: 'asc' },
    });

    // Auth-Token aus Response entfernen (Sicherheit)
    const safeServers = servers.map(s => ({
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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
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

    const server = await prisma.monitored_servers.create({
      data: {
        name,
        host,
        agent_port,
        auth_token,
        is_active: true,
      },
    });

    return NextResponse.json({
      server: { ...server, auth_token: '***' }
    }, { status: 201 });
  } catch (error) {
    console.error('[Servers API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
