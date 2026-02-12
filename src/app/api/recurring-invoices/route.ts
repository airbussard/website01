import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateTotalsFromLineItems } from '@/lib/lexoffice';
import type { InvoiceLineItem, RecurringInterval } from '@/types/dashboard';

/**
 * GET /api/recurring-invoices
 * Liste aller wiederkehrenden Rechnungen (gefiltert nach Berechtigung)
 */
export async function GET(request: NextRequest) {
  try {
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

    // Nur Manager/Admin duerfen Recurring Invoices sehen
    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const activeOnly = searchParams.get('active') === 'true';

    const recurringInvoices = await prisma.recurring_invoices.findMany({
      where: {
        ...(projectId ? { project_id: projectId } : {}),
        ...(activeOnly ? { is_active: true } : {}),
      },
      include: {
        pm_projects: {
          select: { id: true, name: true, client_id: true, organization_id: true },
        },
        profiles: {
          select: { id: true, full_name: true, email: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Transform to match expected format
    const transformedInvoices = recurringInvoices.map(ri => ({
      ...ri,
      project: ri.pm_projects,
      creator: ri.profiles,
      pm_projects: undefined,
      profiles: undefined,
    }));

    return NextResponse.json({ recurring_invoices: transformedInvoices });
  } catch (error) {
    console.error('[Recurring Invoices] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/recurring-invoices
 * Erstellt eine neue wiederkehrende Rechnung
 *
 * Body:
 * - project_id: UUID (required)
 * - title: string (required)
 * - description: string (optional)
 * - line_items: InvoiceLineItem[] (required)
 * - interval_type: 'monthly' | 'quarterly' | 'yearly' (required)
 * - interval_value: number (optional, default 1)
 * - start_date: string (required) - ISO date
 * - end_date: string (optional) - ISO date, null = unbefristet
 * - auto_send: boolean (optional)
 * - send_notification: boolean (optional)
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

    // Rolle pruefen
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    const body = await request.json();
    const {
      project_id,
      title,
      description,
      line_items,
      interval_type,
      interval_value = 1,
      start_date,
      end_date,
      auto_send = false,
      send_notification = true,
    } = body;

    // Validierung
    if (
      !project_id ||
      !title?.trim() ||
      !line_items ||
      !Array.isArray(line_items) ||
      line_items.length === 0 ||
      !interval_type ||
      !start_date
    ) {
      return NextResponse.json(
        {
          error:
            'project_id, title, line_items, interval_type und start_date sind erforderlich',
        },
        { status: 400 }
      );
    }

    // Interval Type validieren
    const validIntervals: RecurringInterval[] = ['monthly', 'quarterly', 'yearly'];
    if (!validIntervals.includes(interval_type)) {
      return NextResponse.json(
        { error: 'interval_type muss monthly, quarterly oder yearly sein' },
        { status: 400 }
      );
    }

    // Projekt pruefen
    const project = await prisma.pm_projects.findUnique({
      where: { id: project_id },
      select: { id: true, name: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 });
    }

    // Totals berechnen
    const typedLineItems = line_items as InvoiceLineItem[];
    const totals = calculateTotalsFromLineItems(typedLineItems);

    // Naechstes Rechnungsdatum berechnen
    const startDateObj = new Date(start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Wenn start_date in der Vergangenheit, naechstes Datum berechnen
    let nextInvoiceDate = new Date(startDateObj);
    while (nextInvoiceDate < today) {
      nextInvoiceDate = calculateNextDate(nextInvoiceDate, interval_type, interval_value);
    }

    // Recurring Invoice erstellen
    const recurringInvoice = await prisma.recurring_invoices.create({
      data: {
        project_id,
        title: title.trim(),
        description: description?.trim() || null,
        line_items: typedLineItems as unknown as object,
        net_amount: totals.net_amount,
        tax_rate: typedLineItems[0]?.tax_rate || 19,
        interval_type,
        interval_value,
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        next_invoice_date: nextInvoiceDate,
        is_active: true,
        auto_send,
        send_notification,
        created_by: userId,
      },
    });

    return NextResponse.json({ recurring_invoice: recurringInvoice }, { status: 201 });
  } catch (error) {
    console.error('[Recurring Invoices] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * Berechnet das naechste Rechnungsdatum basierend auf Intervall
 */
function calculateNextDate(
  currentDate: Date,
  intervalType: RecurringInterval,
  intervalValue: number
): Date {
  const nextDate = new Date(currentDate);

  switch (intervalType) {
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + intervalValue);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3 * intervalValue);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + intervalValue);
      break;
  }

  return nextDate;
}
