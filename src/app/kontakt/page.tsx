'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Contact from '@/components/Contact';
import { Mail, MapPin, Clock, Phone, MessageSquare } from 'lucide-react';

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Kontakt aufnehmen
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Haben Sie ein spannendes Projekt? Lassen Sie uns darüber sprechen, wie wir Ihre Ideen gemeinsam verwirklichen können.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Kontaktinformationen
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">E-Mail</p>
                    <a href="mailto:hello@getemergence.com" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                      hello@getemergence.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Adresse</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Steinstraße 71<br />
                      52249 Eschweiler<br />
                      Deutschland
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Geschäftszeiten</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Mo - Fr: 09:00 - 18:00<br />
                      Sa - So: Geschlossen
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Schnellkontakt
              </h3>
              <div className="space-y-3">
                <a
                  href="mailto:hello@getemergence.com"
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
                >
                  <span className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                    <span className="text-gray-700 dark:text-gray-300">E-Mail senden</span>
                  </span>
                  <span className="text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">→</span>
                </a>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
              <MessageSquare className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-bold mb-2">
                Schnelle Antwort garantiert
              </h3>
              <p className="text-sm opacity-90">
                Wir antworten in der Regel innerhalb von 24 Stunden auf Ihre Anfrage.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Nachricht senden
              </h2>
              <Contact showHeading={false} />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Häufig gestellte Fragen
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Wie läuft ein Projekt ab?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Nach der ersten Kontaktaufnahme führen wir ein kostenloses Erstgespräch, in dem wir Ihre Anforderungen besprechen. Anschließend erhalten Sie ein detailliertes Angebot mit Zeitplan und Kostenschätzung.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Bieten Sie auch Support nach Projektabschluss?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Ja, wir bieten verschiedene Support- und Wartungspakete an. Von der einfachen Fehlerbehebung bis zur kontinuierlichen Weiterentwicklung - wir sind auch nach Projektabschluss für Sie da.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Arbeiten Sie auch remote?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Absolut! Wir arbeiten mit Kunden aus ganz Deutschland und international zusammen. Durch moderne Kommunikationstools ist eine effiziente Zusammenarbeit unabhängig vom Standort möglich.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Wie lange dauert ein typisches Projekt?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Die Projektdauer hängt stark vom Umfang ab. Eine einfache Website kann in 2-4 Wochen fertiggestellt werden, während komplexere Anwendungen mehrere Monate in Anspruch nehmen können. Wir erstellen für jedes Projekt einen realistischen Zeitplan.
              </p>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mt-20">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Eschweiler, Deutschland
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}