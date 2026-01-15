import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quotations/[id]/convert
 * Konvertiert ein Angebot in eine Rechnung
 *
 * Body (optional):
 * - set_accepted: boolean - Angebot-Status auf "accepted" setzen (default: true)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Rolle pruefen - nur Manager/Admin
    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Angebot laden
    const { data: quotation, error: loadError } = await adminSupabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single();

    if (loadError || !quotation) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 });
    }

    // Nur sent oder accepted Angebote konvertieren
    if (!['sent', 'accepted'].includes(quotation.status)) {
      return NextResponse.json(
        { error: 'Nur gesendete oder akzeptierte Angebote koennen konvertiert werden' },
        { status: 400 }
      );
    }

    // Body parsen
    let setAccepted = true;
    try {
      const body = await request.json();
      if (body.set_accepted !== undefined) {
        setAccepted = body.set_accepted;
      }
    } catch {
      // Kein Body, defaults verwenden
    }

    // Rechnungsnummer generieren
    const { count } = await adminSupabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });

    const year = new Date().getFullYear();
    const nextNumber = (count || 0) + 1;
    const invoiceNumber = `RE-${year}-${String(nextNumber).padStart(4, '0')}`;

    // Faelligkeitsdatum (14 Tage ab heute)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Rechnung erstellen
    const invoiceData = {
      invoice_number: invoiceNumber,
      title: quotation.title,
      description: quotation.description,
      project_id: quotation.project_id,
      line_items: quotation.line_items,
      amount: quotation.net_amount,
      tax_amount: quotation.tax_amount,
      total_amount: quotation.total_amount,
      currency: quotation.currency || 'EUR',
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: invoice, error: insertError } = await adminSupabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (insertError) {
      console.error('[Quotation Convert] Insert error:', insertError);
      return NextResponse.json({ error: 'Fehler beim Erstellen der Rechnung' }, { status: 500 });
    }

    // Optional: Angebot-Status auf "accepted" setzen
    let updatedQuotation = quotation;
    if (setAccepted && quotation.status !== 'accepted') {
      const { data: updated, error: updateError } = await adminSupabase
        .from('quotations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!updateError && updated) {
        updatedQuotation = updated;
      }
    }

    // Activity Log
    await adminSupabase.from('activity_log').insert({
      project_id: quotation.project_id,
      user_id: user.id,
      action: 'quotation_converted',
      entity_type: 'quotation',
      entity_id: quotation.id,
      details: {
        quotation_number: quotation.quotation_number,
        invoice_id: invoice.id,
        invoice_number: invoiceNumber,
      },
    });

    return NextResponse.json({
      success: true,
      invoice,
      quotation: updatedQuotation,
      message: `Angebot wurde in Rechnung ${invoiceNumber} konvertiert`,
    });
  } catch (error) {
    console.error('[Quotation Convert] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
