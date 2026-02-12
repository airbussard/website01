import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/recurring-invoices/[id]
 * Ruft eine einzelne wiederkehrende Rechnung ab
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

    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    const recurringInvoice = await prisma.recurring_invoices.findUnique({
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

    if (!recurringInvoice) {
      return NextResponse.json(
        { error: 'Wiederkehrende Rechnung nicht gefunden' },
        { status: 404 }
      );
    }

    // Generierte Rechnungen laden
    const history = await prisma.recurring_invoice_history.findMany({
      where: { recurring_invoice_id: id },
      include: {
        invoices: {
          select: { id: true, invoice_number: true, status: true, total_amount: true },
        },
      },
      orderBy: { generated_at: 'desc' },
      take: 10,
    });

    // Transform
    const transformedInvoice = {
      ...recurringInvoice,
      project: recurringInvoice.pm_projects,
      creator: recurringInvoice.profiles,
      pm_projects: undefined,
      profiles: undefined,
    };

    const transformedHistory = history.map(h => ({
      ...h,
      invoice: h.invoices,
      invoices: undefined,
    }));

    return NextResponse.json({
      recurring_invoice: transformedInvoice,
      history: transformedHistory,
    });
  } catch (error) {
    console.error('[Recurring Invoice] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PATCH /api/recurring-invoices/[id]
 * Aktualisiert eine wiederkehrende Rechnung
 *
 * Body:
 * - is_active: boolean (optional)
 * - title: string (optional)
 * - description: string (optional)
 * - end_date: string (optional)
 * - auto_send: boolean (optional)
 * - send_notification: boolean (optional)
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

    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Existenz pruefen
    const existing = await prisma.recurring_invoices.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Wiederkehrende Rechnung nicht gefunden' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { is_active, title, description, end_date, auto_send, send_notification } =
      body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {
      updated_at: new Date(),
    };

    if (is_active !== undefined) updates.is_active = is_active;
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (end_date !== undefined) updates.end_date = end_date ? new Date(end_date) : null;
    if (auto_send !== undefined) updates.auto_send = auto_send;
    if (send_notification !== undefined) updates.send_notification = send_notification;

    const recurringInvoice = await prisma.recurring_invoices.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ recurring_invoice: recurringInvoice });
  } catch (error) {
    console.error('[Recurring Invoice] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * DELETE /api/recurring-invoices/[id]
 * Loescht eine wiederkehrende Rechnung (nur Admin)
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

    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Nur Admins koennen loeschen' },
        { status: 403 }
      );
    }

    // Erst History loeschen (Foreign Key)
    await prisma.recurring_invoice_history.deleteMany({
      where: { recurring_invoice_id: id },
    });

    // Dann Recurring Invoice loeschen
    await prisma.recurring_invoices.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Recurring Invoice] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
