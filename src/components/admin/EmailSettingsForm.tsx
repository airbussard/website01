'use client';

import { useState, useEffect } from 'react';
import type { EmailSettings, QueueStats } from '@/types/email';

// =====================================================
// EMAIL SETTINGS FORM COMPONENT
// =====================================================

interface EmailSettingsFormProps {
  onSaved?: () => void;
}

export default function EmailSettingsForm({ onSaved }: EmailSettingsFormProps) {
  const [settings, setSettings] = useState<Partial<EmailSettings>>({
    smtp_host: '',
    smtp_port: 465,
    smtp_user: '',
    smtp_password: '',
    imap_host: '',
    imap_port: 993,
    imap_user: '',
    imap_password: '',
    from_email: '',
    from_name: '',
    is_active: true,
  });
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Einstellungen laden
  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/email-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Fehler beim Laden:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/email-queue?stats=true');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Stats:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/email-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Einstellungen gespeichert' });
        onSaved?.();
      } else {
        setMessage({ type: 'error', text: data.error || 'Fehler beim Speichern' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Netzwerkfehler' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/email-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'SMTP-Verbindung erfolgreich' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Verbindung fehlgeschlagen' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Netzwerkfehler' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Queue Stats */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Queue-Status</h3>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-500">Gesamt</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-gray-500">Wartend</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
              <div className="text-xs text-gray-500">In Bearbeitung</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
              <div className="text-xs text-gray-500">Gesendet</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs text-gray-500">Fehlgeschlagen</div>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SMTP Einstellungen */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SMTP-Einstellungen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Host
              </label>
              <input
                type="text"
                name="smtp_host"
                value={settings.smtp_host || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="smtp.strato.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Port
              </label>
              <input
                type="number"
                name="smtp_port"
                value={settings.smtp_port || 465}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Benutzer
              </label>
              <input
                type="text"
                name="smtp_user"
                value={settings.smtp_user || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="user@domain.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Passwort
              </label>
              <input
                type="password"
                name="smtp_password"
                value={settings.smtp_password || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="********"
              />
            </div>
          </div>
        </div>

        {/* IMAP Einstellungen (optional) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            IMAP-Einstellungen <span className="text-sm font-normal text-gray-500">(optional)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMAP Host
              </label>
              <input
                type="text"
                name="imap_host"
                value={settings.imap_host || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="imap.strato.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMAP Port
              </label>
              <input
                type="number"
                name="imap_port"
                value={settings.imap_port || 993}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMAP Benutzer
              </label>
              <input
                type="text"
                name="imap_user"
                value={settings.imap_user || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMAP Passwort
              </label>
              <input
                type="password"
                name="imap_password"
                value={settings.imap_password || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Absender */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Absender</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Absender E-Mail
              </label>
              <input
                type="email"
                name="from_email"
                value={settings.from_email || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="hello@getemergence.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Absender Name
              </label>
              <input
                type="text"
                name="from_name"
                value={settings.from_name || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="getemergence.com"
              />
            </div>
          </div>
        </div>

        {/* Aktivierung */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              checked={settings.is_active ?? true}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              E-Mail-Versand aktivieren
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-2 ml-8">
            Wenn deaktiviert, werden E-Mails in der Queue gespeichert aber nicht versendet.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Speichern...' : 'Speichern'}
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {testing ? 'Teste...' : 'SMTP testen'}
          </button>
        </div>
      </form>
    </div>
  );
}
