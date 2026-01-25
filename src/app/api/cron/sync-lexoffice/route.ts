import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    // Lexoffice Settings laden
    const settings = await prisma.system_settings.findUnique({
      where: { key: 'lexoffice' },
      select: { value: true },
    });

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
    type InvoiceSelect = { id: string; status: string; lexoffice_id: string | null; lexoffice_status: string | null; invoice_number: string };
    let openInvoices: InvoiceSelect[] = [];
    try {
      openInvoices = await prisma.invoices.findMany({
        where: {
          lexoffice_id: { not: null },
          status: { in: ['draft', 'sent', 'overdue'] },
        },
        select: { id: true, status: true, lexoffice_id: true, lexoffice_status: true, invoice_number: true },
      });
    } catch (invoicesError) {
      console.error('[Lexoffice Sync] Load invoices error:', invoicesError);
      openInvoices = [];
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
              synced_at: new Date(),
            };

            // Bei Bezahlung: paid_at setzen
            if (localStatus === 'paid') {
              updates.paid_at = new Date();
            }

            await prisma.invoices.update({
              where: { id: invoice.id },
              data: updates,
            });

            // PDF Upload wird in Phase 6 (Storage Migration) behandelt
            // Hier erstmal auskommentiert da Supabase Storage noch nicht migriert

            // Sync Log
            await prisma.lexoffice_sync_log.create({
              data: {
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
              },
            });

            results.invoices.push({ id: invoice.id, status_changed: true });
          } else {
            // Nur synced_at aktualisieren
            await prisma.invoices.update({
              where: { id: invoice.id },
              data: { synced_at: new Date() },
            });

            results.invoices.push({ id: invoice.id, status_changed: false });
          }
        } catch (error) {
          const errorMessage =
            error instanceof LexofficeApiError ? error.message : 'Unknown error';
          console.error(
            `[Lexoffice Sync] Invoice ${invoice.id} error:`,
            errorMessage
          );

          await prisma.lexoffice_sync_log.create({
            data: {
              entity_type: 'invoice',
              entity_id: invoice.id,
              lexoffice_id: invoice.lexoffice_id,
              action: 'status_sync',
              status: 'failed',
              error_message: errorMessage,
            },
          });

          results.invoices.push({ id: invoice.id, status_changed: false, error: errorMessage });
        }
      }
    }

    // =====================================================
    // QUOTATION STATUS SYNC
    // =====================================================

    // Offene Angebote mit Lexoffice ID laden
    type QuotationSelect = { id: string; status: string; lexoffice_id: string | null; lexoffice_status: string | null };
    let openQuotations: QuotationSelect[] = [];
    try {
      openQuotations = await prisma.quotations.findMany({
        where: {
          lexoffice_id: { not: null },
          status: { in: ['draft', 'sent'] },
        },
        select: { id: true, status: true, lexoffice_id: true, lexoffice_status: true },
      });
    } catch (quotationsError) {
      console.error('[Lexoffice Sync] Load quotations error:', quotationsError);
      openQuotations = [];
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
              synced_at: new Date(),
            };

            if (localStatus === 'accepted') {
              updates.accepted_at = new Date();
            } else if (localStatus === 'rejected') {
              updates.rejected_at = new Date();
            }

            await prisma.quotations.update({
              where: { id: quotation.id },
              data: updates,
            });

            // Sync Log
            await prisma.lexoffice_sync_log.create({
              data: {
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
              },
            });

            results.quotations.push({ id: quotation.id, status_changed: true });
          } else {
            // Nur synced_at aktualisieren
            await prisma.quotations.update({
              where: { id: quotation.id },
              data: { synced_at: new Date() },
            });

            results.quotations.push({ id: quotation.id, status_changed: false });
          }
        } catch (error) {
          const errorMessage =
            error instanceof LexofficeApiError ? error.message : 'Unknown error';
          console.error(
            `[Lexoffice Sync] Quotation ${quotation.id} error:`,
            errorMessage
          );

          await prisma.lexoffice_sync_log.create({
            data: {
              entity_type: 'quotation',
              entity_id: quotation.id,
              lexoffice_id: quotation.lexoffice_id,
              action: 'status_sync',
              status: 'failed',
              error_message: errorMessage,
            },
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
