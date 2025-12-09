'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Globe,
  Layers,
  Smartphone,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Users,
  Store,
  Briefcase,
  Building2,
  Truck,
  Stethoscope,
  ShoppingCart,
  Calendar,
  BarChart3,
  MessageSquare,
  Bell,
  Wallet,
  Search,
  Compass
} from 'lucide-react';

const services = [
  {
    id: 'websites',
    icon: Globe,
    title: 'Websites & Webshops',
    tagline: 'Ihre digitale Visitenkarte, die rund um die Uhr für Sie arbeitet',
    description: 'Professionelle Websites, die nicht nur gut aussehen, sondern auch Kunden gewinnen. Optimiert für Suchmaschinen und mobile Geräte.',
    forWhom: [
      { icon: Store, text: 'Lokale Geschäfte' },
      { icon: Briefcase, text: 'Dienstleister' },
      { icon: Truck, text: 'Handwerker' },
      { icon: Users, text: 'Freiberufler' },
    ],
    features: [
      'Professionelles, individuelles Design',
      'Kontaktformular mit E-Mail-Benachrichtigung',
      'Google Maps Integration',
      'Lokale SEO-Optimierung',
      'Responsive für alle Geräte',
      'Hosting & SSL inklusive',
    ],
    benefits: [
      'Werden Sie online von Neukunden gefunden',
      'Generieren Sie Anfragen auch außerhalb der Öffnungszeiten',
      'Professioneller erster Eindruck',
    ],
  },
  {
    id: 'webapps',
    icon: Layers,
    title: 'Web-Anwendungen',
    tagline: 'Digitale Werkzeuge, die Ihre Geschäftsprozesse automatisieren',
    description: 'Maßgeschneiderte Web-Anwendungen, die Ihre tägliche Arbeit vereinfachen und Prozesse automatisieren. Von Kundenportalen bis zu internen Tools.',
    forWhom: [
      { icon: Briefcase, text: 'Agenturen' },
      { icon: Building2, text: 'Beratungsunternehmen' },
      { icon: Stethoscope, text: 'Praxen & Kliniken' },
      { icon: ShoppingCart, text: 'E-Commerce' },
    ],
    features: [
      'Kundenportale mit Login-Bereich',
      'Buchungs- und Terminverwaltung',
      'Ticketsysteme für Anfragen',
      'Kalkulationstools',
      'Anfragenmanagement',
      'Dashboard & Reporting',
    ],
    benefits: [
      'Weniger manuelle Arbeit durch Automatisierung',
      'Besserer Überblick über Ihr Geschäft',
      'Professionellerer Kundenservice',
    ],
  },
  {
    id: 'mobile',
    icon: Smartphone,
    title: 'Mobile Apps',
    tagline: 'Ihre Marke in der Hosentasche Ihrer Kunden',
    description: 'Native iOS und Android Apps, die Ihre Kunden begeistern. Von der Konzeption über die Entwicklung bis zur Veröffentlichung im App Store.',
    forWhom: [
      { icon: Building2, text: 'Unternehmen' },
      { icon: Store, text: 'Einzelhandel' },
      { icon: Calendar, text: 'Event-Veranstalter' },
      { icon: Truck, text: 'Logistik' },
    ],
    features: [
      'Native iOS & Android Entwicklung',
      'Benutzerfreundliches Interface',
      'Push-Benachrichtigungen',
      'Offline-Fähigkeit',
      'App Store Veröffentlichung',
      'Laufende Wartung & Updates',
    ],
    benefits: [
      'Direkte Verbindung zu Ihren Kunden',
      'Höhere Kundenbindung',
      'Modernes Unternehmensimage',
    ],
  },
  {
    id: 'consulting',
    icon: Lightbulb,
    title: 'IT-Beratung',
    tagline: 'Klarheit vor der Investition - wir helfen bei der Entscheidung',
    description: 'Sie stehen vor einer digitalen Entscheidung? Wir beraten Sie unabhängig und helfen Ihnen, die richtige Lösung zu finden - ohne Verkaufsdruck.',
    forWhom: [
      { icon: Building2, text: 'Geschäftsführer' },
      { icon: BarChart3, text: 'Entscheider' },
      { icon: Users, text: 'Teams' },
      { icon: Compass, text: 'Gründer' },
    ],
    features: [
      'Unabhängige Technologieberatung',
      'Anforderungsanalyse',
      'Machbarkeitsprüfung',
      'Anbietervergleich',
      'Projektplanung',
      'Zweitmeinung zu Angeboten',
    ],
    benefits: [
      'Fundierte Entscheidungsgrundlage',
      'Vermeidung teurer Fehlentscheidungen',
      'Neutraler Blick von außen',
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Die richtige Lösung für Ihr Unternehmen
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Von der einfachen Website bis zum komplexen System - wir finden gemeinsam heraus, was Sie wirklich brauchen
          </p>
        </motion.div>

        {/* Services */}
        <div className="space-y-12 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Service Header */}
                <div className="p-8 md:p-10 border-b border-gray-100">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {service.title}
                      </h2>
                      <p className="text-lg text-primary-600 font-medium">
                        {service.tagline}
                      </p>
                    </div>
                  </div>
                  <p className="mt-6 text-gray-600 text-lg leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Service Content */}
                <div className="p-8 md:p-10">
                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Fuer wen? */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Für wen?
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {service.forWhom.map((item, itemIndex) => {
                          const ItemIcon = item.icon;
                          return (
                            <div
                              key={itemIndex}
                              className="flex items-center gap-2 text-gray-700"
                            >
                              <ItemIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{item.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Was Sie bekommen */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Was Sie bekommen
                      </h3>
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-2 text-gray-600 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Ihr Nutzen */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Ihr Nutzen
                      </h3>
                      <ul className="space-y-3">
                        {service.benefits.map((benefit, benefitIndex) => (
                          <li
                            key={benefitIndex}
                            className="flex items-start gap-2 text-gray-700 text-sm font-medium"
                          >
                            <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <Link
                      href="/kontakt"
                      className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Jetzt beraten lassen
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl border-2 border-primary-500 p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Nicht sicher, was Sie brauchen?
          </h2>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Kein Problem! In einem kostenlosen Erstgespräch finden wir gemeinsam heraus, welche Lösung am besten zu Ihnen passt.
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 hover:scale-105 hover:shadow-xl transition-all duration-300 text-lg"
          >
            Kostenloses Erstgespräch vereinbaren
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
