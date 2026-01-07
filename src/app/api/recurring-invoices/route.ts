import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { calculateTotalsFromLineItems } from '@/lib/lexoffice';
import type { InvoiceLineItem, RecurringInterval } from '@/types/dashboard';

/**
 * GET /api/recurring-invoices
 * Liste aller wiederkehrenden Rechnungen (gefiltert nach Berechtigung)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Nur Manager/Admin duerfen Recurring Invoices sehen
    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const activeOnly = searchParams.get('active') === 'true';

    let query = adminSupabase
      .from('recurring_invoices')
      .select(`
        *,
        project:pm_projects(id, name, client_id, organization_id),
        creator:profiles!recurring_invoices_created_by_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: recurringInvoices, error } = await query;

    if (error) {
      console.error('[Recurring Invoices] Load error:', error);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    return NextResponse.json({ recurring_invoices: recurringInvoices });
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
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Rolle pruefen
    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
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
    const { data: project, error: projectError } = await adminSupabase
      .from('pm_projects')
      .select('id, name')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
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
    const { data: recurringInvoice, error: insertError } = await adminSupabase
      .from('recurring_invoices')
      .insert({
        project_id,
        title: title.trim(),
        description: description?.trim() || null,
        line_items: typedLineItems,
        net_amount: totals.net_amount,
        tax_rate: typedLineItems[0]?.tax_rate || 19,
        interval_type,
        interval_value,
        start_date,
        end_date: end_date || null,
        next_invoice_date: nextInvoiceDate.toISOString().split('T')[0],
        is_active: true,
        auto_send,
        send_notification,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Recurring Invoices] Insert error:', insertError);
      return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 });
    }

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
