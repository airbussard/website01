import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/users/[id]/organizations
 * Laedt alle Organisationen eines Users
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;

    // Auth pruefen via NextAuth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // User-Organisationen laden
    const memberships = await prisma.organization_members.findMany({
      where: { user_id: userId },
      include: {
        organizations: {
          select: { id: true, name: true, slug: true, logo_url: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    const organizations = memberships.map(m => ({
      membership_id: m.id,
      role: m.role,
      joined_at: m.created_at,
      organization: m.organizations,
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('[User Orgs API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/admin/users/[id]/organizations
 * Fuegt User zu einer Organisation hinzu
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { organization_id, role = 'member' } = body;

    if (!organization_id) {
      return NextResponse.json({ error: 'organization_id ist erforderlich' }, { status: 400 });
    }

    if (!['member', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Ungueltige Rolle (member oder admin)' }, { status: 400 });
    }

    // Auth pruefen via NextAuth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // Pruefen ob bereits Mitglied
    const existing = await prisma.organization_members.findFirst({
      where: { organization_id, user_id: userId },
    });

    if (existing) {
      return NextResponse.json({ error: 'User ist bereits Mitglied dieser Organisation' }, { status: 400 });
    }

    // Mitgliedschaft erstellen
    const membership = await prisma.organization_members.create({
      data: { organization_id, user_id: userId, role },
      include: {
        organizations: {
          select: { id: true, name: true, slug: true, logo_url: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      membership: {
        membership_id: membership.id,
        role: membership.role,
        joined_at: membership.created_at,
        organization: membership.organizations,
      },
    });
  } catch (error) {
    console.error('[User Orgs API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id]/organizations
 * Entfernt User aus einer Organisation
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { organization_id } = body;

    if (!organization_id) {
      return NextResponse.json({ error: 'organization_id ist erforderlich' }, { status: 400 });
    }

    // Auth pruefen via NextAuth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // Pruefen ob User Owner ist
    const membership = await prisma.organization_members.findFirst({
      where: { organization_id, user_id: userId },
      select: { role: true },
    });

    if (membership?.role === 'owner') {
      return NextResponse.json(
        { error: 'Der Owner kann nicht entfernt werden. Uebertragen Sie zuerst die Ownership.' },
        { status: 400 }
      );
    }

    // Mitgliedschaft loeschen
    await prisma.organization_members.deleteMany({
      where: { organization_id, user_id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[User Orgs API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users/[id]/organizations
 * Aendert die Rolle eines Users in einer Organisation
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { organization_id, role } = body;

    if (!organization_id || !role) {
      return NextResponse.json({ error: 'organization_id und role sind erforderlich' }, { status: 400 });
    }

    if (!['member', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Ungueltige Rolle (member oder admin)' }, { status: 400 });
    }

    // Auth pruefen via NextAuth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // Pruefen ob User Owner ist
    const currentMembership = await prisma.organization_members.findFirst({
      where: { organization_id, user_id: userId },
      select: { role: true },
    });

    if (currentMembership?.role === 'owner') {
      return NextResponse.json({ error: 'Die Owner-Rolle kann nicht geaendert werden' }, { status: 400 });
    }

    // Rolle aktualisieren
    await prisma.organization_members.updateMany({
      where: { organization_id, user_id: userId },
      data: { role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[User Orgs API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
