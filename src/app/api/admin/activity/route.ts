import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/activity
 * Lädt alle Aktivitäten (nur für Manager/Admins)
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

    // Manager/Admin-Rolle prüfen (aus JWT Session)
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin' && userRole !== 'manager') {
      console.error('[Activity API] Role check failed. Role:', userRole);
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Query-Parameter
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    const entityType = searchParams.get('entityType');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (entityType && entityType !== 'all') {
      where.entity_type = entityType;
    }

    // Parallel query for data and count
    const [data, totalCount] = await Promise.all([
      prisma.activity_log.findMany({
        where,
        include: {
          profiles: {
            select: { id: true, full_name: true, avatar_url: true },
          },
          pm_projects: {
            select: { id: true, name: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: page * limit,
        take: limit,
      }),
      prisma.activity_log.count({ where }),
    ]);

    // Transform for frontend compatibility
    const activities = data.map(activity => ({
      ...activity,
      user: activity.profiles,
      project: activity.pm_projects,
      profiles: undefined,
      pm_projects: undefined,
    }));

    return NextResponse.json({
      activities,
      totalCount,
      page,
      limit,
    });

  } catch (error) {
    console.error('[Activity API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
