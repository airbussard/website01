import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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
  calculateTotalsFromLineItems,
} from '@/lib/lexoffice';
import type { InvoiceLineItem, Invoice } from '@/types/dashboard';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://oscarknabe.de';

/**
 * GET /api/invoices
 * Liste aller Rechnungen (gefiltert nach Berechtigung)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');

    const invoices = await prisma.invoices.findMany({
      where: {
        ...(projectId ? { project_id: projectId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        pm_projects: {
          select: { id: true, name: true, client_id: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Transform to match expected format
    const transformedInvoices = invoices.map(inv => ({
      ...inv,
      project: inv.pm_projects,
      pm_projects: undefined,
    }));

    return NextResponse.json({ invoices: transformedInvoices });
  } catch (error) {
    console.error('[Invoices API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices
 * Erstellt eine neue Rechnung und sendet Email-Benachrichtigung
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID nicht gefunden' },
        { status: 401 }
      );
    }

    // Rolle pruefen
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json(
        { error: 'Keine Berechtigung - nur Manager/Admin' },
        { status: 403 }
      );
    }

    // Request Body parsen
    const body = await request.json();
    const {
      invoice_number,
      title,
      description,
      amount,
      tax_amount,
      total_amount,
      currency,
      status,
      project_id,
      issue_date,
      due_date,
      line_items,
      sync_to_lexoffice = true,
      finalize_in_lexoffice = false,
    } = body;

    // Validierung
    if (!project_id || !title?.trim() || !invoice_number || amount === undefined) {
      return NextResponse.json(
        { error: 'project_id, invoice_number, title und amount sind erforderlich' },
        { status: 400 }
      );
    }

    // Projekt laden fuer Projektname und Lexoffice-Kontakt
    const project = await prisma.pm_projects.findUnique({
      where: { id: project_id },
      select: { id: true, name: true, client_id: true, organization_id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    // Wenn line_items vorhanden, Totals berechnen
    let calculatedAmount = parseFloat(amount);
    let calculatedTaxAmount = parseFloat(tax_amount) || 0;
    let calculatedTotalAmount = parseFloat(total_amount) || parseFloat(amount);
    const typedLineItems = line_items as InvoiceLineItem[] | undefined;

    if (typedLineItems && typedLineItems.length > 0) {
      const totals = calculateTotalsFromLineItems(typedLineItems);
      calculatedAmount = totals.net_amount;
      calculatedTaxAmount = totals.tax_amount;
      calculatedTotalAmount = totals.total_amount;
    }

    // Rechnung erstellen
    const invoice = await prisma.invoices.create({
      data: {
        invoice_number,
        title: title.trim(),
        description: description?.trim() || null,
        amount: calculatedAmount,
        tax_amount: calculatedTaxAmount,
        total_amount: calculatedTotalAmount,
        currency: currency || 'EUR',
        status: status || 'draft',
        project_id,
        issue_date: issue_date ? new Date(issue_date) : new Date(),
        due_date: due_date ? new Date(due_date) : null,
        line_items: typedLineItems as unknown as object || null,
        created_by: userId,
      },
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        project_id,
        user_id: userId,
        action: 'invoice_created',
        entity_type: 'invoice',
        entity_id: invoice.id,
        details: { invoice_number, title: title.trim(), total_amount: calculatedTotalAmount } as object,
      },
    });

    // Lexoffice Sync wenn aktiviert und line_items vorhanden
    let lexofficeId: string | null = null;
    let lexofficeError: string | null = null;
    let pdfUrl: string | null = null;

    if (sync_to_lexoffice && typedLineItems && typedLineItems.length > 0) {
      const settings = await prisma.system_settings.findUnique({
        where: { key: 'lexoffice' },
        select: { value: true },
      });

      const lexofficeSettings = settings?.value as {
        is_enabled: boolean;
        api_key: string | null;
      } | null;

      if (lexofficeSettings?.is_enabled && lexofficeSettings?.api_key) {
        try {
          // Kontakt-Mapping finden
          let contactId: string | null = null;

          if (project.client_id) {
            const contactMapping = await prisma.lexoffice_contacts.findFirst({
              where: { profile_id: project.client_id },
              select: { lexoffice_contact_id: true },
            });
            contactId = contactMapping?.lexoffice_contact_id || null;
          } else if (project.organization_id) {
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
              lineItems: typedLineItems,
            });

            const response = await lexoffice.createInvoice(lexofficeData, finalize_in_lexoffice);
            lexofficeId = response.id;

            // PDF abrufen wenn finalisiert - Phase 6 Storage Migration
            // TODO: PDF Upload zu lokalem Storage statt Supabase Storage

            // Invoice mit Lexoffice ID updaten
            await prisma.invoices.update({
              where: { id: invoice.id },
              data: {
                lexoffice_id: lexofficeId,
                lexoffice_status: finalize_in_lexoffice ? 'open' : 'draft',
                pdf_url: pdfUrl,
                synced_at: new Date(),
              },
            });

            // Sync Log
            await prisma.lexoffice_sync_log.create({
              data: {
                entity_type: 'invoice',
                entity_id: invoice.id,
                lexoffice_id: lexofficeId,
                action: finalize_in_lexoffice ? 'finalize' : 'create',
                status: 'success',
                request_data: lexofficeData as object,
                response_data: response as object,
              },
            });
          } else {
            lexofficeError = 'Kein Lexoffice-Kontakt fuer dieses Projekt gefunden';
          }
        } catch (error) {
          if (error instanceof LexofficeApiError) {
            lexofficeError = error.message;
            await prisma.lexoffice_sync_log.create({
              data: {
                entity_type: 'invoice',
                entity_id: invoice.id,
                action: 'create',
                status: 'failed',
                error_message: error.message,
              },
            });
          } else {
            lexofficeError = 'Unbekannter Lexoffice-Fehler';
            console.error('[Invoices API] Lexoffice error:', error);
          }
        }
      }
    }

    // Email-Benachrichtigungen senden
    try {
      const recipients = await getProjectRecipients(project_id);
      const dashboardUrl = `${BASE_URL}/dashboard/invoices/${invoice.id}`;

      // Formatierung des Betrags
      const formattedAmount = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: currency || 'EUR',
      }).format(calculatedTotalAmount);

      // Formatierung des Faelligkeitsdatums
      const formattedDueDate = due_date
        ? new Date(due_date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : undefined;

      for (const recipient of recipients) {
        await EmailService.queueEmail({
          recipient_email: recipient.email,
          recipient_name: recipient.name,
          subject: `Neue Rechnung: ${invoice_number} - ${project.name}`,
          content_html: invoiceCreatedTemplate({
            recipientName: recipient.name,
            projectName: project.name,
            invoiceNumber: invoice_number,
            invoiceTitle: title.trim(),
            totalAmount: formattedAmount,
            dueDate: formattedDueDate,
            dashboardUrl,
          }),
          content_text: invoiceCreatedTextTemplate({
            recipientName: recipient.name,
            projectName: project.name,
            invoiceNumber: invoice_number,
            invoiceTitle: title.trim(),
            totalAmount: formattedAmount,
            dueDate: formattedDueDate,
            dashboardUrl,
          }),
          type: 'invoice',
          metadata: {
            project_id,
            invoice_id: invoice.id,
          },
        });
      }

      console.log(`[Invoices API] ${recipients.length} Email(s) gequeued`);
    } catch (emailError) {
      // Email-Fehler loggen aber nicht die Response blockieren
      console.error('[Invoices API] Email error:', emailError);
    }

    return NextResponse.json({
      invoice: {
        ...invoice,
        lexoffice_id: lexofficeId,
        pdf_url: pdfUrl,
      },
      lexoffice_synced: !!lexofficeId,
      lexoffice_error: lexofficeError,
    }, { status: 201 });

  } catch (error) {
    console.error('[Invoices API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
