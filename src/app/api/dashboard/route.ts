import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/dashboard
 * Ruft Dashboard-Statistiken und aktuelle Daten ab
 */
export async function GET() {
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

    // Projekte fuer diesen User laden (basierend auf Rolle)
    let projectIds: string[] = [];

    if (isManagerOrAdmin) {
      // Manager/Admin sehen alle Projekte
      const allProjects = await prisma.pm_projects.findMany({
        select: { id: true },
      });
      projectIds = allProjects.map(p => p.id);
    } else {
      // Normale User: client_id, organization_id oder project_member
      const [orgMemberships, projectMemberships, clientProjects] = await Promise.all([
        // User's organizations
        prisma.organization_members.findMany({
          where: { user_id: userId },
          select: { organization_id: true },
        }),
        // User's project memberships
        prisma.project_members.findMany({
          where: { user_id: userId },
          select: { project_id: true },
        }),
        // Projects where user is client
        prisma.pm_projects.findMany({
          where: { client_id: userId },
          select: { id: true },
        }),
      ]);

      const orgIds = orgMemberships.map(o => o.organization_id);

      // Projects from organizations
      const orgProjects = orgIds.length > 0
        ? await prisma.pm_projects.findMany({
            where: { organization_id: { in: orgIds } },
            select: { id: true },
          })
        : [];

      // Combine all project IDs (unique)
      const allIds = new Set<string>();
      clientProjects.forEach(p => allIds.add(p.id));
      projectMemberships.forEach(p => allIds.add(p.project_id));
      orgProjects.forEach(p => allIds.add(p.id));
      projectIds = Array.from(allIds);
    }

    // Stats parallel laden
    const [
      totalProjects,
      activeProjects,
      pendingTasks,
      overdueTasks,
      pendingContracts,
      recentProjects,
      upcomingTasks,
      recentActivity,
    ] = await Promise.all([
      // Total projects
      isManagerOrAdmin
        ? prisma.pm_projects.count()
        : prisma.pm_projects.count({
            where: { id: { in: projectIds } },
          }),
      // Active projects
      isManagerOrAdmin
        ? prisma.pm_projects.count({ where: { status: 'active' } })
        : prisma.pm_projects.count({
            where: { id: { in: projectIds }, status: 'active' },
          }),
      // Pending tasks
      isManagerOrAdmin
        ? prisma.tasks.count({
            where: { status: { in: ['todo', 'in_progress'] } },
          })
        : prisma.tasks.count({
            where: {
              assignee_id: userId,
              status: { in: ['todo', 'in_progress'] },
            },
          }),
      // Overdue tasks
      isManagerOrAdmin
        ? prisma.tasks.count({
            where: {
              due_date: { lt: new Date() },
              status: { not: 'done' },
            },
          })
        : prisma.tasks.count({
            where: {
              assignee_id: userId,
              due_date: { lt: new Date() },
              status: { not: 'done' },
            },
          }),
      // Pending contracts
      prisma.contracts.count({
        where: { status: 'pending_signature' },
      }),
      // Recent projects (limit 5)
      isManagerOrAdmin
        ? prisma.pm_projects.findMany({
            orderBy: { updated_at: 'desc' },
            take: 5,
          })
        : prisma.pm_projects.findMany({
            where: { id: { in: projectIds } },
            orderBy: { updated_at: 'desc' },
            take: 5,
          }),
      // Upcoming tasks (limit 5)
      isManagerOrAdmin
        ? prisma.tasks.findMany({
            where: { status: { in: ['todo', 'in_progress'] } },
            include: {
              pm_projects: { select: { name: true } },
            },
            orderBy: { due_date: 'asc' },
            take: 5,
          })
        : prisma.tasks.findMany({
            where: {
              assignee_id: userId,
              status: { in: ['todo', 'in_progress'] },
            },
            include: {
              pm_projects: { select: { name: true } },
            },
            orderBy: { due_date: 'asc' },
            take: 5,
          }),
      // Recent activity (Manager/Admin only)
      isManagerOrAdmin
        ? prisma.activity_log.findMany({
            include: {
              profiles: { select: { full_name: true, avatar_url: true } },
            },
            orderBy: { created_at: 'desc' },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    // Transform tasks to include project name
    const transformedTasks = upcomingTasks.map(task => ({
      ...task,
      project: task.pm_projects,
      pm_projects: undefined,
    }));

    // Transform activity to include user
    const transformedActivity = recentActivity.map(activity => ({
      ...activity,
      user: activity.profiles,
      profiles: undefined,
    }));

    return NextResponse.json({
      stats: {
        totalProjects,
        activeProjects,
        pendingTasks,
        overdueTasks,
        pendingContracts,
      },
      recentProjects,
      upcomingTasks: transformedTasks,
      recentActivity: transformedActivity,
      isManagerOrAdmin,
    });
  } catch (error) {
    console.error('[Dashboard API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
