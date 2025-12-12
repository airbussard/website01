import { createAdminSupabaseClient } from '@/lib/supabase/admin';
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
      const supabase = createAdminSupabaseClient();

      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('[EmailService] Fehler beim Laden der Settings:', error);
        return null;
      }

      return data as EmailSettings;
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
      const supabase = createAdminSupabaseClient();

      // Ersten (und einzigen) Eintrag holen
      const { data: existing } = await supabase
        .from('email_settings')
        .select('id')
        .limit(1)
        .single();

      if (!existing) {
        // Neuen Eintrag erstellen
        const { error } = await supabase
          .from('email_settings')
          .insert(settings);

        if (error) {
          console.error('[EmailService] Fehler beim Erstellen der Settings:', error);
          return false;
        }
      } else {
        // Existierenden Eintrag aktualisieren
        const { error } = await supabase
          .from('email_settings')
          .update(settings)
          .eq('id', existing.id);

        if (error) {
          console.error('[EmailService] Fehler beim Aktualisieren der Settings:', error);
          return false;
        }
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
      const supabase = createAdminSupabaseClient();

      const queueItem = {
        contact_request_id: item.contact_request_id || null,
        recipient_email: item.recipient_email,
        recipient_name: item.recipient_name || null,
        subject: item.subject,
        content_html: item.content_html,
        content_text: item.content_text || null,
        type: item.type || 'notification',
        metadata: item.metadata || {},
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
      };

      const { data, error } = await supabase
        .from('email_queue')
        .insert(queueItem)
        .select()
        .single();

      if (error) {
        console.error('[EmailService] Fehler beim Queuen der E-Mail:', error);
        return null;
      }

      console.log('[EmailService] E-Mail gequeued:', data.id);
      return data as EmailQueueItem;
    } catch (err) {
      console.error('[EmailService] queueEmail Exception:', err);
      return null;
    }
  }

  /**
   * Atomisches Claimen von pending E-Mails für Verarbeitung
   * Nutzt die PostgreSQL-Funktion claim_pending_emails
   */
  static async claimPendingEmails(limit: number = 10): Promise<EmailQueueItem[]> {
    try {
      const supabase = createAdminSupabaseClient();

      const { data, error } = await supabase
        .rpc('claim_pending_emails', { max_count: limit });

      if (error) {
        console.error('[EmailService] Fehler beim Claimen der E-Mails:', error);
        return [];
      }

      return (data || []) as EmailQueueItem[];
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
      const supabase = createAdminSupabaseClient();

      const updateData: Record<string, unknown> = { status };

      if (options?.error_message !== undefined) {
        updateData.error_message = options.error_message;
      }
      if (options?.sent_at) {
        updateData.sent_at = options.sent_at;
      }

      const { error } = await supabase
        .from('email_queue')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('[EmailService] Fehler beim Status-Update:', error);
        return false;
      }

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
      const supabase = createAdminSupabaseClient();

      const [total, pending, processing, sent, failed] = await Promise.all([
        supabase.from('email_queue').select('*', { count: 'exact', head: true }),
        supabase.from('email_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('email_queue').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
        supabase.from('email_queue').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
        supabase.from('email_queue').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
      ]);

      return {
        total: total.count || 0,
        pending: pending.count || 0,
        processing: processing.count || 0,
        sent: sent.count || 0,
        failed: failed.count || 0,
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
      const supabase = createAdminSupabaseClient();

      let query = supabase
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[EmailService] Fehler beim Laden der Queue-Items:', error);
        return [];
      }

      return (data || []) as EmailQueueItem[];
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
      const supabase = createAdminSupabaseClient();

      const { error } = await supabase
        .from('email_queue')
        .update({
          status: 'pending',
          attempts: 0,
          error_message: null,
        })
        .eq('id', id);

      if (error) {
        console.error('[EmailService] Fehler beim Retry:', error);
        return false;
      }

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
      const supabase = createAdminSupabaseClient();

      const { error } = await supabase
        .from('email_queue')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[EmailService] Fehler beim Löschen:', error);
        return false;
      }

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
      const supabase = createAdminSupabaseClient();

      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - olderThanMinutes);

      const { data, error } = await supabase
        .from('email_queue')
        .update({ status: 'pending' })
        .eq('status', 'processing')
        .lt('last_attempt_at', cutoffTime.toISOString())
        .select('id');

      if (error) {
        console.error('[EmailService] Fehler beim Reset stuck E-Mails:', error);
        return 0;
      }

      const count = data?.length || 0;
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
