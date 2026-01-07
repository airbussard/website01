import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

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

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    const { data: recurringInvoice, error } = await adminSupabase
      .from('recurring_invoices')
      .select(`
        *,
        project:pm_projects(id, name, client_id, organization_id),
        creator:profiles!recurring_invoices_created_by_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error || !recurringInvoice) {
      return NextResponse.json(
        { error: 'Wiederkehrende Rechnung nicht gefunden' },
        { status: 404 }
      );
    }

    // Generierte Rechnungen laden
    const { data: history } = await adminSupabase
      .from('recurring_invoice_history')
      .select(`
        *,
        invoice:invoices(id, invoice_number, status, total_amount)
      `)
      .eq('recurring_invoice_id', id)
      .order('generated_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      recurring_invoice: recurringInvoice,
      history: history || [],
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

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Existenz pruefen
    const { data: existing, error: loadError } = await adminSupabase
      .from('recurring_invoices')
      .select('id')
      .eq('id', id)
      .single();

    if (loadError || !existing) {
      return NextResponse.json(
        { error: 'Wiederkehrende Rechnung nicht gefunden' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { is_active, title, description, end_date, auto_send, send_notification } =
      body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (is_active !== undefined) updates.is_active = is_active;
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (end_date !== undefined) updates.end_date = end_date || null;
    if (auto_send !== undefined) updates.auto_send = auto_send;
    if (send_notification !== undefined) updates.send_notification = send_notification;

    const { data: recurringInvoice, error: updateError } = await adminSupabase
      .from('recurring_invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Recurring Invoice] Update error:', updateError);
      return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
    }

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

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Nur Admins koennen loeschen' },
        { status: 403 }
      );
    }

    // Erst History loeschen (Foreign Key)
    await adminSupabase
      .from('recurring_invoice_history')
      .delete()
      .eq('recurring_invoice_id', id);

    // Dann Recurring Invoice loeschen
    const { error: deleteError } = await adminSupabase
      .from('recurring_invoices')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Recurring Invoice] Delete error:', deleteError);
      return NextResponse.json({ error: 'Fehler beim Loeschen' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Recurring Invoice] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
