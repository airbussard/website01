import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/tasks
 * Ruft Tasks basierend auf User-Rolle ab
 *
 * Query Parameter:
 * - status: Filter by status (optional, comma-separated for multiple)
 * - project_id: Filter by project (optional)
 * - assignee_id: Filter by assignee (optional)
 * - filter: Special filters like 'overdue' (optional)
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
    const projectId = searchParams.get('project_id');
    const assigneeId = searchParams.get('assignee_id');
    const filter = searchParams.get('filter');

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    // Filter by assignee based on role
    if (!isManagerOrAdmin) {
      whereClause.assignee_id = userId;
    } else if (assigneeId) {
      whereClause.assignee_id = assigneeId;
    }

    // Filter by project
    if (projectId) {
      whereClause.project_id = projectId;
    }

    // Filter by status
    if (status) {
      const statuses = status.split(',');
      if (statuses.length === 1) {
        whereClause.status = status;
      } else {
        whereClause.status = { in: statuses };
      }
    }

    // Special filter: overdue
    if (filter === 'overdue') {
      whereClause.due_date = { lt: new Date() };
      whereClause.status = { not: 'done' };
    }

    const tasks = await prisma.tasks.findMany({
      where: whereClause,
      include: {
        pm_projects: {
          select: { id: true, name: true },
        },
        profiles_tasks_assignee_idToprofiles: {
          select: { id: true, full_name: true, avatar_url: true },
        },
        profiles_tasks_created_byToprofiles: {
          select: { id: true, full_name: true },
        },
      },
      orderBy: [
        { due_date: 'asc' },
        { created_at: 'desc' },
      ],
    });

    // Transform to expected format
    const transformedTasks = tasks.map(task => ({
      ...task,
      project: task.pm_projects,
      assignee: task.profiles_tasks_assignee_idToprofiles,
      creator: task.profiles_tasks_created_byToprofiles,
      pm_projects: undefined,
      profiles_tasks_assignee_idToprofiles: undefined,
      profiles_tasks_created_byToprofiles: undefined,
    }));

    return NextResponse.json({ tasks: transformedTasks });
  } catch (error) {
    console.error('[Tasks API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 * Erstellt eine neue Task
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID nicht gefunden' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      project_id,
      assignee_id,
      status,
      priority,
      due_date,
      estimated_hours,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Titel ist erforderlich' }, { status: 400 });
    }

    if (!project_id) {
      return NextResponse.json({ error: 'Projekt ist erforderlich' }, { status: 400 });
    }

    const task = await prisma.tasks.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        project_id,
        assignee_id: assignee_id || null,
        created_by: userId,
        status: status || 'todo',
        priority: priority || 'medium',
        due_date: due_date ? new Date(due_date) : null,
        estimated_hours: estimated_hours || null,
      },
      include: {
        pm_projects: {
          select: { id: true, name: true },
        },
      },
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        project_id,
        user_id: userId,
        action: 'task_created',
        entity_type: 'task',
        entity_id: task.id,
        details: { title: task.title } as object,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('[Tasks API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
