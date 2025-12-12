import { NextResponse } from 'next/server';
import { ContactService } from '@/lib/services/contact/ContactService';
import { EmailService } from '@/lib/services/email/EmailService';
import { replyTemplate, replyTextTemplate } from '@/lib/email/templates/reply';

// =====================================================
// REPLY API
// POST: Antwort-E-Mail senden
// =====================================================

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/anfragen/[id]/reply
 * Antwort-E-Mail an den Anfragenden senden
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    // Validierung
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nachricht erforderlich' },
        { status: 400 }
      );
    }

    // Anfrage laden
    const contactRequest = await ContactService.getById(id);
    if (!contactRequest) {
      return NextResponse.json(
        { error: 'Anfrage nicht gefunden' },
        { status: 404 }
      );
    }

    // E-Mail-Einstellungen laden
    const settings = await EmailService.getSettings();
    if (!settings) {
      return NextResponse.json(
        { error: 'E-Mail-Einstellungen nicht konfiguriert' },
        { status: 500 }
      );
    }

    // E-Mail-Templates generieren
    const subject = `Re: Ihre Anfrage [ANFRAGE-${contactRequest.ticket_number}]`;
    const htmlContent = replyTemplate({
      recipientName: contactRequest.name,
      message: message.trim(),
      ticketNumber: contactRequest.ticket_number,
      senderName: settings.from_name,
    });
    const textContent = replyTextTemplate({
      recipientName: contactRequest.name,
      message: message.trim(),
      ticketNumber: contactRequest.ticket_number,
      senderName: settings.from_name,
    });

    // E-Mail zur Queue hinzufügen
    const queueResult = await EmailService.queueEmail({
      contact_request_id: contactRequest.id,
      recipient_email: contactRequest.email,
      recipient_name: contactRequest.name,
      subject,
      content_html: htmlContent,
      content_text: textContent,
      type: 'reply',
    });

    if (!queueResult) {
      return NextResponse.json(
        { error: 'Fehler beim Einreihen der E-Mail' },
        { status: 500 }
      );
    }

    // Nachricht im Verlauf speichern
    await ContactService.createMessage({
      contact_request_id: contactRequest.id,
      direction: 'outgoing',
      from_email: settings.from_email,
      from_name: settings.from_name,
      to_email: contactRequest.email,
      subject,
      content_html: htmlContent,
      content_text: textContent,
    });

    // Status auf "in_bearbeitung" setzen falls noch "neu"
    if (contactRequest.status === 'neu') {
      await ContactService.updateStatus(contactRequest.id, 'in_bearbeitung');
    }

    return NextResponse.json({
      success: true,
      message: 'Antwort wurde in die Warteschlange aufgenommen',
      queueId: queueResult.id,
    });
  } catch (error) {
    console.error('[API] anfragen/[id]/reply POST Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Senden der Antwort' },
      { status: 500 }
    );
  }
}
