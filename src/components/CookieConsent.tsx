'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings2, Check, Shield } from 'lucide-react';
import {
  getConsent,
  saveConsent,
  acceptAllCookies,
  acceptEssentialOnly,
  getCookiesByCategory
} from '@/lib/cookies/consent';
import { CookieConsent as ConsentType } from '@/types/cookies';
import Link from 'next/link';

interface CookieConsentProps {
  forceShow?: boolean;
}

export default function CookieConsent({ forceShow = false }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<Omit<ConsentType, 'timestamp'>>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const existingConsent = getConsent();

    if (forceShow) {
      setShowSettings(true);
      setShowBanner(true);
      if (existingConsent) {
        setConsent({
          essential: existingConsent.essential,
          analytics: existingConsent.analytics,
          marketing: existingConsent.marketing,
        });
      }
    } else if (!existingConsent) {
      // Nur anzeigen wenn noch kein Consent vorhanden
      setShowBanner(true);
    }
  }, [forceShow]);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptEssential = () => {
    acceptEssentialOnly();
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSaveSettings = () => {
    saveConsent(consent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const toggleCategory = (category: 'analytics' | 'marketing') => {
    setConsent(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Overlay für Modal */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
              onClick={() => !forceShow && setShowSettings(false)}
            />
          )}

          {/* Cookie Banner / Settings Modal */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed z-[9999] ${
              showSettings
                ? 'inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl'
                : 'bottom-4 right-4 left-4 md:left-auto md:max-w-md'
            }`}
          >
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl border-2 border-primary-500 shadow-2xl overflow-hidden">
              {/* Grid Pattern Background */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(0deg, rgb(59, 130, 246) 1px, transparent 1px), linear-gradient(90deg, rgb(59, 130, 246) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 border-2 border-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Cookie className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {showSettings ? 'Cookie-Einstellungen' : 'Cookie-Hinweis'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Wir respektieren Ihre Privatsphäre
                      </p>
                    </div>
                  </div>
                  {forceShow && (
                    <button
                      onClick={() => {
                        setShowBanner(false);
                        setShowSettings(false);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Simple Banner */}
                {!showSettings && (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                      Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Nur essentielle Cookies sind erforderlich, während andere uns helfen, unsere Website zu optimieren.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleAcceptAll}
                        className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Check className="h-4 w-4" />
                        <span>Alle akzeptieren</span>
                      </button>
                      <button
                        onClick={handleAcceptEssential}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Nur Notwendige</span>
                      </button>
                      <button
                        onClick={() => setShowSettings(true)}
                        className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Settings2 className="h-4 w-4" />
                        <span>Einstellungen</span>
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                      Mehr Infos in unserer{' '}
                      <Link href="/cookie-policy" className="text-primary-600 dark:text-primary-400 hover:underline">
                        Cookie-Richtlinie
                      </Link>
                      {' '}und{' '}
                      <Link href="/datenschutz" className="text-primary-600 dark:text-primary-400 hover:underline">
                        Datenschutzerklärung
                      </Link>
                    </p>
                  </>
                )}

                {/* Settings Modal */}
                {showSettings && (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      Wählen Sie, welche Arten von Cookies Sie akzeptieren möchten. Essentielle Cookies können nicht deaktiviert werden.
                    </p>

                    {/* Essential Cookies */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Essentielle Cookies
                          </h4>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                          Immer aktiv
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Diese Cookies sind für die grundlegende Funktionalität der Website erforderlich.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {getCookiesByCategory('essential').length} Cookie(s)
                      </p>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Cookie className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Analytische Cookies
                          </h4>
                        </div>
                        <button
                          onClick={() => toggleCategory('analytics')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            consent.analytics
                              ? 'bg-primary-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              consent.analytics ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {getCookiesByCategory('analytics').length} Cookie(s)
                      </p>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Cookie className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Marketing Cookies
                          </h4>
                        </div>
                        <button
                          onClick={() => toggleCategory('marketing')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            consent.marketing
                              ? 'bg-primary-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              consent.marketing ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Werden verwendet, um relevante Werbung anzuzeigen.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {getCookiesByCategory('marketing').length} Cookie(s)
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleSaveSettings}
                        className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                      >
                        Auswahl speichern
                      </button>
                      <button
                        onClick={handleAcceptAll}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Alle akzeptieren
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Mehr Details in unserer{' '}
                      <Link href="/cookie-policy" className="text-primary-600 dark:text-primary-400 hover:underline">
                        Cookie-Richtlinie
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
