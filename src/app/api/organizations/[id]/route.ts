import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/organizations/[id]
 * Laedt eine einzelne Organisation mit Mitgliedern
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Organisation laden
    const org = await prisma.organizations.findUnique({
      where: { id },
    });

    if (!org) {
      return NextResponse.json(
        { error: 'Organisation nicht gefunden' },
        { status: 404 }
      );
    }

    // Mitglieder laden
    const membersRaw = await prisma.organization_members.findMany({
      where: { organization_id: id },
      include: {
        profiles: {
          select: { id: true, email: true, full_name: true, first_name: true, last_name: true, avatar_url: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    // Transform members
    const members = membersRaw.map(m => ({
      id: m.id,
      role: m.role,
      created_at: m.created_at,
      user: m.profiles,
    }));

    // User-Rolle in dieser Organisation
    const userMembership = members.find(m => m.user?.id === userId);

    return NextResponse.json({
      organization: {
        ...org,
        members: members,
        member_count: members.length,
      },
      user_role: userMembership?.role || null,
    });

  } catch (error) {
    console.error('[Organization API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizations/[id]
 * Aktualisiert eine Organisation (nur fuer owner/admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Pruefen ob User Admin/Owner ist
    const membership = await prisma.organization_members.findFirst({
      where: { organization_id: id, user_id: userId },
      select: { role: true },
    });

    // Auch System-Admins duerfen aendern
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isOrgAdmin = membership?.role === 'owner' || membership?.role === 'admin';
    const isSystemAdmin = profile?.role === 'admin' || profile?.role === 'manager';

    if (!isOrgAdmin && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, street, postal_code, city, country, email, phone, website, logo_url } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (street !== undefined) updateData.street = street;
    if (postal_code !== undefined) updateData.postal_code = postal_code;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (logo_url !== undefined) updateData.logo_url = logo_url;

    const updated = await prisma.organizations.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      organization: updated,
    });

  } catch (error) {
    console.error('[Organization API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]
 * Loescht eine Organisation (nur fuer owner)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Pruefen ob User Owner ist
    const membership = await prisma.organization_members.findFirst({
      where: { organization_id: id, user_id: userId },
      select: { role: true },
    });

    // Auch System-Admins duerfen loeschen
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isOwner = membership?.role === 'owner';
    const isSystemAdmin = profile?.role === 'admin';

    if (!isOwner && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Nur der Owner kann die Organisation loeschen' },
        { status: 403 }
      );
    }

    // Organisation loeschen (CASCADE loescht auch members)
    await prisma.organizations.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Organization API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
