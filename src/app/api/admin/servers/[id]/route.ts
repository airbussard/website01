import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/servers/[id]
 * Server-Details
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

    const server = await prisma.monitored_servers.findUnique({
      where: { id },
    });

    if (!server) {
      return NextResponse.json({ error: 'Server nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({
      server: { ...server, auth_token: '***' }
    });
  } catch (error) {
    console.error('[Servers API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/servers/[id]
 * Server bearbeiten
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const { name, host, agent_port, auth_token, is_active } = body;

    const updateData: {
      name?: string;
      host?: string;
      agent_port?: number;
      auth_token?: string;
      is_active?: boolean;
      updated_at: Date;
    } = { updated_at: new Date() };

    if (name !== undefined) updateData.name = name;
    if (host !== undefined) updateData.host = host;
    if (agent_port !== undefined) updateData.agent_port = agent_port;
    if (auth_token !== undefined) updateData.auth_token = auth_token;
    if (is_active !== undefined) updateData.is_active = is_active;

    const server = await prisma.monitored_servers.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      server: { ...server, auth_token: '***' }
    });
  } catch (error) {
    console.error('[Servers API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/servers/[id]
 * Server loeschen
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    await prisma.monitored_servers.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Servers API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
