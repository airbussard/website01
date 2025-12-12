import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email/EmailService';
import { sendEmail } from '@/lib/email/mailer';

// =====================================================
// CRON: E-MAIL QUEUE VERARBEITUNG
// Einfacher GET-Endpoint ohne Auth für Cron-Service
// =====================================================

/**
 * GET /api/cron/process-email-queue
 * Verarbeitet pending E-Mails in der Queue
 */
export async function GET() {
  const startTime = Date.now();
  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // 1. E-Mail-Einstellungen laden
    const settings = await EmailService.getSettings();

    if (!settings) {
      return NextResponse.json({
        success: false,
        error: 'Keine E-Mail-Einstellungen gefunden',
        results,
      });
    }

    if (!settings.is_active) {
      return NextResponse.json({
        success: true,
        message: 'E-Mail-System ist deaktiviert',
        results,
      });
    }

    // 2. Stuck E-Mails zurücksetzen (älter als 30 Minuten auf "processing")
    const resetCount = await EmailService.resetStuckProcessingEmails(30);
    if (resetCount > 0) {
      console.log(`[Cron] ${resetCount} stuck E-Mails zurückgesetzt`);
    }

    // 3. Pending E-Mails claimen (atomisch, max 10)
    const emails = await EmailService.claimPendingEmails(10);

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Keine E-Mails zu verarbeiten',
        results,
      });
    }

    console.log(`[Cron] ${emails.length} E-Mails zu verarbeiten`);

    // 4. Jede E-Mail verarbeiten
    for (const email of emails) {
      results.processed++;

      try {
        const sendResult = await sendEmail(settings, {
          to: email.recipient_email,
          toName: email.recipient_name || undefined,
          subject: email.subject,
          html: email.content_html,
          text: email.content_text || undefined,
        });

        if (sendResult.success) {
          // Erfolg
          await EmailService.updateQueueStatus(email.id, 'sent', {
            sent_at: new Date().toISOString(),
            error_message: undefined,
          });
          results.sent++;
          console.log(`[Cron] E-Mail gesendet: ${email.id}`);
        } else {
          // Fehler beim Senden
          const shouldRetry = email.attempts < email.max_attempts;
          const newStatus = shouldRetry ? 'pending' : 'failed';

          await EmailService.updateQueueStatus(email.id, newStatus, {
            error_message: sendResult.error,
          });

          if (!shouldRetry) {
            results.failed++;
          }

          results.errors.push(`${email.id}: ${sendResult.error}`);
          console.error(`[Cron] E-Mail Fehler: ${email.id} - ${sendResult.error}`);
        }
      } catch (err) {
        // Unerwarteter Fehler
        const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
        const shouldRetry = email.attempts < email.max_attempts;
        const newStatus = shouldRetry ? 'pending' : 'failed';

        await EmailService.updateQueueStatus(email.id, newStatus, {
          error_message: errorMessage,
        });

        if (!shouldRetry) {
          results.failed++;
        }

        results.errors.push(`${email.id}: ${errorMessage}`);
        console.error(`[Cron] E-Mail Exception: ${email.id}`, err);
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `${results.sent} von ${results.processed} E-Mails gesendet`,
      duration: `${duration}ms`,
      results,
    });
  } catch (error) {
    console.error('[Cron] process-email-queue Fehler:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Verarbeitung fehlgeschlagen',
      results,
    }, { status: 500 });
  }
}
