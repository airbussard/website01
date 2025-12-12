// =====================================================
// CONTACT SYSTEM TYPES
// =====================================================

export type ContactRequestStatus = 'neu' | 'in_bearbeitung' | 'erledigt';

export interface ContactRequest {
  id: string;
  ticket_number: number;
  name: string;
  email: string;
  company: string | null;
  subject: string;
  message: string;
  project_type: string | null;
  status: ContactRequestStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContactRequest {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  project_type?: string;
}

export interface ContactStats {
  total: number;
  neu: number;
  in_bearbeitung: number;
  erledigt: number;
}

export type EmailMessageDirection = 'incoming' | 'outgoing';

export interface EmailMessage {
  id: string;
  contact_request_id: string;
  direction: EmailMessageDirection;
  from_email: string;
  from_name: string | null;
  to_email: string;
  subject: string | null;
  content_html: string | null;
  content_text: string | null;
  created_at: string;
}

export interface CreateEmailMessage {
  contact_request_id: string;
  direction: EmailMessageDirection;
  from_email: string;
  from_name?: string;
  to_email: string;
  subject?: string;
  content_html?: string;
  content_text?: string;
}
