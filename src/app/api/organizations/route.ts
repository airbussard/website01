import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/organizations
 * Laedt alle Organisationen des aktuellen Users
 */
export async function GET() {
  try {
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

    // Organisationen des Users laden (ueber organization_members)
    const memberships = await prisma.organization_members.findMany({
      where: { user_id: userId },
      include: {
        organizations: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo_url: true,
            street: true,
            postal_code: true,
            city: true,
            country: true,
            email: true,
            phone: true,
            website: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Daten umstrukturieren: Organization mit User-Rolle
    const organizations = memberships.map(item => ({
      ...item.organizations,
      user_role: item.role,
    }));

    return NextResponse.json({ organizations });

  } catch (error) {
    console.error('[Organizations API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations
 * Erstellt eine neue Organisation
 */
export async function POST(request: NextRequest) {
  try {
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
    const { name, street, postal_code, city, country, email, phone, website } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      );
    }

    // Organisation erstellen mit User als Owner in einer Transaktion
    const result = await prisma.$transaction(async (tx) => {
      // Organisation erstellen
      const org = await tx.organizations.create({
        data: {
          name: name.trim(),
          street,
          postal_code,
          city,
          country: country || 'Deutschland',
          email,
          phone,
          website,
          created_by: userId,
        },
      });

      // User als Owner hinzufuegen
      await tx.organization_members.create({
        data: {
          organization_id: org.id,
          user_id: userId,
          role: 'owner',
        },
      });

      return org;
    });

    return NextResponse.json({
      success: true,
      organization: result,
    });

  } catch (error) {
    console.error('[Organizations API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
