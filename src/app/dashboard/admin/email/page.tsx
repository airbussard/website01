'use client';

import EmailSettingsForm from '@/components/admin/EmailSettingsForm';

export default function EmailSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">E-Mail-Einstellungen</h1>
        <p className="text-gray-600 mt-1">
          SMTP/IMAP-Konfiguration und E-Mail-Queue-Verwaltung
        </p>
      </div>

      <EmailSettingsForm />

      {/* Info-Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Hinweis zur Queue-Verarbeitung</h3>
        <p className="text-sm text-blue-700">
          E-Mails werden alle 5 Minuten automatisch durch einen Cron-Job verarbeitet.
          Der Endpoint <code className="bg-blue-100 px-1 rounded">/api/cron/process-email-queue</code> kann
          auch manuell aufgerufen werden.
        </p>
      </div>
    </div>
  );
}
