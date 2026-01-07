import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { EmailService } from '@/lib/services/email/EmailService';
import { getProjectRecipients } from '@/lib/services/notifications/getProjectRecipients';
import {
  invoiceCreatedTemplate,
  invoiceCreatedTextTemplate,
} from '@/lib/email/templates/project-notifications';

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
    } = body;

    // Validierung
    if (!project_id || !title?.trim() || !invoice_number || amount === undefined) {
      return NextResponse.json(
        { error: 'project_id, invoice_number, title und amount sind erforderlich' },
        { status: 400 }
      );
    }

    // Projekt laden fuer Projektname
    const { data: project, error: projectError } = await adminSupabase
      .from('pm_projects')
      .select('id, name')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    // Rechnung erstellen
    const invoiceData = {
      invoice_number,
      title: title.trim(),
      description: description?.trim() || null,
      amount: parseFloat(amount),
      tax_amount: parseFloat(tax_amount) || 0,
      total_amount: parseFloat(total_amount) || parseFloat(amount),
      currency: currency || 'EUR',
      status: status || 'draft',
      project_id,
      issue_date: issue_date || new Date().toISOString().split('T')[0],
      due_date: due_date || null,
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

    return NextResponse.json({ invoice }, { status: 201 });

  } catch (error) {
    console.error('[Invoices API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
