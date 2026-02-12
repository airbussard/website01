import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/organizations/[id]/members
 * Fuegt ein Mitglied zur Organisation hinzu (per E-Mail)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID nicht gefunden' },
        { status: 401 }
      );
    }

    // Pruefen ob User Admin/Owner der Organisation ist
    const membership = await prisma.organization_members.findFirst({
      where: { organization_id: organizationId, user_id: userId },
      select: { role: true },
    });

    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isOrgAdmin = membership?.role === 'owner' || membership?.role === 'admin';
    const isSystemAdmin = profile?.role === 'admin' || profile?.role === 'manager';

    if (!isOrgAdmin && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung zum Hinzufuegen von Mitgliedern' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role = 'member' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail ist erforderlich' },
        { status: 400 }
      );
    }

    // Valide Rollen pruefen (owner kann nur vom aktuellen owner vergeben werden)
    const validRoles = ['member', 'admin'];
    if (membership?.role === 'owner') {
      validRoles.push('owner');
    }
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Ungueltige Rolle' },
        { status: 400 }
      );
    }

    // User anhand E-Mail finden
    const targetUser = await prisma.profiles.findFirst({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, full_name: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Benutzer mit dieser E-Mail nicht gefunden. Der Benutzer muss sich zuerst registrieren.' },
        { status: 404 }
      );
    }

    // Pruefen ob bereits Mitglied
    const existingMember = await prisma.organization_members.findFirst({
      where: { organization_id: organizationId, user_id: targetUser.id },
      select: { id: true },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Benutzer ist bereits Mitglied dieser Organisation' },
        { status: 400 }
      );
    }

    // Mitglied hinzufuegen
    const newMember = await prisma.organization_members.create({
      data: {
        organization_id: organizationId,
        user_id: targetUser.id,
        role,
      },
      include: {
        profiles: {
          select: { id: true, email: true, full_name: true, first_name: true, last_name: true, avatar_url: true },
        },
      },
    });

    // Transform response
    const transformedMember = {
      id: newMember.id,
      role: newMember.role,
      created_at: newMember.created_at,
      user: newMember.profiles,
    };

    return NextResponse.json({
      success: true,
      member: transformedMember,
    });

  } catch (error) {
    console.error('[Org Members API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]/members
 * Entfernt ein Mitglied aus der Organisation
 * Body: { user_id: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID nicht gefunden' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { user_id: targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'user_id ist erforderlich' },
        { status: 400 }
      );
    }

    // Eigene Mitgliedschaft pruefen
    const membership = await prisma.organization_members.findFirst({
      where: { organization_id: organizationId, user_id: userId },
      select: { role: true },
    });

    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isOrgAdmin = membership?.role === 'owner' || membership?.role === 'admin';
    const isSystemAdmin = profile?.role === 'admin' || profile?.role === 'manager';
    const isSelf = targetUserId === userId;

    // User kann sich selbst entfernen, oder Admin kann andere entfernen
    if (!isSelf && !isOrgAdmin && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Pruefen ob Target der Owner ist - Owner kann nicht entfernt werden
    const targetMembership = await prisma.organization_members.findFirst({
      where: { organization_id: organizationId, user_id: targetUserId },
      select: { role: true },
    });

    if (targetMembership?.role === 'owner' && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Der Owner kann nicht entfernt werden. Uebertragen Sie zuerst die Ownership.' },
        { status: 400 }
      );
    }

    // Mitglied entfernen
    await prisma.organization_members.deleteMany({
      where: { organization_id: organizationId, user_id: targetUserId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Org Members API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizations/[id]/members
 * Aendert die Rolle eines Mitglieds
 * Body: { user_id: string, role: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID nicht gefunden' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { user_id: targetUserId, role: newRole } = body;

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: 'user_id und role sind erforderlich' },
        { status: 400 }
      );
    }

    // Eigene Mitgliedschaft pruefen
    const membership = await prisma.organization_members.findFirst({
      where: { organization_id: organizationId, user_id: userId },
      select: { role: true },
    });

    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isOwner = membership?.role === 'owner';
    const isSystemAdmin = profile?.role === 'admin';

    // Nur Owner oder System-Admin koennen Rollen aendern
    if (!isOwner && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Nur der Owner kann Rollen aendern' },
        { status: 403 }
      );
    }

    // Valide Rollen
    if (!['owner', 'admin', 'member'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Ungueltige Rolle' },
        { status: 400 }
      );
    }

    // Wenn Owner-Rolle uebertragen wird, aktuellen Owner zu Admin machen
    if (newRole === 'owner' && targetUserId !== userId) {
      await prisma.organization_members.updateMany({
        where: { organization_id: organizationId, user_id: userId },
        data: { role: 'admin' },
      });
    }

    // Rolle aktualisieren
    await prisma.organization_members.updateMany({
      where: { organization_id: organizationId, user_id: targetUserId },
      data: { role: newRole },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Org Members API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
