import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/progress-updates/[id]
 * Update bearbeiten - nur Manager/Admin oder Autor
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

    // Rolle und Update laden
    const [profile, existingUpdate] = await Promise.all([
      prisma.profiles.findUnique({ where: { id: userId }, select: { role: true } }),
      prisma.progress_updates.findUnique({ where: { id } }),
    ]);

    if (!existingUpdate) {
      return NextResponse.json(
        { error: 'Update nicht gefunden' },
        { status: 404 }
      );
    }

    const isManagerOrAdmin = profile && ['manager', 'admin'].includes(profile.role || '');
    const isAuthor = existingUpdate.author_id === userId;

    // Berechtigung pruefen: Manager/Admin oder Autor
    if (!isManagerOrAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Request Body parsen
    const body = await request.json();
    const {
      title,
      content,
      progress_percentage,
      is_public,
      images,
    } = body;

    // Update-Daten vorbereiten (nur geaenderte Felder)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content?.trim() || null;
    if (progress_percentage !== undefined) {
      updateData.progress_percentage = progress_percentage ? parseInt(progress_percentage) : null;
    }
    if (is_public !== undefined) updateData.is_public = is_public;
    if (images !== undefined) updateData.images = images;

    // Update durchfuehren
    const updatedUpdate = await prisma.progress_updates.update({
      where: { id },
      data: updateData,
    });

    // Activity Log
    if (existingUpdate.project_id) {
      await prisma.activity_log.create({
        data: {
          project_id: existingUpdate.project_id,
          user_id: userId,
          action: 'progress_update_edited',
          entity_type: 'progress_update',
          entity_id: id,
          details: { title: updateData.title || existingUpdate.title } as object,
        },
      });
    }

    return NextResponse.json({ update: updatedUpdate });

  } catch (error) {
    console.error('[Progress Updates API] PATCH Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/progress-updates/[id]
 * Update loeschen - nur Manager/Admin
 *
 * NOTE: Storage cleanup deaktiviert bis Phase 6 Storage Migration
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

    // Rolle pruefen
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json(
        { error: 'Keine Berechtigung - nur Manager/Admin' },
        { status: 403 }
      );
    }

    // Update laden fuer Activity Log
    const existingUpdate = await prisma.progress_updates.findUnique({
      where: { id },
    });

    if (!existingUpdate) {
      return NextResponse.json(
        { error: 'Update nicht gefunden' },
        { status: 404 }
      );
    }

    // TODO: Phase 6 Storage Migration - Bilder aus lokalem Storage loeschen
    console.log('[Progress Updates API] Image cleanup deaktiviert - Storage Migration pending');

    // Update loeschen
    await prisma.progress_updates.delete({
      where: { id },
    });

    // Activity Log
    if (existingUpdate.project_id) {
      await prisma.activity_log.create({
        data: {
          project_id: existingUpdate.project_id,
          user_id: userId,
          action: 'progress_update_deleted',
          entity_type: 'progress_update',
          entity_id: id,
          details: { title: existingUpdate.title } as object,
        },
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Progress Updates API] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
