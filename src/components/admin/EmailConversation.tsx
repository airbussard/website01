'use client';

import { Mail, Send } from 'lucide-react';
import type { EmailMessage } from '@/types/contact';

interface EmailConversationProps {
  messages: EmailMessage[];
}

export default function EmailConversation({ messages }: EmailConversationProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Noch keine E-Mail-Kommunikation</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-4 rounded-lg border ${
            msg.direction === 'outgoing'
              ? 'bg-blue-50 border-blue-200 ml-4'
              : 'bg-gray-50 border-gray-200 mr-4'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {msg.direction === 'outgoing' ? (
                <Send className="h-4 w-4 text-blue-600" />
              ) : (
                <Mail className="h-4 w-4 text-gray-600" />
              )}
              <span className="text-sm font-medium text-gray-900">
                {msg.direction === 'outgoing' ? 'Ausgehend' : 'Eingehend'}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(msg.created_at)}
            </span>
          </div>

          {/* From/To */}
          <div className="text-xs text-gray-500 mb-2">
            <span className="font-medium">Von:</span> {msg.from_name ? `${msg.from_name} <${msg.from_email}>` : msg.from_email}
            <br />
            <span className="font-medium">An:</span> {msg.to_email}
          </div>

          {/* Subject */}
          {msg.subject && (
            <div className="text-sm font-medium text-gray-700 mb-2">
              {msg.subject}
            </div>
          )}

          {/* Content */}
          <div className="text-sm text-gray-600">
            {msg.content_text ? (
              <pre className="whitespace-pre-wrap font-sans">{msg.content_text}</pre>
            ) : msg.content_html ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.content_html) }}
              />
            ) : (
              <span className="text-gray-400 italic">Kein Inhalt</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sanitizeHtml(html: string): string {
  // Einfache Sanitization - in Production sollte eine Library wie DOMPurify verwendet werden
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}
