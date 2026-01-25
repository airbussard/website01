import { prisma } from '@/lib/prisma';
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
   * Alle Anfragen laden (ohne Spam)
   */
  static async getAll(): Promise<ContactRequest[]> {
    try {
      const data = await prisma.contact_requests.findMany({
        where: { is_spam: false },
        orderBy: { created_at: 'desc' },
      });

      return data as unknown as ContactRequest[];
    } catch (err) {
      console.error('[ContactService] getAll Exception:', err);
      return [];
    }
  }

  /**
   * Spam-Anfragen laden
   */
  static async getSpam(): Promise<ContactRequest[]> {
    try {
      const data = await prisma.contact_requests.findMany({
        where: { is_spam: true },
        orderBy: { created_at: 'desc' },
      });

      return data as unknown as ContactRequest[];
    } catch (err) {
      console.error('[ContactService] getSpam Exception:', err);
      return [];
    }
  }

  /**
   * Einzelne Anfrage laden
   */
  static async getById(id: string): Promise<ContactRequest | null> {
    try {
      const data = await prisma.contact_requests.findUnique({
        where: { id },
      });

      if (!data) return null;
      return data as unknown as ContactRequest;
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
      const data = await prisma.contact_requests.findMany({
        where: { status },
        orderBy: { created_at: 'desc' },
      });

      return data as unknown as ContactRequest[];
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
      const [total, neu, inBearbeitung, erledigt, spam] = await Promise.all([
        prisma.contact_requests.count({ where: { is_spam: false } }),
        prisma.contact_requests.count({ where: { status: 'neu', is_spam: false } }),
        prisma.contact_requests.count({ where: { status: 'in_bearbeitung', is_spam: false } }),
        prisma.contact_requests.count({ where: { status: 'erledigt', is_spam: false } }),
        prisma.contact_requests.count({ where: { is_spam: true } }),
      ]);

      return {
        total,
        neu,
        in_bearbeitung: inBearbeitung,
        erledigt,
        spam,
      };
    } catch (err) {
      console.error('[ContactService] getStats Exception:', err);
      return { total: 0, neu: 0, in_bearbeitung: 0, erledigt: 0, spam: 0 };
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
      const data = await prisma.contact_requests.create({
        data: {
          name: request.name,
          email: request.email,
          company: request.company || null,
          subject: request.subject,
          message: request.message,
          project_type: request.project_type || null,
          status: 'neu',
        },
      });

      console.log('[ContactService] Anfrage erstellt:', data.id);
      return data as unknown as ContactRequest;
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
      await prisma.contact_requests.update({
        where: { id },
        data: { status },
      });

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
      await prisma.contact_requests.update({
        where: { id },
        data: { notes },
      });

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
      await prisma.contact_requests.delete({
        where: { id },
      });

      return true;
    } catch (err) {
      console.error('[ContactService] delete Exception:', err);
      return false;
    }
  }

  /**
   * Anfrage als Nicht-Spam markieren
   */
  static async markAsNotSpam(id: string): Promise<boolean> {
    try {
      await prisma.contact_requests.update({
        where: { id },
        data: { is_spam: false },
      });

      console.log(`[ContactService] Anfrage ${id} als Nicht-Spam markiert`);
      return true;
    } catch (err) {
      console.error('[ContactService] markAsNotSpam Exception:', err);
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
      const data = await prisma.email_messages.findMany({
        where: { contact_request_id: contactRequestId },
        orderBy: { created_at: 'asc' },
      });

      return data as unknown as EmailMessage[];
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
      const data = await prisma.email_messages.create({
        data: {
          contact_request_id: message.contact_request_id,
          direction: message.direction,
          from_email: message.from_email,
          from_name: message.from_name || null,
          to_email: message.to_email,
          subject: message.subject || null,
          content_html: message.content_html || null,
          content_text: message.content_text || null,
        },
      });

      return data as unknown as EmailMessage;
    } catch (err) {
      console.error('[ContactService] createMessage Exception:', err);
      return null;
    }
  }
}
