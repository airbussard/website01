'use client';

import { Github, Linkedin, Mail, Heart } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Branding */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              develo.tech
            </h3>
            <p className="text-gray-400 mb-4">
              Ihr Partner für digitale Lösungen.
              Spezialisiert auf moderne Webanwendungen, komplexe Systeme und native iOS Apps.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Github className="h-6 w-6" />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Linkedin className="h-6 w-6" />
              </Link>
              <Link
                href="mailto:hello@develo.tech"
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
                <button
                  onClick={() => document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Start
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Projekte
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Über mich
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Kontakt
                </button>
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
              © {currentYear} develo.tech. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <Link href="/impressum" className="text-gray-400 hover:text-primary-400 transition-colors">
                Impressum
              </Link>
              <Link href="/datenschutz" className="text-gray-400 hover:text-primary-400 transition-colors">
                Datenschutz
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm flex items-center justify-center">
              Made with <Heart className="h-4 w-4 mx-1 text-red-500" fill="currentColor" /> in Germany
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}