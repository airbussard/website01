'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Server,
  Database,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  HardDrive,
  Mail,
  Phone,
  Headphones,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Star,
  Calendar,
  Timer,
} from 'lucide-react';

const packages = [
  {
    id: 'light',
    name: 'Light',
    price: '24,99',
    description: 'Perfekt für einfache Websites ohne großen Wartungsbedarf',
    popular: false,
    features: [
      { text: 'Managed Hosting', included: true },
      { text: 'Supabase PostgreSQL', included: true },
      { text: '5 GB Speicher', included: true },
      { text: 'SSL-Zertifikat', included: true },
      { text: 'E-Mail Support', included: true },
      { text: 'Keine Backups', included: false },
      { text: 'Keine Revisionsstunden', included: false },
    ],
    storage: '5 GB',
    backup: 'Keine',
    support: 'E-Mail',
    hours: null,
  },
  {
    id: 'service',
    name: 'Service',
    price: '79,99',
    description: 'Ideal für Unternehmen, die regelmäßige Updates benötigen',
    popular: true,
    features: [
      { text: 'Managed Hosting', included: true },
      { text: 'Supabase PostgreSQL', included: true },
      { text: '20 GB Speicher', included: true },
      { text: 'SSL-Zertifikat', included: true },
      { text: 'Priority Support', included: true },
      { text: 'Tägliche Backups', included: true },
      { text: '1h Revisionsstunden/Monat', included: true },
    ],
    storage: '20 GB',
    backup: 'Täglich',
    support: 'Priority',
    hours: 1,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '99,99',
    description: 'Für anspruchsvolle Projekte mit hohen Anforderungen',
    popular: false,
    features: [
      { text: 'Managed Hosting', included: true },
      { text: 'Supabase PostgreSQL', included: true },
      { text: '50 GB Speicher', included: true },
      { text: 'SSL-Zertifikat', included: true },
      { text: 'Telefon Support', included: true },
      { text: 'Stündliche Backups', included: true },
      { text: '2h Revisionsstunden/Monat', included: true },
    ],
    storage: '50 GB',
    backup: 'Stündlich',
    support: 'Telefon',
    hours: 2,
  },
];

const features = [
  {
    icon: Server,
    title: 'Deutsche Server',
    description: 'Hosting auf zuverlässigen deutschen Servern für maximale Performance',
  },
  {
    icon: Database,
    title: 'PostgreSQL Datenbank',
    description: 'Leistungsstarke Supabase PostgreSQL Datenbank inklusive',
  },
  {
    icon: Shield,
    title: 'SSL-Zertifikat',
    description: 'Kostenlose SSL-Verschlüsselung für sichere Verbindungen',
  },
  {
    icon: Clock,
    title: '99.9% Uptime',
    description: 'Garantierte Verfügbarkeit für Ihre Website',
  },
];

const faqs = [
  {
    question: 'Was sind Revisionsstunden?',
    answer: 'Revisionsstunden sind Zeit, die wir für Änderungen an Ihrer Website verwenden. Das können Text-Updates, neue Bilder, Layout-Anpassungen oder kleine Funktionserweiterungen sein. Sie teilen uns mit, was geändert werden soll, und wir erledigen das für Sie.',
  },
  {
    question: 'Wie funktioniert das Stunden-Modell?',
    answer: 'Die Revisionsstunden sammeln sich über die 12-monatige Mindestlaufzeit an. Bei Service haben Sie nach 6 Monaten 6 Stunden angespart (max. 12h), bei Premium 12 Stunden (max. 24h). Nicht genutzte Stunden verfallen nach Ablauf der 12 Monate.',
  },
  {
    question: 'Kann ich das Paket wechseln?',
    answer: 'Ja, ein Upgrade ist jederzeit möglich. Ein Downgrade ist nach Ablauf der Mindestlaufzeit von 12 Monaten möglich.',
  },
  {
    question: 'Was passiert nach den 12 Monaten?',
    answer: 'Der Vertrag verlängert sich automatisch um weitere 12 Monate. Ungenutzten Revisionsstunden verfallen zu diesem Zeitpunkt und der Zähler startet neu.',
  },
  {
    question: 'Ist das Hosting DSGVO-konform?',
    answer: 'Ja, unsere Server stehen in Deutschland und erfüllen alle Anforderungen der DSGVO. Auf Wunsch erstellen wir einen Auftragsverarbeitungsvertrag (AVV).',
  },
];

export default function HostingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Server className="h-4 w-4 mr-2" />
              Managed Hosting
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Rundum-sorglos-Hosting
              </span>
              <br />
              <span className="text-gray-900">für Ihre Website</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Schnelles Hosting auf deutschen Servern mit PostgreSQL-Datenbank.
              Wählen Sie das passende Paket für Ihre Anforderungen.
            </p>
            <a
              href="#pakete"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Pakete ansehen
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-7 w-7 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pakete" className="py-20 scroll-mt-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Wählen Sie Ihr Paket
            </h2>
            <p className="text-xl text-gray-600">
              Alle Pakete mit 12 Monaten Mindestlaufzeit
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-white rounded-2xl border-2 overflow-hidden ${
                  pkg.popular ? 'border-primary-500 shadow-xl' : 'border-gray-200 shadow-sm'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary-500 text-white text-center py-2 text-sm font-medium">
                    <Star className="inline h-4 w-4 mr-1 -mt-0.5" />
                    Beliebt
                  </div>
                )}

                <div className={`p-8 ${pkg.popular ? 'pt-14' : ''}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-500 text-sm mb-6">{pkg.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{pkg.price}€</span>
                    <span className="text-gray-500">/Monat</span>
                  </div>

                  {/* Key Specs */}
                  <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center text-sm">
                      <HardDrive className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{pkg.storage}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <RefreshCw className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{pkg.backup}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      {pkg.support === 'E-Mail' && <Mail className="h-4 w-4 text-gray-400 mr-2" />}
                      {pkg.support === 'Priority' && <Headphones className="h-4 w-4 text-gray-400 mr-2" />}
                      {pkg.support === 'Telefon' && <Phone className="h-4 w-4 text-gray-400 mr-2" />}
                      <span className="text-gray-600">{pkg.support}</span>
                    </div>
                    {pkg.hours && (
                      <div className="flex items-center text-sm">
                        <Timer className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{pkg.hours}h/Monat</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className={`flex items-start text-sm ${
                          feature.included ? 'text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        <CheckCircle
                          className={`h-5 w-5 mr-2 flex-shrink-0 ${
                            feature.included ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                        {feature.text}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/kontakt?paket=${pkg.name}`}
                    className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-colors ${
                      pkg.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Jetzt anfragen
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hours Explanation */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100 p-8 md:p-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                  <Timer className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  So funktionieren die Revisionsstunden
                </h2>
              </div>

              <p className="text-gray-600 mb-8">
                Mit den Service- und Premium-Paketen erhalten Sie monatlich Revisionsstunden,
                die Sie für Änderungen an Ihrer Website nutzen können. Diese Stunden sammeln
                sich über die Vertragslaufzeit an.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center mb-3">
                    <Calendar className="h-5 w-5 text-primary-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Service-Paket</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    1 Stunde pro Monat = bis zu 12 Stunden in 12 Monaten
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Nach 6 Monaten:</span>
                      <span className="font-medium text-gray-900">6h verfügbar</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Nach 12 Monaten:</span>
                      <span className="font-medium text-gray-900">max. 12h</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center mb-3">
                    <Calendar className="h-5 w-5 text-primary-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Premium-Paket</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    2 Stunden pro Monat = bis zu 24 Stunden in 12 Monaten
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Nach 6 Monaten:</span>
                      <span className="font-medium text-gray-900">12h verfügbar</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Nach 12 Monaten:</span>
                      <span className="font-medium text-gray-900">max. 24h</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-6 flex items-start">
                <Zap className="h-4 w-4 mr-2 mt-0.5 text-primary-500" />
                Ungenutzte Stunden verfallen nach Ablauf der 12-monatigen Vertragslaufzeit
                und der Zähler startet neu.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Häufige Fragen
            </h2>
            <p className="text-gray-600">
              Alles Wichtige zu unseren Hosting-Paketen
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bereit für stressfreies Hosting?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Kontaktieren Sie uns für ein unverbindliches Angebot.
              Wir beraten Sie gerne bei der Wahl des richtigen Pakets.
            </p>
            <Link
              href="/kontakt"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Jetzt Kontakt aufnehmen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
