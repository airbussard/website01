import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
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
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('invoices')
      .select(`
        *,
        project:pm_projects(id, name, client_id)
      `)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error('[Invoices API] Query error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Rechnungen' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invoices });
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
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Rolle pruefen
    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
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
    const { data: project, error: projectError } = await adminSupabase
      .from('pm_projects')
      .select('id, name, client_id, organization_id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
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
    const invoiceData = {
      invoice_number,
      title: title.trim(),
      description: description?.trim() || null,
      amount: calculatedAmount,
      tax_amount: calculatedTaxAmount,
      total_amount: calculatedTotalAmount,
      currency: currency || 'EUR',
      status: status || 'draft',
      project_id,
      issue_date: issue_date || new Date().toISOString().split('T')[0],
      due_date: due_date || null,
      line_items: typedLineItems || null,
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
      console.error('[Invoices API] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Fehler beim Erstellen der Rechnung' },
        { status: 500 }
      );
    }

    // Activity Log
    await adminSupabase.from('activity_log').insert({
      project_id,
      user_id: user.id,
      action: 'invoice_created',
      entity_type: 'invoice',
      entity_id: invoice.id,
      details: { invoice_number, title: title.trim(), total_amount: invoiceData.total_amount },
    });

    // Lexoffice Sync wenn aktiviert und line_items vorhanden
    let lexofficeId: string | null = null;
    let lexofficeError: string | null = null;
    let pdfUrl: string | null = null;

    if (sync_to_lexoffice && typedLineItems && typedLineItems.length > 0) {
      const { data: settings } = await adminSupabase
        .from('system_settings')
        .select('value')
        .eq('key', 'lexoffice')
        .single();

      const lexofficeSettings = settings?.value as {
        is_enabled: boolean;
        api_key: string | null;
      } | null;

      if (lexofficeSettings?.is_enabled && lexofficeSettings?.api_key) {
        try {
          // Kontakt-Mapping finden
          let contactId: string | null = null;

          if (project.client_id) {
            const { data: contactMapping } = await adminSupabase
              .from('lexoffice_contacts')
              .select('lexoffice_contact_id')
              .eq('profile_id', project.client_id)
              .single();

            contactId = contactMapping?.lexoffice_contact_id || null;
          } else if (project.organization_id) {
            const { data: contactMapping } = await adminSupabase
              .from('lexoffice_contacts')
              .select('lexoffice_contact_id')
              .eq('organization_id', project.organization_id)
              .single();

            contactId = contactMapping?.lexoffice_contact_id || null;
          }

          if (contactId) {
            const lexoffice = createLexofficeClient(lexofficeSettings.api_key);
            const lexofficeData = mapToLexofficeInvoice({
              invoice: invoice as Invoice,
              lexofficeContactId: contactId,
              lineItems: typedLineItems,
            });

            const response = await lexoffice.createInvoice(lexofficeData, finalize_in_lexoffice);
            lexofficeId = response.id;

            // PDF abrufen wenn finalisiert
            if (finalize_in_lexoffice && lexofficeId) {
              try {
                const pdfBuffer = await lexoffice.getInvoicePdf(lexofficeId);

                const pdfFileName = `invoices/${invoice_number}.pdf`;
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
                console.error('[Invoices API] PDF fetch error:', pdfError);
              }
            }

            // Invoice mit Lexoffice ID updaten
            await adminSupabase
              .from('invoices')
              .update({
                lexoffice_id: lexofficeId,
                lexoffice_status: finalize_in_lexoffice ? 'open' : 'draft',
                pdf_url: pdfUrl,
                synced_at: new Date().toISOString(),
              })
              .eq('id', invoice.id);

            // Sync Log
            await adminSupabase.from('lexoffice_sync_log').insert({
              entity_type: 'invoice',
              entity_id: invoice.id,
              lexoffice_id: lexofficeId,
              action: finalize_in_lexoffice ? 'finalize' : 'create',
              status: 'success',
              request_data: lexofficeData,
              response_data: response,
            });
          } else {
            lexofficeError = 'Kein Lexoffice-Kontakt fuer dieses Projekt gefunden';
          }
        } catch (error) {
          if (error instanceof LexofficeApiError) {
            lexofficeError = error.message;
            await adminSupabase.from('lexoffice_sync_log').insert({
              entity_type: 'invoice',
              entity_id: invoice.id,
              action: 'create',
              status: 'failed',
              error_message: error.message,
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
        currency: invoiceData.currency,
      }).format(invoiceData.total_amount);

      // Formatierung des Faelligkeitsdatums
      const formattedDueDate = invoiceData.due_date
        ? new Date(invoiceData.due_date).toLocaleDateString('de-DE', {
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
