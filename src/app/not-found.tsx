import Link from 'next/link';
import { Home, ArrowLeft, Mail } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Seite nicht gefunden
        </h2>
        <p className="text-gray-600 mb-8">
          Die gesuchte Seite existiert leider nicht oder wurde verschoben.
          Keine Sorge - wir helfen Ihnen weiter.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Zur Startseite
          </Link>
          <Link
            href="/kontakt"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            <Mail className="h-5 w-5 mr-2" />
            Kontakt aufnehmen
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Beliebte Seiten:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/services"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Services
            </Link>
            <Link
              href="/ueber-uns"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Über uns
            </Link>
            <Link
              href="/technologien"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Technologien
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
