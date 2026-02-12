import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/servers/[id]/server-databases
 * Liste aller Datenbank-Konfigurationen fuer einen Server
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

    // Datenbanken laden (ohne Passwort)
    const databases = await prisma.server_databases.findMany({
      where: { server_id: id },
      select: {
        id: true,
        server_id: true,
        name: true,
        host: true,
        port: true,
        database_name: true,
        username: true,
        ssl_enabled: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ databases });

  } catch (error) {
    console.error('[Server Databases API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/admin/servers/[id]/server-databases
 * Neue Datenbank-Konfiguration erstellen
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

    // Server existiert?
    const server = await prisma.monitored_servers.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!server) {
      return NextResponse.json({ error: 'Server nicht gefunden' }, { status: 404 });
    }

    const body = await request.json();
    const { name, host, port, database_name, username, password, ssl_enabled } = body;

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'Name, Username und Passwort erforderlich' }, { status: 400 });
    }

    const newDb = await prisma.server_databases.create({
      data: {
        server_id: id,
        name,
        host: host || 'localhost',
        port: port || 5432,
        database_name: database_name || 'postgres',
        username,
        password,
        ssl_enabled: ssl_enabled || false,
        is_active: true,
      },
      select: {
        id: true,
        server_id: true,
        name: true,
        host: true,
        port: true,
        database_name: true,
        username: true,
        ssl_enabled: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ database: newDb }, { status: 201 });

  } catch (error) {
    console.error('[Server Databases API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
