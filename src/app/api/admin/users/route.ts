import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/users
 * Lädt alle Benutzer (nur für Admins)
 */
export async function GET(request: NextRequest) {
  try {
    // Auth prüfen via NextAuth
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Admin-Rolle prüfen (aus JWT Session)
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      console.error('[Users API] Role check failed. Role:', userRole);
      return NextResponse.json(
        { error: 'Keine Admin-Berechtigung' },
        { status: 403 }
      );
    }

    // Query-Parameter
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '15');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (role && role !== 'all') {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Parallel query for data and count
    const [data, totalCount] = await Promise.all([
      prisma.profiles.findMany({
        where,
        include: {
          organization_members: {
            include: {
              organizations: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: page * limit,
        take: limit,
      }),
      prisma.profiles.count({ where }),
    ]);

    // Normalize organization memberships for frontend compatibility
    const users = data.map(user => ({
      ...user,
      organization_memberships: user.organization_members.map(m => ({
        id: m.id,
        role: m.role,
        organization: m.organizations,
      })),
      organization_members: undefined,
    }));

    return NextResponse.json({
      users,
      totalCount,
      page,
      limit,
    });

  } catch (error) {
    console.error('[Users API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
