import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/quotations/[id]
 * Ruft ein einzelnes Angebot ab
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const quotation = await prisma.quotations.findUnique({
      where: { id },
      include: {
        pm_projects: {
          select: { id: true, name: true, client_id: true, organization_id: true },
        },
        profiles: {
          select: { id: true, full_name: true, email: true },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 });
    }

    // Berechtigungspruefung
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      // Pruefen ob User Mitglied des Projekts ist
      if (!quotation.project_id) {
        return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
      }

      const membership = await prisma.project_members.findFirst({
        where: {
          project_id: quotation.project_id,
          user_id: userId,
        },
        select: { id: true },
      });

      if (!membership) {
        return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
      }
    }

    // Transform to match expected format
    const transformedQuotation = {
      ...quotation,
      project: quotation.pm_projects,
      creator: quotation.profiles,
      pm_projects: undefined,
      profiles: undefined,
    };

    return NextResponse.json({ quotation: transformedQuotation });
  } catch (error) {
    console.error('[Quotation] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PATCH /api/quotations/[id]
 * Aktualisiert ein Angebot
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

    // Rolle pruefen
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Angebot laden
    const existingQuotation = await prisma.quotations.findUnique({
      where: { id },
    });

    if (!existingQuotation) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 });
    }

    // Lexoffice-Sync-Pruefung: Nur nicht-synchronisierte Angebote bearbeitbar
    if (existingQuotation.lexoffice_id) {
      return NextResponse.json(
        { error: 'Bereits zu Lexoffice synchronisiert - Bearbeitung nicht moeglich' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, title, description, valid_until } = body;

    // Status-Aenderungen mit Timestamps
    const updates: {
      status?: string;
      title?: string;
      description?: string | null;
      valid_until?: Date | null;
      sent_at?: Date;
      accepted_at?: Date;
      rejected_at?: Date;
      updated_at: Date;
    } = {
      updated_at: new Date(),
    };

    if (status) {
      updates.status = status;

      // Status-spezifische Timestamps
      if (status === 'sent' && existingQuotation.status === 'draft') {
        updates.sent_at = new Date();
      } else if (status === 'accepted') {
        updates.accepted_at = new Date();
      } else if (status === 'rejected') {
        updates.rejected_at = new Date();
      }
    }

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (valid_until !== undefined) updates.valid_until = valid_until ? new Date(valid_until) : null;

    const quotation = await prisma.quotations.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ quotation });
  } catch (error) {
    console.error('[Quotation] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * DELETE /api/quotations/[id]
 * Loescht ein Angebot (nur im Draft-Status)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Rolle pruefen - nur Admin
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Nur Admins koennen Angebote loeschen' }, { status: 403 });
    }

    // Angebot laden
    const quotation = await prisma.quotations.findUnique({
      where: { id },
      select: { status: true, lexoffice_id: true },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 });
    }

    // Nur Drafts loeschen
    if (quotation.status !== 'draft') {
      return NextResponse.json(
        { error: 'Nur Entwuerfe koennen geloescht werden' },
        { status: 400 }
      );
    }

    // Lexoffice-Sync-Pruefung: Nur nicht-synchronisierte Angebote loeschbar
    if (quotation.lexoffice_id) {
      return NextResponse.json(
        { error: 'Bereits zu Lexoffice synchronisiert - Loeschen nicht moeglich' },
        { status: 400 }
      );
    }

    await prisma.quotations.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Quotation] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
