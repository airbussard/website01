import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateTotalsFromLineItems } from '@/lib/lexoffice';
import type { InvoiceLineItem } from '@/types/dashboard';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/invoices/[id]
 * Ruft eine einzelne Rechnung ab
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

    const invoice = await prisma.invoices.findUnique({
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

    if (!invoice) {
      return NextResponse.json({ error: 'Rechnung nicht gefunden' }, { status: 404 });
    }

    // Berechtigungspruefung
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      // Pruefen ob User Mitglied des Projekts ist
      const membership = await prisma.project_members.findFirst({
        where: {
          project_id: invoice.project_id,
          user_id: userId,
        },
        select: { id: true },
      });

      if (!membership) {
        return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
      }
    }

    // Transform to match expected format
    const transformedInvoice = {
      ...invoice,
      project: invoice.pm_projects,
      creator: invoice.profiles,
      pm_projects: undefined,
      profiles: undefined,
    };

    return NextResponse.json({ invoice: transformedInvoice });
  } catch (error) {
    console.error('[Invoice] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PATCH /api/invoices/[id]
 * Aktualisiert eine Rechnung (nur wenn nicht zu Lexoffice synchronisiert)
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

    // Rechnung laden
    const existingInvoice = await prisma.invoices.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Rechnung nicht gefunden' }, { status: 404 });
    }

    // Lexoffice-Sync-Pruefung: Nur nicht-synchronisierte Rechnungen bearbeitbar
    if (existingInvoice.lexoffice_id) {
      return NextResponse.json(
        { error: 'Bereits zu Lexoffice synchronisiert - Bearbeitung nicht moeglich' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, status, due_date, line_items } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {
      updated_at: new Date(),
    };

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (due_date !== undefined) updates.due_date = due_date ? new Date(due_date) : null;

    // Line Items und Totals berechnen
    if (line_items !== undefined) {
      const typedLineItems = line_items as InvoiceLineItem[];
      updates.line_items = typedLineItems || null;

      if (typedLineItems && typedLineItems.length > 0) {
        const totals = calculateTotalsFromLineItems(typedLineItems);
        updates.amount = totals.net_amount;
        updates.tax_amount = totals.tax_amount;
        updates.total_amount = totals.total_amount;
      }
    }

    const invoice = await prisma.invoices.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('[Invoice] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * DELETE /api/invoices/[id]
 * Loescht eine Rechnung (nur wenn nicht zu Lexoffice synchronisiert)
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
      return NextResponse.json({ error: 'Nur Admins koennen Rechnungen loeschen' }, { status: 403 });
    }

    // Rechnung laden
    const invoice = await prisma.invoices.findUnique({
      where: { id },
      select: { status: true, lexoffice_id: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Rechnung nicht gefunden' }, { status: 404 });
    }

    // Nur Drafts loeschen
    if (invoice.status !== 'draft') {
      return NextResponse.json(
        { error: 'Nur Entwuerfe koennen geloescht werden' },
        { status: 400 }
      );
    }

    // Lexoffice-Sync-Pruefung: Nur nicht-synchronisierte Rechnungen loeschbar
    if (invoice.lexoffice_id) {
      return NextResponse.json(
        { error: 'Bereits zu Lexoffice synchronisiert - Loeschen nicht moeglich' },
        { status: 400 }
      );
    }

    await prisma.invoices.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Invoice] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
