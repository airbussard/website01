// =====================================================
// EMAIL SYSTEM TYPES
// =====================================================

export interface EmailSettings {
  id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  imap_host: string | null;
  imap_port: number | null;
  imap_user: string | null;
  imap_password: string | null;
  from_email: string;
  from_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateEmailSettings {
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  imap_host?: string | null;
  imap_port?: number | null;
  imap_user?: string | null;
  imap_password?: string | null;
  from_email?: string;
  from_name?: string;
  is_active?: boolean;
}

export type EmailQueueStatus = 'pending' | 'processing' | 'sent' | 'failed';
export type EmailType = 'notification' | 'contact' | 'system' | 'reply' | 'project-update' | 'invoice' | 'contract';

export interface EmailQueueItem {
  id: string;
  contact_request_id: string | null;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  content_html: string;
  content_text: string | null;
  status: EmailQueueStatus;
  type: EmailType;
  attempts: number;
  max_attempts: number;
  last_attempt_at: string | null;
  error_message: string | null;
  sent_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreateEmailQueueItem {
  contact_request_id?: string | null;
  recipient_email: string;
  recipient_name?: string | null;
  subject: string;
  content_html: string;
  content_text?: string | null;
  type?: EmailType;
  metadata?: Record<string, unknown>;
}

export interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  sent: number;
  failed: number;
}

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
