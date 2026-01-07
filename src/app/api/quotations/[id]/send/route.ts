import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  createLexofficeClient,
  mapToLexofficeQuotation,
  LexofficeApiError,
} from '@/lib/lexoffice';
import type { InvoiceLineItem } from '@/types/dashboard';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quotations/[id]/send
 * Finalisiert und sendet ein Angebot zu Lexoffice
 *
 * Body:
 * - finalize: boolean (optional) - Angebot in Lexoffice finalisieren
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

    // Angebot mit Projekt laden
    const { data: quotation, error: loadError } = await adminSupabase
      .from('quotations')
      .select(`
        *,
        project:pm_projects(id, name, client_id, organization_id)
      `)
      .eq('id', id)
      .single();

    if (loadError || !quotation) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 });
    }

    // Nur Drafts koennen gesendet werden
    if (quotation.status !== 'draft') {
      return NextResponse.json(
        { error: 'Nur Entwuerfe koennen gesendet werden' },
        { status: 400 }
      );
    }

    // Lexoffice Settings pruefen
    const { data: settings } = await adminSupabase
      .from('system_settings')
      .select('value')
      .eq('key', 'lexoffice')
      .single();

    const lexofficeSettings = settings?.value as {
      is_enabled: boolean;
      api_key: string | null;
    } | null;

    if (!lexofficeSettings?.is_enabled || !lexofficeSettings?.api_key) {
      return NextResponse.json(
        { error: 'Lexoffice ist nicht aktiviert' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const finalize = body.finalize ?? true;

    // Kontakt-Mapping finden
    let contactId: string | null = null;
    const project = quotation.project as { client_id?: string; organization_id?: string } | null;

    if (project?.client_id) {
      const { data: contactMapping } = await adminSupabase
        .from('lexoffice_contacts')
        .select('lexoffice_contact_id')
        .eq('profile_id', project.client_id)
        .single();

      contactId = contactMapping?.lexoffice_contact_id || null;
    } else if (project?.organization_id) {
      const { data: contactMapping } = await adminSupabase
        .from('lexoffice_contacts')
        .select('lexoffice_contact_id')
        .eq('organization_id', project.organization_id)
        .single();

      contactId = contactMapping?.lexoffice_contact_id || null;
    }

    if (!contactId) {
      return NextResponse.json(
        { error: 'Kein Lexoffice-Kontakt fuer dieses Projekt gefunden. Bitte erst Kontakt synchronisieren.' },
        { status: 400 }
      );
    }

    const lexoffice = createLexofficeClient(lexofficeSettings.api_key);

    let lexofficeId = quotation.lexoffice_id;
    let pdfUrl: string | null = null;

    try {
      // Wenn noch nicht zu Lexoffice synchronisiert, erstellen
      if (!lexofficeId) {
        const lexofficeData = mapToLexofficeQuotation({
          quotation: {
            title: quotation.title,
            description: quotation.description,
            valid_until: quotation.valid_until,
          },
          lexofficeContactId: contactId,
          lineItems: quotation.line_items as InvoiceLineItem[],
        });

        const response = await lexoffice.createQuotation(lexofficeData, finalize);
        lexofficeId = response.id;

        // Sync Log
        await adminSupabase.from('lexoffice_sync_log').insert({
          entity_type: 'quotation',
          entity_id: quotation.id,
          lexoffice_id: lexofficeId,
          action: finalize ? 'finalize' : 'create',
          status: 'success',
          request_data: lexofficeData,
          response_data: response,
        });
      }

      // PDF abrufen wenn finalisiert
      if (finalize && lexofficeId) {
        try {
          const pdfBuffer = await lexoffice.getQuotationPdf(lexofficeId);

          // PDF zu Supabase Storage hochladen
          const pdfFileName = `quotations/${quotation.quotation_number}.pdf`;
          const { error: uploadError } = await adminSupabase.storage
            .from('documents')
            .upload(pdfFileName, pdfBuffer, {
              contentType: 'application/pdf',
              upsert: true,
            });

          if (!uploadError) {
            const { data: urlData } = adminSupabase.storage
              .from('documents')
              .getPublicUrl(pdfFileName);

            pdfUrl = urlData.publicUrl;
          }
        } catch (pdfError) {
          console.error('[Quotation] PDF fetch error:', pdfError);
          // Nicht kritisch, fortfahren
        }
      }

      // Lokales Angebot aktualisieren
      const { data: updatedQuotation, error: updateError } = await adminSupabase
        .from('quotations')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          lexoffice_id: lexofficeId,
          lexoffice_status: finalize ? 'open' : 'draft',
          pdf_url: pdfUrl,
          synced_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('[Quotation] Update error:', updateError);
      }

      return NextResponse.json({
        success: true,
        quotation: updatedQuotation,
        lexoffice_id: lexofficeId,
        pdf_url: pdfUrl,
      });
    } catch (error) {
      if (error instanceof LexofficeApiError) {
        // Sync Log
        await adminSupabase.from('lexoffice_sync_log').insert({
          entity_type: 'quotation',
          entity_id: quotation.id,
          action: 'send',
          status: 'failed',
          error_message: error.message,
        });

        return NextResponse.json(
          {
            error: `Lexoffice Fehler: ${error.message}`,
            details: error.details,
          },
          { status: error.status }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('[Quotation Send] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
