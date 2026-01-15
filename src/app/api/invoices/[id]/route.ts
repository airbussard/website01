import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
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
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();

    const { data: invoice, error } = await adminSupabase
      .from('invoices')
      .select(`
        *,
        project:pm_projects(id, name, client_id, organization_id),
        creator:profiles!invoices_created_by_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Rechnung nicht gefunden' }, { status: 404 });
    }

    // Berechtigungspruefung
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      // Pruefen ob User Mitglied des Projekts ist
      const { data: membership } = await adminSupabase
        .from('pm_project_members')
        .select('id')
        .eq('project_id', invoice.project_id)
        .eq('user_id', user.id)
        .single();

      if (!membership) {
        return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
      }
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('[Invoice] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PATCH /api/invoices/[id]
 * Aktualisiert eine Rechnung (nur wenn nicht zu Lexoffice synchronisiert)
 *
 * Body:
 * - title: string (optional)
 * - description: string (optional)
 * - status: string (optional)
 * - due_date: string (optional)
 * - line_items: InvoiceLineItem[] (optional)
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

    // Rechnung laden
    const { data: existingInvoice, error: loadError } = await adminSupabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (loadError || !existingInvoice) {
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

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (due_date !== undefined) updates.due_date = due_date;

    // Line Items und Totals berechnen
    if (line_items !== undefined) {
      const typedLineItems = line_items as InvoiceLineItem[];
      updates.line_items = typedLineItems;

      if (typedLineItems && typedLineItems.length > 0) {
        const totals = calculateTotalsFromLineItems(typedLineItems);
        updates.amount = totals.net_amount;
        updates.tax_amount = totals.tax_amount;
        updates.total_amount = totals.total_amount;
      }
    }

    const { data: invoice, error: updateError } = await adminSupabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Invoice] Update error:', updateError);
      return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
    }

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
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Rolle pruefen - nur Admin
    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Nur Admins koennen Rechnungen loeschen' }, { status: 403 });
    }

    // Rechnung laden
    const { data: invoice, error: loadError } = await adminSupabase
      .from('invoices')
      .select('status, lexoffice_id')
      .eq('id', id)
      .single();

    if (loadError || !invoice) {
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

    const { error: deleteError } = await adminSupabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Invoice] Delete error:', deleteError);
      return NextResponse.json({ error: 'Fehler beim Loeschen' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Invoice] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
