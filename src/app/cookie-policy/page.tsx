'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import { Cookie, Shield, BarChart3, Target, Settings2 } from 'lucide-react';
import { cookieDefinitions } from '@/lib/cookies/consent';
import { CookieCategory } from '@/types/cookies';

export default function CookiePolicyPage() {
  const [showSettings, setShowSettings] = useState(false);

  const getCategoryIcon = (category: CookieCategory) => {
    switch (category) {
      case 'essential':
        return <Shield className="h-5 w-5 text-green-600" />;
      case 'analytics':
        return <BarChart3 className="h-5 w-5 text-blue-600" />;
      case 'marketing':
        return <Target className="h-5 w-5 text-purple-600" />;
    }
  };

  const getCategoryName = (category: CookieCategory) => {
    switch (category) {
      case 'essential':
        return 'Essentielle Cookies';
      case 'analytics':
        return 'Analytische Cookies';
      case 'marketing':
        return 'Marketing Cookies';
    }
  };

  const getCategoryDescription = (category: CookieCategory) => {
    switch (category) {
      case 'essential':
        return 'Diese Cookies sind für die grundlegende Funktionalität der Website erforderlich und können nicht deaktiviert werden.';
      case 'analytics':
        return 'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie Informationen anonym sammeln und melden.';
      case 'marketing':
        return 'Marketing-Cookies werden verwendet, um Besuchern relevante Werbung und Marketingkampagnen anzuzeigen.';
    }
  };

  const essentialCookies = cookieDefinitions.filter(c => c.category === 'essential');
  const analyticsCookies = cookieDefinitions.filter(c => c.category === 'analytics');
  const marketingCookies = cookieDefinitions.filter(c => c.category === 'marketing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-primary-500 rounded-2xl mb-4">
              <Cookie className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cookie-Richtlinie
            </h1>
            <p className="text-xl text-gray-600">
              Transparenz über die Verwendung von Cookies auf unserer Website
            </p>
          </div>

          {/* Quick Settings Button */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-primary-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings2 className="h-6 w-6 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Cookie-Einstellungen verwalten
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ändern Sie Ihre Cookie-Präferenzen jederzeit
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                Einstellungen öffnen
              </button>
            </div>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Was sind Cookies?
            </h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <p>
                Cookies sind kleine Textdateien, die auf Ihrem Computer oder Mobilgerät gespeichert werden, wenn Sie eine Website besuchen. Sie werden häufig verwendet, um Websites funktionsfähig zu machen oder effizienter arbeiten zu lassen, sowie um Informationen an die Betreiber der Website zu übermitteln.
              </p>
              <p>
                Wir bei getemergence.com setzen Cookies ein, um Ihnen ein optimales Nutzererlebnis zu bieten. Sie haben die volle Kontrolle über die Verwendung von Cookies und können Ihre Einstellungen jederzeit anpassen.
              </p>
            </div>
          </div>

          {/* Cookie Categories */}
          <div className="space-y-6 mb-8">
            {/* Essential Cookies */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-4">
                {getCategoryIcon('essential')}
                <h2 className="text-2xl font-semibold text-gray-800">
                  {getCategoryName('essential')}
                </h2>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  Immer aktiv
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                {getCategoryDescription('essential')}
              </p>

              <div className="space-y-4">
                {essentialCookies.map((cookie, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-mono text-sm font-semibold text-gray-900">
                        {cookie.name}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                        {cookie.duration}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {cookie.purpose}
                    </p>
                    <p className="text-xs text-gray-500">
                      Anbieter: {cookie.provider}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-4">
                {getCategoryIcon('analytics')}
                <h2 className="text-2xl font-semibold text-gray-800">
                  {getCategoryName('analytics')}
                </h2>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  Optional
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                {getCategoryDescription('analytics')}
              </p>

              {analyticsCookies.length > 0 ? (
                <div className="space-y-4">
                  {analyticsCookies.map((cookie, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-mono text-sm font-semibold text-gray-900">
                          {cookie.name}
                        </h4>
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                          {cookie.duration}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {cookie.purpose}
                      </p>
                      <p className="text-xs text-gray-500">
                        Anbieter: {cookie.provider}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Aktuell werden keine Analytics-Cookies verwendet.
                </p>
              )}
            </div>

            {/* Marketing Cookies */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-4">
                {getCategoryIcon('marketing')}
                <h2 className="text-2xl font-semibold text-gray-800">
                  {getCategoryName('marketing')}
                </h2>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  Optional
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                {getCategoryDescription('marketing')}
              </p>

              {marketingCookies.length > 0 ? (
                <div className="space-y-4">
                  {marketingCookies.map((cookie, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-mono text-sm font-semibold text-gray-900">
                          {cookie.name}
                        </h4>
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                          {cookie.duration}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {cookie.purpose}
                      </p>
                      <p className="text-xs text-gray-500">
                        Anbieter: {cookie.provider}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Aktuell werden keine Marketing-Cookies verwendet.
                </p>
              )}
            </div>
          </div>

          {/* Cookie Management */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Verwaltung Ihrer Cookie-Einstellungen
            </h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <p>
                Sie haben jederzeit die Möglichkeit, Ihre Cookie-Einstellungen anzupassen:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Über den Button "Cookie-Einstellungen" oben auf dieser Seite</li>
                <li>Über den Link "Cookie-Einstellungen" im Footer jeder Seite</li>
                <li>Über die Einstellungen Ihres Browsers</li>
              </ul>
              <p>
                Bitte beachten Sie, dass die Deaktivierung bestimmter Cookies die Funktionalität und Nutzererfahrung unserer Website beeinträchtigen kann.
              </p>
            </div>
          </div>

          {/* Browser Settings */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Cookies im Browser verwalten
            </h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <p>
                Die meisten Browser akzeptieren Cookies automatisch. Sie können Ihren Browser jedoch so konfigurieren, dass Cookies abgelehnt werden oder Sie benachrichtigt werden, wenn ein Cookie gesetzt wird.
              </p>
              <p className="font-semibold">
                Anleitungen für gängige Browser:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/de/kb/cookies-erlauben-und-ablehnen" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/de-de/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    Safari
                  </a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/de-de/microsoft-edge/cookies-in-microsoft-edge-l%C3%B6schen-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    Microsoft Edge
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {/* Cookie Settings Modal */}
      {showSettings && <CookieConsent forceShow={true} />}
    </div>
  );
}
