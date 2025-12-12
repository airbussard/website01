import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type {
  ContactRequest,
  CreateContactRequest,
  ContactRequestStatus,
  ContactStats,
  EmailMessage,
  CreateEmailMessage,
} from '@/types/contact';

// =====================================================
// CONTACT SERVICE
// Zentrale Klasse für Anfragen-Verwaltung
// =====================================================

export class ContactService {
  // =====================================================
  // ANFRAGEN LESEN
  // =====================================================

  /**
   * Alle Anfragen laden
   */
  static async getAll(): Promise<ContactRequest[]> {
    try {
      const supabase = createAdminSupabaseClient();

      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ContactService] Fehler beim Laden:', error);
        return [];
      }

      return (data || []) as ContactRequest[];
    } catch (err) {
      console.error('[ContactService] getAll Exception:', err);
      return [];
    }
  }

  /**
   * Einzelne Anfrage laden
   */
  static async getById(id: string): Promise<ContactRequest | null> {
    try {
      const supabase = createAdminSupabaseClient();

      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('[ContactService] Fehler beim Laden:', error);
        return null;
      }

      return data as ContactRequest;
    } catch (err) {
      console.error('[ContactService] getById Exception:', err);
      return null;
    }
  }

  /**
   * Anfragen nach Status filtern
   */
  static async getByStatus(status: ContactRequestStatus): Promise<ContactRequest[]> {
    try {
      const supabase = createAdminSupabaseClient();

      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ContactService] Fehler beim Laden:', error);
        return [];
      }

      return (data || []) as ContactRequest[];
    } catch (err) {
      console.error('[ContactService] getByStatus Exception:', err);
      return [];
    }
  }

  /**
   * Statistiken abrufen
   */
  static async getStats(): Promise<ContactStats> {
    try {
      const supabase = createAdminSupabaseClient();

      const [total, neu, inBearbeitung, erledigt] = await Promise.all([
        supabase.from('contact_requests').select('*', { count: 'exact', head: true }),
        supabase.from('contact_requests').select('*', { count: 'exact', head: true }).eq('status', 'neu'),
        supabase.from('contact_requests').select('*', { count: 'exact', head: true }).eq('status', 'in_bearbeitung'),
        supabase.from('contact_requests').select('*', { count: 'exact', head: true }).eq('status', 'erledigt'),
      ]);

      return {
        total: total.count || 0,
        neu: neu.count || 0,
        in_bearbeitung: inBearbeitung.count || 0,
        erledigt: erledigt.count || 0,
      };
    } catch (err) {
      console.error('[ContactService] getStats Exception:', err);
      return { total: 0, neu: 0, in_bearbeitung: 0, erledigt: 0 };
    }
  }

  // =====================================================
  // ANFRAGEN SCHREIBEN
  // =====================================================

  /**
   * Neue Anfrage erstellen
   */
  static async create(request: CreateContactRequest): Promise<ContactRequest | null> {
    try {
      const supabase = createAdminSupabaseClient();

      const { data, error } = await supabase
        .from('contact_requests')
        .insert({
          name: request.name,
          email: request.email,
          company: request.company || null,
          subject: request.subject,
          message: request.message,
          project_type: request.project_type || null,
          status: 'neu',
        })
        .select()
        .single();

      if (error) {
        console.error('[ContactService] Fehler beim Erstellen:', error);
        return null;
      }

      console.log('[ContactService] Anfrage erstellt:', data.id);
      return data as ContactRequest;
    } catch (err) {
      console.error('[ContactService] create Exception:', err);
      return null;
    }
  }

  /**
   * Status aktualisieren
   */
  static async updateStatus(id: string, status: ContactRequestStatus): Promise<boolean> {
    try {
      const supabase = createAdminSupabaseClient();

      const { error } = await supabase
        .from('contact_requests')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('[ContactService] Fehler beim Status-Update:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[ContactService] updateStatus Exception:', err);
      return false;
    }
  }

  /**
   * Notizen aktualisieren
   */
  static async updateNotes(id: string, notes: string): Promise<boolean> {
    try {
      const supabase = createAdminSupabaseClient();

      const { error } = await supabase
        .from('contact_requests')
        .update({ notes })
        .eq('id', id);

      if (error) {
        console.error('[ContactService] Fehler beim Notes-Update:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[ContactService] updateNotes Exception:', err);
      return false;
    }
  }

  /**
   * Anfrage löschen
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const supabase = createAdminSupabaseClient();

      const { error } = await supabase
        .from('contact_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[ContactService] Fehler beim Löschen:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[ContactService] delete Exception:', err);
      return false;
    }
  }

  // =====================================================
  // EMAIL MESSAGES
  // =====================================================

  /**
   * Nachrichten einer Anfrage laden
   */
  static async getMessages(contactRequestId: string): Promise<EmailMessage[]> {
    try {
      const supabase = createAdminSupabaseClient();

      const { data, error } = await supabase
        .from('email_messages')
        .select('*')
        .eq('contact_request_id', contactRequestId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[ContactService] Fehler beim Laden der Nachrichten:', error);
        return [];
      }

      return (data || []) as EmailMessage[];
    } catch (err) {
      console.error('[ContactService] getMessages Exception:', err);
      return [];
    }
  }

  /**
   * Nachricht erstellen
   */
  static async createMessage(message: CreateEmailMessage): Promise<EmailMessage | null> {
    try {
      const supabase = createAdminSupabaseClient();

      const { data, error } = await supabase
        .from('email_messages')
        .insert({
          contact_request_id: message.contact_request_id,
          direction: message.direction,
          from_email: message.from_email,
          from_name: message.from_name || null,
          to_email: message.to_email,
          subject: message.subject || null,
          content_html: message.content_html || null,
          content_text: message.content_text || null,
        })
        .select()
        .single();

      if (error) {
        console.error('[ContactService] Fehler beim Erstellen der Nachricht:', error);
        return null;
      }

      return data as EmailMessage;
    } catch (err) {
      console.error('[ContactService] createMessage Exception:', err);
      return null;
    }
  }
}
