import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/projects
 * Ruft Projekte basierend auf User-Rolle ab
 *
 * Query Parameter:
 * - status: Filter by status (optional)
 * - search: Search by name (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const userRole = (session.user as { role?: string }).role;
    if (!userId) {
      return NextResponse.json({ error: 'User ID nicht gefunden' }, { status: 401 });
    }

    const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';

    // Query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause based on role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let whereClause: any = {};

    if (!isManagerOrAdmin) {
      // Get user's project access
      const [orgMemberships, projectMemberships, clientProjects] = await Promise.all([
        prisma.organization_members.findMany({
          where: { user_id: userId },
          select: { organization_id: true },
        }),
        prisma.project_members.findMany({
          where: { user_id: userId },
          select: { project_id: true },
        }),
        prisma.pm_projects.findMany({
          where: { client_id: userId },
          select: { id: true },
        }),
      ]);

      const orgIds = orgMemberships.map(o => o.organization_id);
      const memberProjectIds = projectMemberships.map(p => p.project_id);
      const clientProjectIds = clientProjects.map(p => p.id);

      // Build OR filter for user access
      whereClause.OR = [
        { client_id: userId },
        ...(orgIds.length > 0 ? [{ organization_id: { in: orgIds } }] : []),
        ...(memberProjectIds.length > 0 ? [{ id: { in: memberProjectIds } }] : []),
        ...(clientProjectIds.length > 0 ? [{ id: { in: clientProjectIds } }] : []),
      ];

      // If no access at all, return empty
      if (whereClause.OR.length === 1) {
        whereClause = { client_id: userId };
      }
    }

    // Add status filter
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Add search filter
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const projects = await prisma.pm_projects.findMany({
      where: whereClause,
      include: {
        profiles_pm_projects_client_idToprofiles: {
          select: { id: true, full_name: true, avatar_url: true },
        },
        profiles_pm_projects_manager_idToprofiles: {
          select: { id: true, full_name: true, avatar_url: true },
        },
      },
      orderBy: { updated_at: 'desc' },
    });

    // Transform to expected format
    const transformedProjects = projects.map(p => ({
      ...p,
      client: p.profiles_pm_projects_client_idToprofiles,
      manager: p.profiles_pm_projects_manager_idToprofiles,
      profiles_pm_projects_client_idToprofiles: undefined,
      profiles_pm_projects_manager_idToprofiles: undefined,
    }));

    return NextResponse.json({ projects: transformedProjects });
  } catch (error) {
    console.error('[Projects API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/projects
 * Erstellt ein neues Projekt (nur Manager/Admin)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const userRole = (session.user as { role?: string }).role;
    if (!userId) {
      return NextResponse.json({ error: 'User ID nicht gefunden' }, { status: 401 });
    }

    if (userRole !== 'manager' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      client_id,
      organization_id,
      manager_id,
      status,
      priority,
      start_date,
      due_date,
      budget,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name ist erforderlich' }, { status: 400 });
    }

    const project = await prisma.pm_projects.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        client_id: client_id || null,
        organization_id: organization_id || null,
        manager_id: manager_id || userId,
        status: status || 'planning',
        priority: priority || 'medium',
        start_date: start_date ? new Date(start_date) : null,
        due_date: due_date ? new Date(due_date) : null,
        budget: budget || null,
        budget_used: 0,
      },
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        project_id: project.id,
        user_id: userId,
        action: 'project_created',
        entity_type: 'project',
        entity_id: project.id,
        details: { name: project.name } as object,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('[Projects API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
