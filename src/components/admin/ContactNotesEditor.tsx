'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

interface ContactNotesEditorProps {
  requestId: string;
  initialNotes: string | null;
}

export default function ContactNotesEditor({
  requestId,
  initialNotes,
}: ContactNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/anfragen/${requestId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Notizen speichern fehlgeschlagen:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Interne Notizen hinzufügen..."
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Speichern...' : 'Notizen speichern'}
        </button>
        {saved && (
          <span className="text-sm text-green-600">Gespeichert!</span>
        )}
      </div>
    </div>
  );
}
