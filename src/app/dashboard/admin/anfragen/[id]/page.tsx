'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Building, Calendar, Trash2 } from 'lucide-react';
import ContactStatusSelect from '@/components/admin/ContactStatusSelect';
import ContactNotesEditor from '@/components/admin/ContactNotesEditor';
import EmailReplyForm from '@/components/admin/EmailReplyForm';
import EmailConversation from '@/components/admin/EmailConversation';
import type { ContactRequest, EmailMessage } from '@/types/contact';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AnfrageDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [request, setRequest] = useState<ContactRequest | null>(null);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const res = await fetch(`/api/admin/anfragen/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRequest(data.request);
        setMessages(data.messages);
      } else {
        router.push('/dashboard/admin/anfragen');
      }
    } catch (err) {
      console.error('Fehler beim Laden:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Anfrage wirklich löschen?')) return;

    try {
      const res = await fetch(`/api/admin/anfragen/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard/admin/anfragen');
      }
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Anfrage nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin/anfragen"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Anfrage #{request.ticket_number}
            </h1>
            <p className="text-gray-600">{request.subject}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Löschen
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nachricht */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nachricht</h2>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{request.message}</p>
            </div>
          </div>

          {/* E-Mail-Kommunikation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">E-Mail-Kommunikation</h2>
            <EmailConversation messages={messages} />
          </div>

          {/* Antwort */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Antwort senden</h2>
            <EmailReplyForm
              requestId={request.id}
              ticketNumber={request.ticket_number}
              onReplySent={loadData}
            />
          </div>

          {/* Interne Notizen */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interne Notizen</h2>
            <ContactNotesEditor requestId={request.id} initialNotes={request.notes} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Kontaktdaten */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kontaktdaten</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Name</div>
                <div className="font-medium text-gray-900">{request.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">E-Mail</div>
                <a
                  href={`mailto:${request.email}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Mail className="h-4 w-4" />
                  {request.email}
                </a>
              </div>
              {request.company && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Firma</div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Building className="h-4 w-4 text-gray-400" />
                    {request.company}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meta-Informationen */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informationen</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <ContactStatusSelect
                  requestId={request.id}
                  currentStatus={request.status}
                  onStatusChange={loadData}
                />
              </div>
              {request.project_type && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Projekttyp</div>
                  <div className="text-gray-900">{request.project_type}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500 mb-1">Eingegangen</div>
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(request.created_at)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Zuletzt geändert</div>
                <div className="text-gray-900">
                  {formatDate(request.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
            <div className="space-y-2">
              <a
                href={`mailto:${request.email}?subject=Re: ${encodeURIComponent(request.subject)}`}
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Mail className="h-4 w-4" />
                E-Mail senden
              </a>
            </div>
          </div>
        </div>
      </div>
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
