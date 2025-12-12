// =====================================================
// E-MAIL TEMPLATES
// =====================================================

interface ContactNotificationData {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  projectType?: string;
}

/**
 * Benachrichtigungs-E-Mail für neue Kontaktanfrage
 */
export function contactNotificationTemplate(data: ContactNotificationData): string {
  const { name, email, company, subject, message, projectType } = data;

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neue Kontaktanfrage</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 2px solid #3b82f6;">
          <!-- Header mit Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 24px 40px; text-align: center;">
              <div style="font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                getemergence<span style="color: rgba(255,255,255,0.7);">.com</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff;">
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 20px; font-weight: 600;">
                Neue Kontaktanfrage
              </h2>

              <!-- Info Box -->
              <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</strong>
                          <p style="margin: 4px 0 0; color: #111827; font-size: 15px;">${escapeHtml(name)}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">E-Mail</strong>
                          <p style="margin: 4px 0 0; color: #111827; font-size: 15px;">
                            <a href="mailto:${escapeHtml(email)}" style="color: #3b82f6; text-decoration: none;">${escapeHtml(email)}</a>
                          </p>
                        </td>
                      </tr>
                      ${company ? `
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Firma</strong>
                          <p style="margin: 4px 0 0; color: #111827; font-size: 15px;">${escapeHtml(company)}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${projectType ? `
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Projekttyp</strong>
                          <p style="margin: 4px 0 0; color: #111827; font-size: 15px;">${escapeHtml(projectType)}</p>
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Betreff</strong>
                          <p style="margin: 4px 0 0; color: #111827; font-size: 15px;">${escapeHtml(subject)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 12px;">Nachricht</strong>
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(message)}</p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <a href="mailto:${escapeHtml(email)}?subject=Re: ${escapeHtml(subject)}"
                       style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">
                      Direkt antworten
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                Diese E-Mail wurde automatisch von getemergence.com generiert.
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
 * Plain-Text Version der Benachrichtigung
 */
export function contactNotificationTextTemplate(data: ContactNotificationData): string {
  const { name, email, company, subject, message, projectType } = data;

  let text = `NEUE KONTAKTANFRAGE\n`;
  text += `==================\n\n`;
  text += `Name: ${name}\n`;
  text += `E-Mail: ${email}\n`;
  if (company) text += `Firma: ${company}\n`;
  if (projectType) text += `Projekttyp: ${projectType}\n`;
  text += `Betreff: ${subject}\n\n`;
  text += `NACHRICHT:\n`;
  text += `----------\n`;
  text += `${message}\n\n`;
  text += `----------\n`;
  text += `Diese E-Mail wurde automatisch von getemergence.com generiert.`;

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
