import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string; dbId: string }>;
}

/**
 * GET /api/admin/servers/[id]/server-databases/[dbId]
 * Einzelne Datenbank-Konfiguration laden
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, dbId } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    const database = await prisma.server_databases.findFirst({
      where: {
        id: dbId,
        server_id: id,
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

    if (!database) {
      return NextResponse.json({ error: 'Datenbank nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ database });

  } catch (error) {
    console.error('[Server Databases API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/servers/[id]/server-databases/[dbId]
 * Datenbank-Konfiguration aktualisieren
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, dbId } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    const body = await request.json();
    const { name, host, port, database_name, username, password, ssl_enabled, is_active } = body;

    // Update-Objekt erstellen (Passwort nur wenn angegeben)
    const updateData: {
      name?: string;
      host?: string;
      port?: number;
      database_name?: string;
      username?: string;
      password?: string;
      ssl_enabled?: boolean;
      is_active?: boolean;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (host !== undefined) updateData.host = host;
    if (port !== undefined) updateData.port = port;
    if (database_name !== undefined) updateData.database_name = database_name;
    if (username !== undefined) updateData.username = username;
    if (password !== undefined && password !== '') updateData.password = password;
    if (ssl_enabled !== undefined) updateData.ssl_enabled = ssl_enabled;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Keine Aenderungen' }, { status: 400 });
    }

    // Verify database belongs to this server first
    const existing = await prisma.server_databases.findFirst({
      where: {
        id: dbId,
        server_id: id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Datenbank nicht gefunden' }, { status: 404 });
    }

    const database = await prisma.server_databases.update({
      where: { id: dbId },
      data: updateData,
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

    return NextResponse.json({ database });

  } catch (error) {
    console.error('[Server Databases API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/servers/[id]/server-databases/[dbId]
 * Datenbank-Konfiguration loeschen
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, dbId } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // Verify database belongs to this server first
    const existing = await prisma.server_databases.findFirst({
      where: {
        id: dbId,
        server_id: id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Datenbank nicht gefunden' }, { status: 404 });
    }

    await prisma.server_databases.delete({
      where: { id: dbId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Server Databases API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
