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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Branding */}
          <div className="md:col-span-2">
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
              Ihr Partner für digitale Lösungen.
              Spezialisiert auf moderne Webanwendungen, komplexe Systeme und native iOS Apps.
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
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
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
                  href="/referenzen"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Projekte
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Über uns
                </Link>
              </li>
              <li>
                <Link
                  href="/tech"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Technologien
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
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li className="text-gray-400">Web Development</li>
              <li className="text-gray-400">iOS App Entwicklung</li>
              <li className="text-gray-400">API Entwicklung</li>
              <li className="text-gray-400">Consulting</li>
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