'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface EmailReplyFormProps {
  requestId: string;
  ticketNumber: number;
  onReplySent?: () => void;
}

export default function EmailReplyForm({
  requestId,
  ticketNumber,
  onReplySent,
}: EmailReplyFormProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError('Bitte geben Sie eine Nachricht ein');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/anfragen/${requestId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMessage('');
        onReplySent?.();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Fehler beim Senden');
      }
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Antwort an den Anfragenden
        </label>
        <div className="text-xs text-gray-500 mb-2">
          Betreff: Re: Ihre Anfrage [ANFRAGE-{ticketNumber}]
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ihre Antwort eingeben..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          Antwort wurde in die Warteschlange aufgenommen und wird in Kürze versendet.
        </div>
      )}

      <button
        type="submit"
        disabled={sending || !message.trim()}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        <Send className="h-4 w-4" />
        {sending ? 'Wird gesendet...' : 'Antwort senden'}
      </button>
    </form>
  );
}
