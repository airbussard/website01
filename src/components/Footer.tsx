'use client';

import { useState } from 'react';
import { Linkedin, Mail, Heart, Code2 } from 'lucide-react';
import Link from 'next/link';
import CookieConsent from './CookieConsent';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Branding */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <Code2 className="h-8 w-8 text-primary-600" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary-500 rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  getemergence.com
                </span>
                <span className="text-xs text-gray-500 -mt-1">
                  Digital Solutions
                </span>
              </div>
            </Link>
            <p className="text-gray-400 mb-4">
              Individuelle Digitallösungen für Ihr Unternehmen.
              Von der Website bis zum komplexen System - schnell, fair und mit dauerhafter Betreuung.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Linkedin className="h-6 w-6" />
              </Link>
              <Link
                href="mailto:hello@getemergence.com"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Mail className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Übersicht</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Start
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/technologien"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Technologien
                </Link>
              </li>
              <li>
                <Link
                  href="/projekte"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Projekte
                </Link>
              </li>
              <li>
                <Link
                  href="/ueber-uns"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Über uns
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Leistungen</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/services#websites"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Websites & Webshops
                </Link>
              </li>
              <li>
                <Link
                  href="/services#webapps"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Web-Anwendungen
                </Link>
              </li>
              <li>
                <Link
                  href="/services#mobile"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Mobile Apps
                </Link>
              </li>
              <li>
                <Link
                  href="/services#consulting"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  IT-Beratung
                </Link>
              </li>
              <li>
                <Link
                  href="/services/hosting"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Hosting
                </Link>
              </li>
            </ul>
          </div>

          {/* Branchen */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Branchen</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/webdesign-rechtsanwaelte"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Rechtsanwälte
                </Link>
              </li>
              <li>
                <Link
                  href="/webdesign-aerzte"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Ärzte & Praxen
                </Link>
              </li>
              <li>
                <Link
                  href="/immobilien-software"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Immobilienmakler
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} getemergence.com. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <Link href="/impressum" className="text-gray-400 hover:text-primary-400 transition-colors">
                Impressum
              </Link>
              <Link href="/datenschutz" className="text-gray-400 hover:text-primary-400 transition-colors">
                Datenschutz
              </Link>
              <Link href="/cookie-policy" className="text-gray-400 hover:text-primary-400 transition-colors">
                Cookie-Richtlinie
              </Link>
              <button
                onClick={() => setShowCookieSettings(true)}
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                Cookie-Einstellungen
              </button>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm flex items-center justify-center">
              Made with <Heart className="h-4 w-4 mx-1 text-red-500" fill="currentColor" /> in Germany
            </p>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showCookieSettings && <CookieConsent forceShow={true} />}
    </footer>
  );
}