import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]
 * Ruft eine einzelne Task ab
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const task = await prisma.tasks.findUnique({
      where: { id },
      include: {
        pm_projects: {
          select: { id: true, name: true },
        },
        profiles_tasks_assignee_idToprofiles: {
          select: { id: true, full_name: true, avatar_url: true, email: true },
        },
        profiles_tasks_created_byToprofiles: {
          select: { id: true, full_name: true },
        },
        comments: {
          include: {
            profiles: {
              select: { id: true, full_name: true, avatar_url: true },
            },
          },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task nicht gefunden' }, { status: 404 });
    }

    // Transform to expected format
    const transformedTask = {
      ...task,
      project: task.pm_projects,
      assignee: task.profiles_tasks_assignee_idToprofiles,
      creator: task.profiles_tasks_created_byToprofiles,
      comments: task.comments.map(c => ({
        ...c,
        author: c.profiles,
        profiles: undefined,
      })),
      pm_projects: undefined,
      profiles_tasks_assignee_idToprofiles: undefined,
      profiles_tasks_created_byToprofiles: undefined,
    };

    return NextResponse.json({ task: transformedTask });
  } catch (error) {
    console.error('[Task API] GET Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PATCH /api/tasks/[id]
 * Aktualisiert eine Task
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID nicht gefunden' }, { status: 401 });
    }

    // Task laden
    const existingTask = await prisma.tasks.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task nicht gefunden' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      assignee_id,
      status,
      priority,
      due_date,
      estimated_hours,
      actual_hours,
    } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (assignee_id !== undefined) updateData.assignee_id = assignee_id || null;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'done' && existingTask.status !== 'done') {
        updateData.completed_at = new Date();
      } else if (status !== 'done') {
        updateData.completed_at = null;
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    if (due_date !== undefined) updateData.due_date = due_date ? new Date(due_date) : null;
    if (estimated_hours !== undefined) updateData.estimated_hours = estimated_hours || null;
    if (actual_hours !== undefined) updateData.actual_hours = actual_hours || null;

    const updatedTask = await prisma.tasks.update({
      where: { id },
      data: updateData,
      include: {
        pm_projects: {
          select: { id: true, name: true },
        },
      },
    });

    // Activity Log
    if (existingTask.project_id) {
      await prisma.activity_log.create({
        data: {
          project_id: existingTask.project_id,
          user_id: userId,
          action: status === 'done' ? 'task_completed' : 'task_updated',
          entity_type: 'task',
          entity_id: id,
          details: { title: updatedTask.title, status: updatedTask.status } as object,
        },
      });
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('[Task API] PATCH Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]
 * Loescht eine Task (nur Manager/Admin)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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

    const existingTask = await prisma.tasks.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task nicht gefunden' }, { status: 404 });
    }

    // Kommentare loeschen
    await prisma.comments.deleteMany({
      where: { task_id: id },
    });

    // Task loeschen
    await prisma.tasks.delete({
      where: { id },
    });

    // Activity Log
    if (existingTask.project_id) {
      await prisma.activity_log.create({
        data: {
          project_id: existingTask.project_id,
          user_id: userId,
          action: 'task_deleted',
          entity_type: 'task',
          entity_id: id,
          details: { title: existingTask.title } as object,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Task API] DELETE Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
