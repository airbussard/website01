// =====================================================
// PROJECT NOTIFICATION E-MAIL TEMPLATES
// =====================================================

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

// =====================================================
// PROJECT UPDATE TEMPLATE
// =====================================================

interface ProjectUpdateData {
  recipientName: string;
  projectName: string;
  updateTitle: string;
  updateContent?: string;
  progressPercentage?: number;
  dashboardUrl: string;
}

export function projectUpdateTemplate(data: ProjectUpdateData): string {
  const { recipientName, projectName, updateTitle, updateContent, progressPercentage, dashboardUrl } = data;

  const progressSection = progressPercentage !== undefined ? `
    <div style="margin: 20px 0;">
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">Fortschritt:</p>
      <div style="background-color: #e5e7eb; border-radius: 999px; height: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); height: 100%; width: ${progressPercentage}%; border-radius: 999px;"></div>
      </div>
      <p style="margin: 8px 0 0; color: #374151; font-size: 14px; font-weight: 600;">${progressPercentage}% abgeschlossen</p>
    </div>
  ` : '';

  const contentSection = updateContent ? `
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(updateContent)}</p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neues Projekt-Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 2px solid #3b82f6;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 24px 40px; text-align: center;">
              <img src="https://getemergence.com/getemergence-logo.png" alt="getemergence.com" style="height: 40px; width: auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff;">
              <h2 style="margin: 0 0 8px; color: #111827; font-size: 20px; font-weight: 600;">
                Neues Update zu Ihrem Projekt
              </h2>
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">
                Projekt: ${escapeHtml(projectName)}
              </p>

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
                <p style="margin: 0; color: #1e40af; font-size: 16px; font-weight: 600;">
                  ${escapeHtml(updateTitle)}
                </p>
              </div>

              ${contentSection}
              ${progressSection}

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin-top: 24px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${escapeHtml(dashboardUrl)}"
                       style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">
                      Im Dashboard ansehen
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

export function projectUpdateTextTemplate(data: ProjectUpdateData): string {
  const { recipientName, projectName, updateTitle, updateContent, progressPercentage, dashboardUrl } = data;

  let text = `NEUES PROJEKT-UPDATE\n`;
  text += `====================\n\n`;
  text += `Projekt: ${projectName}\n\n`;
  text += `Update: ${updateTitle}\n`;
  if (updateContent) {
    text += `\n${updateContent}\n`;
  }
  if (progressPercentage !== undefined) {
    text += `\nFortschritt: ${progressPercentage}%\n`;
  }
  text += `\n---\n`;
  text += `Im Dashboard ansehen: ${dashboardUrl}\n\n`;
  text += `Diese E-Mail wurde automatisch von getemergence.com generiert.`;

  return text;
}

// =====================================================
// INVOICE CREATED TEMPLATE
// =====================================================

interface InvoiceCreatedData {
  recipientName: string;
  projectName: string;
  invoiceNumber: string;
  invoiceTitle: string;
  totalAmount: string;
  dueDate?: string;
  dashboardUrl: string;
}

export function invoiceCreatedTemplate(data: InvoiceCreatedData): string {
  const { recipientName, projectName, invoiceNumber, invoiceTitle, totalAmount, dueDate, dashboardUrl } = data;

  const dueDateSection = dueDate ? `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <strong style="color: #6b7280; font-size: 13px;">Faellig am</strong>
        <p style="margin: 4px 0 0; color: #111827; font-size: 15px;">${escapeHtml(dueDate)}</p>
      </td>
    </tr>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neue Rechnung</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 2px solid #3b82f6;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 24px 40px; text-align: center;">
              <img src="https://getemergence.com/getemergence-logo.png" alt="getemergence.com" style="height: 40px; width: auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff;">
              <h2 style="margin: 0 0 8px; color: #111827; font-size: 20px; font-weight: 600;">
                Neue Rechnung erstellt
              </h2>
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">
                Projekt: ${escapeHtml(projectName)}
              </p>

              <!-- Invoice Details -->
              <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #6b7280; font-size: 13px;">Rechnungsnummer</strong>
                          <p style="margin: 4px 0 0; color: #111827; font-size: 15px; font-weight: 600;">${escapeHtml(invoiceNumber)}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #6b7280; font-size: 13px;">Beschreibung</strong>
                          <p style="margin: 4px 0 0; color: #111827; font-size: 15px;">${escapeHtml(invoiceTitle)}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #6b7280; font-size: 13px;">Betrag</strong>
                          <p style="margin: 4px 0 0; color: #059669; font-size: 18px; font-weight: 700;">${escapeHtml(totalAmount)}</p>
                        </td>
                      </tr>
                      ${dueDateSection}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${escapeHtml(dashboardUrl)}"
                       style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">
                      Rechnung ansehen
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

export function invoiceCreatedTextTemplate(data: InvoiceCreatedData): string {
  const { recipientName, projectName, invoiceNumber, invoiceTitle, totalAmount, dueDate, dashboardUrl } = data;

  let text = `NEUE RECHNUNG\n`;
  text += `=============\n\n`;
  text += `Projekt: ${projectName}\n\n`;
  text += `Rechnungsnummer: ${invoiceNumber}\n`;
  text += `Beschreibung: ${invoiceTitle}\n`;
  text += `Betrag: ${totalAmount}\n`;
  if (dueDate) {
    text += `Faellig am: ${dueDate}\n`;
  }
  text += `\n---\n`;
  text += `Rechnung ansehen: ${dashboardUrl}\n\n`;
  text += `Diese E-Mail wurde automatisch von getemergence.com generiert.`;

  return text;
}

// =====================================================
// CONTRACT READY TEMPLATE
// =====================================================

interface ContractReadyData {
  recipientName: string;
  projectName: string;
  contractTitle: string;
  contractDescription?: string;
  validUntil?: string;
  dashboardUrl: string;
}

export function contractReadyTemplate(data: ContractReadyData): string {
  const { recipientName, projectName, contractTitle, contractDescription, validUntil, dashboardUrl } = data;

  const descriptionSection = contractDescription ? `
    <p style="margin: 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
      ${escapeHtml(contractDescription)}
    </p>
  ` : '';

  const validUntilSection = validUntil ? `
    <p style="margin: 16px 0; color: #dc2626; font-size: 14px;">
      <strong>Gueltig bis:</strong> ${escapeHtml(validUntil)}
    </p>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vertrag zur Unterschrift</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 2px solid #3b82f6;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 24px 40px; text-align: center;">
              <img src="https://getemergence.com/getemergence-logo.png" alt="getemergence.com" style="height: 40px; width: auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff;">
              <h2 style="margin: 0 0 8px; color: #111827; font-size: 20px; font-weight: 600;">
                Vertrag zur Unterschrift bereit
              </h2>
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">
                Projekt: ${escapeHtml(projectName)}
              </p>

              <!-- Contract Info Box -->
              <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="font-size: 24px; margin-right: 12px;">📄</span>
                  <span style="color: #92400e; font-size: 16px; font-weight: 600;">${escapeHtml(contractTitle)}</span>
                </div>
                ${descriptionSection}
                ${validUntilSection}
                <p style="margin: 0; color: #78350f; font-size: 14px;">
                  Bitte unterschreiben Sie den Vertrag in Ihrem Dashboard.
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${escapeHtml(dashboardUrl)}"
                       style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">
                      Vertrag ansehen & unterschreiben
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

export function contractReadyTextTemplate(data: ContractReadyData): string {
  const { recipientName, projectName, contractTitle, contractDescription, validUntil, dashboardUrl } = data;

  let text = `VERTRAG ZUR UNTERSCHRIFT\n`;
  text += `========================\n\n`;
  text += `Projekt: ${projectName}\n\n`;
  text += `Vertrag: ${contractTitle}\n`;
  if (contractDescription) {
    text += `${contractDescription}\n`;
  }
  if (validUntil) {
    text += `\nGueltig bis: ${validUntil}\n`;
  }
  text += `\nBitte unterschreiben Sie den Vertrag in Ihrem Dashboard.\n`;
  text += `\n---\n`;
  text += `Vertrag ansehen: ${dashboardUrl}\n\n`;
  text += `Diese E-Mail wurde automatisch von getemergence.com generiert.`;

  return text;
}
