// =====================================================
// REPLY E-MAIL TEMPLATES
// =====================================================

interface ReplyTemplateOptions {
  recipientName: string;
  message: string;
  ticketNumber: number;
  senderName?: string;
}

/**
 * HTML-Template für Antwort-E-Mails
 */
export function replyTemplate(options: ReplyTemplateOptions): string {
  const { recipientName, message, ticketNumber, senderName = 'getemergence.com' } = options;

  // Nachricht mit Zeilenumbrüchen in HTML umwandeln
  const formattedMessage = escapeHtml(message).replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Antwort auf Ihre Anfrage</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 2px solid #3b82f6;">
          <!-- Header mit Logo -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; border-bottom: 2px solid #3b82f6;">
              <img src="https://getemergence.com/getemergence-logo.png" alt="getemergence.com" style="height: 40px; width: auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff;">
              <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.7;">
                ${formattedMessage}
              </p>

              <p style="margin: 24px 0 8px; color: #374151; font-size: 16px; line-height: 1.6;">
                Mit freundlichen Grüßen,
              </p>
              <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 600;">
                ${escapeHtml(senderName)}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                Ticket-Referenz: ANFRAGE-${ticketNumber}
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Bitte behalten Sie diese Referenznummer für zukünftige Kommunikation.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain-Text Version der Antwort
 */
export function replyTextTemplate(options: ReplyTemplateOptions): string {
  const { recipientName, message, ticketNumber, senderName = 'getemergence.com' } = options;

  let text = `${message}\n\n`;
  text += `Mit freundlichen Grüßen,\n`;
  text += `${senderName}\n\n`;
  text += `---\n`;
  text += `Ticket-Referenz: ANFRAGE-${ticketNumber}\n`;
  text += `Bitte behalten Sie diese Referenznummer für zukünftige Kommunikation.`;

  return text;
}

/**
 * HTML escapen um XSS zu verhindern
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
