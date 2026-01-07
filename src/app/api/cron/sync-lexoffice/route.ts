import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  createLexofficeClient,
  mapLexofficeStatusToLocal,
  LexofficeApiError,
} from '@/lib/lexoffice';

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/sync-lexoffice
 * Synchronisiert Status von offenen Rechnungen und Angeboten mit Lexoffice
 *
 * Soll alle 15-30 Minuten ausgefuehrt werden
 * Erwartet CRON_SECRET Header fuer Authentifizierung
 */
export async function GET(request: NextRequest) {
  try {
    // Authentifizierung via Secret
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');

    if (CRON_SECRET && providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();

    // Lexoffice Settings laden
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
      return NextResponse.json({
        message: 'Lexoffice nicht aktiviert',
        synced: 0,
      });
    }

    const lexoffice = createLexofficeClient(lexofficeSettings.api_key);

    const results: {
      invoices: Array<{ id: string; status_changed: boolean; error?: string }>;
      quotations: Array<{ id: string; status_changed: boolean; error?: string }>;
    } = {
      invoices: [],
      quotations: [],
    };

    // =====================================================
    // INVOICE STATUS SYNC
    // =====================================================

    // Offene Rechnungen mit Lexoffice ID laden
    const { data: openInvoices, error: invoicesError } = await adminSupabase
      .from('invoices')
      .select('id, status, lexoffice_id, lexoffice_status')
      .not('lexoffice_id', 'is', null)
      .in('status', ['draft', 'sent', 'overdue']);

    if (invoicesError) {
      console.error('[Lexoffice Sync] Load invoices error:', invoicesError);
    }

    if (openInvoices && openInvoices.length > 0) {
      for (const invoice of openInvoices) {
        if (!invoice.lexoffice_id) continue;

        try {
          const lexofficeInvoice = await lexoffice.getInvoice(invoice.lexoffice_id);
          const lexofficeStatus = lexofficeInvoice.voucherStatus || 'draft';
          const localStatus = mapLexofficeStatusToLocal(lexofficeStatus);

          // Status geaendert?
          if (localStatus !== invoice.status) {
            const updates: Record<string, unknown> = {
              status: localStatus,
              lexoffice_status: lexofficeStatus,
              synced_at: new Date().toISOString(),
            };

            // Bei Bezahlung: paid_at setzen
            if (localStatus === 'paid') {
              updates.paid_at = new Date().toISOString();
            }

            await adminSupabase.from('invoices').update(updates).eq('id', invoice.id);

            // PDF aktualisieren wenn noch nicht vorhanden
            if (!invoice.lexoffice_id) {
              try {
                const pdfBuffer = await lexoffice.getInvoicePdf(invoice.lexoffice_id);

                // Query invoice_number
                const { data: invoiceData } = await adminSupabase
                  .from('invoices')
                  .select('invoice_number')
                  .eq('id', invoice.id)
                  .single();

                if (invoiceData?.invoice_number) {
                  const pdfFileName = `invoices/${invoiceData.invoice_number}.pdf`;
                  await adminSupabase.storage
                    .from('documents')
                    .upload(pdfFileName, pdfBuffer, {
                      contentType: 'application/pdf',
                      upsert: true,
                    });

                  const { data: urlData } = adminSupabase.storage
                    .from('documents')
                    .getPublicUrl(pdfFileName);

                  await adminSupabase
                    .from('invoices')
                    .update({ pdf_url: urlData.publicUrl })
                    .eq('id', invoice.id);
                }
              } catch (pdfError) {
                console.error('[Lexoffice Sync] PDF fetch error:', pdfError);
              }
            }

            // Sync Log
            await adminSupabase.from('lexoffice_sync_log').insert({
              entity_type: 'invoice',
              entity_id: invoice.id,
              lexoffice_id: invoice.lexoffice_id,
              action: 'status_sync',
              status: 'success',
              response_data: {
                old_status: invoice.status,
                new_status: localStatus,
                lexoffice_status: lexofficeStatus,
              },
            });

            results.invoices.push({ id: invoice.id, status_changed: true });
          } else {
            // Nur synced_at aktualisieren
            await adminSupabase
              .from('invoices')
              .update({ synced_at: new Date().toISOString() })
              .eq('id', invoice.id);

            results.invoices.push({ id: invoice.id, status_changed: false });
          }
        } catch (error) {
          const errorMessage =
            error instanceof LexofficeApiError ? error.message : 'Unknown error';
          console.error(
            `[Lexoffice Sync] Invoice ${invoice.id} error:`,
            errorMessage
          );

          await adminSupabase.from('lexoffice_sync_log').insert({
            entity_type: 'invoice',
            entity_id: invoice.id,
            lexoffice_id: invoice.lexoffice_id,
            action: 'status_sync',
            status: 'failed',
            error_message: errorMessage,
          });

          results.invoices.push({ id: invoice.id, status_changed: false, error: errorMessage });
        }
      }
    }

    // =====================================================
    // QUOTATION STATUS SYNC
    // =====================================================

    // Offene Angebote mit Lexoffice ID laden
    const { data: openQuotations, error: quotationsError } = await adminSupabase
      .from('quotations')
      .select('id, status, lexoffice_id, lexoffice_status')
      .not('lexoffice_id', 'is', null)
      .in('status', ['draft', 'sent']);

    if (quotationsError) {
      console.error('[Lexoffice Sync] Load quotations error:', quotationsError);
    }

    if (openQuotations && openQuotations.length > 0) {
      for (const quotation of openQuotations) {
        if (!quotation.lexoffice_id) continue;

        try {
          const lexofficeQuotation = await lexoffice.getQuotation(quotation.lexoffice_id);
          const lexofficeStatus = lexofficeQuotation.voucherStatus || 'draft';

          // Quotation Status mapping
          let localStatus = quotation.status;
          if (lexofficeStatus === 'accepted') {
            localStatus = 'accepted';
          } else if (lexofficeStatus === 'rejected') {
            localStatus = 'rejected';
          }

          // Status geaendert?
          if (localStatus !== quotation.status) {
            const updates: Record<string, unknown> = {
              status: localStatus,
              lexoffice_status: lexofficeStatus,
              synced_at: new Date().toISOString(),
            };

            if (localStatus === 'accepted') {
              updates.accepted_at = new Date().toISOString();
            } else if (localStatus === 'rejected') {
              updates.rejected_at = new Date().toISOString();
            }

            await adminSupabase.from('quotations').update(updates).eq('id', quotation.id);

            // Sync Log
            await adminSupabase.from('lexoffice_sync_log').insert({
              entity_type: 'quotation',
              entity_id: quotation.id,
              lexoffice_id: quotation.lexoffice_id,
              action: 'status_sync',
              status: 'success',
              response_data: {
                old_status: quotation.status,
                new_status: localStatus,
                lexoffice_status: lexofficeStatus,
              },
            });

            results.quotations.push({ id: quotation.id, status_changed: true });
          } else {
            // Nur synced_at aktualisieren
            await adminSupabase
              .from('quotations')
              .update({ synced_at: new Date().toISOString() })
              .eq('id', quotation.id);

            results.quotations.push({ id: quotation.id, status_changed: false });
          }
        } catch (error) {
          const errorMessage =
            error instanceof LexofficeApiError ? error.message : 'Unknown error';
          console.error(
            `[Lexoffice Sync] Quotation ${quotation.id} error:`,
            errorMessage
          );

          await adminSupabase.from('lexoffice_sync_log').insert({
            entity_type: 'quotation',
            entity_id: quotation.id,
            lexoffice_id: quotation.lexoffice_id,
            action: 'status_sync',
            status: 'failed',
            error_message: errorMessage,
          });

          results.quotations.push({
            id: quotation.id,
            status_changed: false,
            error: errorMessage,
          });
        }
      }
    }

    const invoicesChanged = results.invoices.filter((r) => r.status_changed).length;
    const quotationsChanged = results.quotations.filter((r) => r.status_changed).length;

    return NextResponse.json({
      message: `Sync abgeschlossen: ${invoicesChanged} Rechnungen, ${quotationsChanged} Angebote aktualisiert`,
      invoices_synced: results.invoices.length,
      invoices_changed: invoicesChanged,
      quotations_synced: results.quotations.length,
      quotations_changed: quotationsChanged,
      results,
    });
  } catch (error) {
    console.error('[Lexoffice Sync] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
