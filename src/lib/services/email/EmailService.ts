import { prisma } from '@/lib/prisma';
import type {
  EmailSettings,
  UpdateEmailSettings,
  EmailQueueItem,
  CreateEmailQueueItem,
  QueueStats,
  EmailQueueStatus,
} from '@/types/email';

// =====================================================
// EMAIL SERVICE
// Zentrale Klasse für E-Mail-Settings und Queue-Verwaltung
// =====================================================

export class EmailService {
  // =====================================================
  // SETTINGS
  // =====================================================

  /**
   * Aktuelle E-Mail-Einstellungen laden
   */
  static async getSettings(): Promise<EmailSettings | null> {
    try {
      const data = await prisma.email_settings.findFirst();

      if (!data) return null;
      return data as unknown as EmailSettings;
    } catch (err) {
      console.error('[EmailService] getSettings Exception:', err);
      return null;
    }
  }

  /**
   * E-Mail-Einstellungen aktualisieren
   */
  static async updateSettings(settings: UpdateEmailSettings): Promise<boolean> {
    try {
      // Ersten (und einzigen) Eintrag holen
      const existing = await prisma.email_settings.findFirst({
        select: { id: true },
      });

      if (!existing) {
        // Neuen Eintrag erstellen
        await prisma.email_settings.create({
          data: settings as Record<string, unknown>,
        });
      } else {
        // Existierenden Eintrag aktualisieren
        await prisma.email_settings.update({
          where: { id: existing.id },
          data: settings as Record<string, unknown>,
        });
      }

      return true;
    } catch (err) {
      console.error('[EmailService] updateSettings Exception:', err);
      return false;
    }
  }

  // =====================================================
  // QUEUE MANAGEMENT
  // =====================================================

  /**
   * E-Mail zur Warteschlange hinzufügen
   */
  static async queueEmail(item: CreateEmailQueueItem): Promise<EmailQueueItem | null> {
    try {
      const data = await prisma.email_queue.create({
        data: {
          contact_request_id: item.contact_request_id || null,
          recipient_email: item.recipient_email,
          recipient_name: item.recipient_name || null,
          subject: item.subject,
          content_html: item.content_html,
          content_text: item.content_text || null,
          type: item.type || 'notification',
          metadata: (item.metadata || {}) as object,
          status: 'pending',
          attempts: 0,
          max_attempts: 3,
        },
      });

      console.log('[EmailService] E-Mail gequeued:', data.id);
      return data as unknown as EmailQueueItem;
    } catch (err) {
      console.error('[EmailService] queueEmail Exception:', err);
      return null;
    }
  }

  /**
   * Atomisches Claimen von pending E-Mails für Verarbeitung
   * Nutzt die PostgreSQL-Funktion claim_pending_emails via Raw SQL
   */
  static async claimPendingEmails(limit: number = 10): Promise<EmailQueueItem[]> {
    try {
      const data = await prisma.$queryRaw<EmailQueueItem[]>`
        SELECT * FROM claim_pending_emails(${limit})
      `;

      return data || [];
    } catch (err) {
      console.error('[EmailService] claimPendingEmails Exception:', err);
      return [];
    }
  }

  /**
   * Status einer Queue-E-Mail aktualisieren
   */
  static async updateQueueStatus(
    id: string,
    status: EmailQueueStatus,
    options?: {
      error_message?: string;
      sent_at?: string;
    }
  ): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = { status };

      if (options?.error_message !== undefined) {
        updateData.error_message = options.error_message;
      }
      if (options?.sent_at) {
        updateData.sent_at = new Date(options.sent_at);
      }

      await prisma.email_queue.update({
        where: { id },
        data: updateData,
      });

      return true;
    } catch (err) {
      console.error('[EmailService] updateQueueStatus Exception:', err);
      return false;
    }
  }

  /**
   * Queue-Statistiken abrufen
   */
  static async getQueueStats(): Promise<QueueStats> {
    try {
      const [total, pending, processing, sent, failed] = await Promise.all([
        prisma.email_queue.count(),
        prisma.email_queue.count({ where: { status: 'pending' } }),
        prisma.email_queue.count({ where: { status: 'processing' } }),
        prisma.email_queue.count({ where: { status: 'sent' } }),
        prisma.email_queue.count({ where: { status: 'failed' } }),
      ]);

      return {
        total,
        pending,
        processing,
        sent,
        failed,
      };
    } catch (err) {
      console.error('[EmailService] getQueueStats Exception:', err);
      return { total: 0, pending: 0, processing: 0, sent: 0, failed: 0 };
    }
  }

  /**
   * Queue-Items mit optionalem Filter abrufen
   */
  static async getQueueItems(options?: {
    status?: EmailQueueStatus;
    limit?: number;
  }): Promise<EmailQueueItem[]> {
    try {
      const data = await prisma.email_queue.findMany({
        where: options?.status ? { status: options.status } : undefined,
        orderBy: { created_at: 'desc' },
        take: options?.limit,
      });

      return data as unknown as EmailQueueItem[];
    } catch (err) {
      console.error('[EmailService] getQueueItems Exception:', err);
      return [];
    }
  }

  /**
   * Queue-Item für erneuten Versuch markieren
   */
  static async retryQueueItem(id: string): Promise<boolean> {
    try {
      await prisma.email_queue.update({
        where: { id },
        data: {
          status: 'pending',
          attempts: 0,
          error_message: null,
        },
      });

      return true;
    } catch (err) {
      console.error('[EmailService] retryQueueItem Exception:', err);
      return false;
    }
  }

  /**
   * Queue-Item löschen
   */
  static async deleteQueueItem(id: string): Promise<boolean> {
    try {
      await prisma.email_queue.delete({
        where: { id },
      });

      return true;
    } catch (err) {
      console.error('[EmailService] deleteQueueItem Exception:', err);
      return false;
    }
  }

  /**
   * Stuck E-Mails zurücksetzen (die zu lange auf "processing" stehen)
   */
  static async resetStuckProcessingEmails(olderThanMinutes: number = 30): Promise<number> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - olderThanMinutes);

      const result = await prisma.email_queue.updateMany({
        where: {
          status: 'processing',
          last_attempt_at: { lt: cutoffTime },
        },
        data: { status: 'pending' },
      });

      const count = result.count;
      if (count > 0) {
        console.log(`[EmailService] ${count} stuck E-Mails zurückgesetzt`);
      }

      return count;
    } catch (err) {
      console.error('[EmailService] resetStuckProcessingEmails Exception:', err);
      return 0;
    }
  }
}
