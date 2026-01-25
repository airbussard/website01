import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/services/email/EmailService';
import { getProjectRecipients } from '@/lib/services/notifications/getProjectRecipients';
import {
  invoiceCreatedTemplate,
  invoiceCreatedTextTemplate,
} from '@/lib/email/templates/project-notifications';
import {
  createLexofficeClient,
  mapToLexofficeInvoice,
  LexofficeApiError,
} from '@/lib/lexoffice';
import type { InvoiceLineItem, Invoice, RecurringInterval } from '@/types/dashboard';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://oscarknabe.de';
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/generate-recurring-invoices
 * Generiert faellige wiederkehrende Rechnungen
 *
 * Soll taeglich ausgefuehrt werden (z.B. um 6:00 Uhr)
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Alle faelligen aktiven Recurring Invoices laden
    let dueRecurringInvoices;
    try {
      dueRecurringInvoices = await prisma.recurring_invoices.findMany({
        where: {
          is_active: true,
          next_invoice_date: { lte: today },
        },
        include: {
          pm_projects: {
            select: { id: true, name: true, client_id: true, organization_id: true },
          },
        },
      });
    } catch (loadError) {
      console.error('[Cron] Load recurring invoices error:', loadError);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    if (!dueRecurringInvoices || dueRecurringInvoices.length === 0) {
      return NextResponse.json({
        message: 'Keine faelligen wiederkehrenden Rechnungen',
        processed: 0,
      });
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

    const results: Array<{
      recurring_id: string;
      invoice_id?: string;
      success: boolean;
      error?: string;
    }> = [];

    const todayStr = today.toISOString().split('T')[0];

    for (const recurring of dueRecurringInvoices) {
      try {
        // Pruefen ob end_date erreicht
        if (recurring.end_date && recurring.end_date < today) {
          // Deaktivieren
          await prisma.recurring_invoices.update({
            where: { id: recurring.id },
            data: { is_active: false },
          });

          results.push({
            recurring_id: recurring.id,
            success: true,
            error: 'End date reached, deactivated',
          });
          continue;
        }

        // Rechnungsnummer generieren
        const year = new Date().getFullYear();
        const yearStart = new Date(`${year}-01-01`);
        const yearEnd = new Date(`${year + 1}-01-01`);

        const count = await prisma.invoices.count({
          where: {
            created_at: { gte: yearStart, lt: yearEnd },
          },
        });

        const invoiceNumber = `RE-${year}-${String((count || 0) + 1).padStart(4, '0')}`;

        const lineItems = recurring.line_items as unknown as InvoiceLineItem[];
        const netAmount = Number(recurring.net_amount);
        const taxRate = Number(recurring.tax_rate) || 19;
        const taxAmount = netAmount * (taxRate / 100);
        const totalAmount = netAmount + taxAmount;

        // Project ID ist erforderlich
        if (!recurring.project_id) {
          results.push({
            recurring_id: recurring.id,
            success: false,
            error: 'Keine Projekt-ID vorhanden',
          });
          continue;
        }

        // Faelligkeitsdatum (30 Tage)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        // Rechnung erstellen
        let invoice;
        try {
          invoice = await prisma.invoices.create({
            data: {
              invoice_number: invoiceNumber,
              title: recurring.title,
              description: recurring.description,
              amount: netAmount,
              tax_amount: taxAmount,
              total_amount: totalAmount,
              currency: 'EUR',
              status: 'draft',
              project_id: recurring.project_id,
              issue_date: today,
              due_date: dueDate,
              line_items: lineItems as object,
              created_by: recurring.created_by,
            },
          });
        } catch (insertError) {
          console.error('[Cron] Invoice insert error:', insertError);
          results.push({
            recurring_id: recurring.id,
            success: false,
            error: 'Fehler beim Erstellen der Rechnung',
          });
          continue;
        }

        // Lexoffice Sync wenn aktiviert
        let lexofficeId: string | null = null;

        if (
          lexofficeSettings?.is_enabled &&
          lexofficeSettings?.api_key &&
          recurring.auto_send
        ) {
          try {
            const project = recurring.pm_projects;
            let contactId: string | null = null;

            if (project?.client_id) {
              const contactMapping = await prisma.lexoffice_contacts.findFirst({
                where: { profile_id: project.client_id },
                select: { lexoffice_contact_id: true },
              });

              contactId = contactMapping?.lexoffice_contact_id || null;
            } else if (project?.organization_id) {
              const contactMapping = await prisma.lexoffice_contacts.findFirst({
                where: { organization_id: project.organization_id },
                select: { lexoffice_contact_id: true },
              });

              contactId = contactMapping?.lexoffice_contact_id || null;
            }

            if (contactId) {
              const lexoffice = createLexofficeClient(lexofficeSettings.api_key);
              const lexofficeData = mapToLexofficeInvoice({
                invoice: invoice as unknown as Invoice,
                lexofficeContactId: contactId,
                lineItems,
              });

              const response = await lexoffice.createInvoice(lexofficeData, true);
              lexofficeId = response.id;

              // Invoice aktualisieren
              await prisma.invoices.update({
                where: { id: invoice.id },
                data: {
                  lexoffice_id: lexofficeId,
                  lexoffice_status: 'open',
                  status: 'sent',
                  synced_at: new Date(),
                },
              });

              // Sync Log
              await prisma.lexoffice_sync_log.create({
                data: {
                  entity_type: 'invoice',
                  entity_id: invoice.id,
                  lexoffice_id: lexofficeId,
                  action: 'create_from_recurring',
                  status: 'success',
                },
              });
            }
          } catch (lexError) {
            console.error('[Cron] Lexoffice sync error:', lexError);
            if (lexError instanceof LexofficeApiError) {
              await prisma.lexoffice_sync_log.create({
                data: {
                  entity_type: 'invoice',
                  entity_id: invoice.id,
                  action: 'create_from_recurring',
                  status: 'failed',
                  error_message: lexError.message,
                },
              });
            }
          }
        }

        // History eintragen
        await prisma.recurring_invoice_history.create({
          data: {
            recurring_invoice_id: recurring.id,
            invoice_id: invoice.id,
            generated_at: new Date(),
          },
        });

        // Naechstes Datum berechnen
        const nextDate = calculateNextDate(
          new Date(recurring.next_invoice_date!),
          recurring.interval_type as RecurringInterval,
          recurring.interval_value
        );

        // Recurring Invoice aktualisieren
        await prisma.recurring_invoices.update({
          where: { id: recurring.id },
          data: {
            next_invoice_date: nextDate,
            last_generated_at: new Date(),
            invoices_generated: (recurring.invoices_generated || 0) + 1,
          },
        });

        // Email-Benachrichtigung wenn aktiviert
        if (recurring.send_notification) {
          try {
            const projectName = recurring.pm_projects?.name || 'Projekt';
            const recipients = await getProjectRecipients(recurring.project_id);
            const dashboardUrl = `${BASE_URL}/dashboard/invoices/${invoice.id}`;

            const formattedAmount = new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
            }).format(totalAmount);

            const formattedDueDate = dueDate.toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });

            for (const recipient of recipients) {
              await EmailService.queueEmail({
                recipient_email: recipient.email,
                recipient_name: recipient.name,
                subject: `Wiederkehrende Rechnung: ${invoiceNumber} - ${projectName}`,
                content_html: invoiceCreatedTemplate({
                  recipientName: recipient.name,
                  projectName,
                  invoiceNumber,
                  invoiceTitle: recurring.title,
                  totalAmount: formattedAmount,
                  dueDate: formattedDueDate,
                  dashboardUrl,
                }),
                content_text: invoiceCreatedTextTemplate({
                  recipientName: recipient.name,
                  projectName,
                  invoiceNumber,
                  invoiceTitle: recurring.title,
                  totalAmount: formattedAmount,
                  dueDate: formattedDueDate,
                  dashboardUrl,
                }),
                type: 'invoice',
                metadata: {
                  project_id: recurring.project_id,
                  invoice_id: invoice.id,
                  recurring_invoice_id: recurring.id,
                },
              });
            }
          } catch (emailError) {
            console.error('[Cron] Email error:', emailError);
          }
        }

        results.push({
          recurring_id: recurring.id,
          invoice_id: invoice.id,
          success: true,
        });
      } catch (error) {
        console.error('[Cron] Processing error:', error);
        results.push({
          recurring_id: recurring.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `${successCount} Rechnungen generiert, ${failCount} fehlgeschlagen`,
      processed: results.length,
      success_count: successCount,
      fail_count: failCount,
      results,
    });
  } catch (error) {
    console.error('[Cron] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * Berechnet das naechste Rechnungsdatum
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
