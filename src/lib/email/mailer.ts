import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { EmailSettings, SendEmailOptions, SendEmailResult } from '@/types/email';

// =====================================================
// MAILER - SMTP Client
// =====================================================

/**
 * Nodemailer Transporter erstellen
 */
export function createTransporter(settings: EmailSettings): Transporter {
  return nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port,
    secure: settings.smtp_port === 465, // true für Port 465, false für andere
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_password,
    },
    connectionTimeout: 30000, // 30 Sekunden
    greetingTimeout: 30000,
    socketTimeout: 60000, // 60 Sekunden
  });
}

/**
 * E-Mail versenden
 */
export async function sendEmail(
  settings: EmailSettings,
  options: SendEmailOptions
): Promise<SendEmailResult> {
  try {
    const transporter = createTransporter(settings);

    const mailOptions = {
      from: `"${settings.from_name}" <${settings.from_email}>`,
      to: options.toName ? `"${options.toName}" <${options.to}>` : options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
      messageId: generateMessageId(settings.from_email),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('[Mailer] E-Mail gesendet:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unbekannter Fehler';
    console.error('[Mailer] Fehler beim Senden:', error);

    return {
      success: false,
      error,
    };
  }
}

/**
 * SMTP-Verbindung testen
 */
export async function testConnection(settings: EmailSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter(settings);
    await transporter.verify();

    console.log('[Mailer] SMTP-Verbindung erfolgreich');
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Verbindung fehlgeschlagen';
    console.error('[Mailer] SMTP-Verbindungstest fehlgeschlagen:', error);

    return { success: false, error };
  }
}

/**
 * Message-ID generieren für E-Mail-Threading
 */
export function generateMessageId(fromEmail: string): string {
  const domain = fromEmail.split('@')[1] || 'getemergence.com';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `<${timestamp}.${random}@${domain}>`;
}
