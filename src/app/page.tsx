'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Globe,
  Layers,
  Smartphone,
  Lightbulb,
  Euro,
  Zap,
  Shield,
  TrendingUp,
  Wrench,
  Briefcase,
  Building2,
  MessageSquare,
  FileText,
  Code2,
  Headphones,
  CheckCircle,
  Database
} from 'lucide-react';
import Hero from '@/components/Hero';
import ProjectCard from '@/components/ProjectCard';
import { getFeaturedProjects } from '@/lib/data/projects';

// USP-Vorteile
const benefits = [
  {
    icon: Euro,
    title: 'Faire Preise',
    description: 'Transparente Festpreise ohne versteckte Kosten. Sie wissen vorher, was es kostet.',
  },
  {
    icon: Zap,
    title: 'Schnelle Umsetzung',
    description: 'Von der Idee zur fertigen Lösung in Wochen, nicht Monaten.',
  },
  {
    icon: Shield,
    title: 'Dauerhafte Betreuung',
    description: 'Langfristige Partnerschaft mit persönlichem Ansprechpartner.',
  },
  {
    icon: TrendingUp,
    title: 'Werbeoptimiert',
    description: 'SEO & Conversion-Optimierung für mehr Kundenanfragen.',
  },
];

// Branchen/Zielgruppen
const targetGroups = [
  {
    icon: Wrench,
    title: 'Handwerker & lokale Betriebe',
    subtitle: 'Professionelle Visitenkarte im Netz',
    features: [
      'Responsive Website',
      'Kontaktformular',
      'Google Maps Integration',
      'Lokale SEO-Optimierung',
      'Hosting inklusive',
    ],
  },
  {
    icon: Briefcase,
    title: 'Dienstleister & Agenturen',
    subtitle: 'Websites die Kunden gewinnen',
    features: [
      'Portfolio & Referenzen',
      'Buchungssystem',
      'Newsletter-Integration',
      'Blog & Content',
      'Analytics Dashboard',
    ],
  },
  {
    icon: Building2,
    title: 'Mittelstand & Unternehmen',
    subtitle: 'Komplexe Systeme die Prozesse automatisieren',
    features: [
      'Kundenportale',
      'Ticketsysteme',
      'Anfragenmanagement',
      'Kalkulationstools',
      'CRM-Integration',
    ],
  },
];

// Prozess-Schritte
const processSteps = [
  {
    number: '1',
    title: 'Erstgespräch',
    subtitle: 'Kostenlos',
    icon: MessageSquare,
    items: ['Anforderungen verstehen', 'Ziele definieren', 'Machbarkeit prüfen'],
  },
  {
    number: '2',
    title: 'Konzept',
    subtitle: '',
    icon: FileText,
    items: ['Wireframes erstellen', 'Festpreis-Angebot', 'Timeline festlegen'],
  },
  {
    number: '3',
    title: 'Umsetzung',
    subtitle: '',
    icon: Code2,
    items: ['Entwicklung', 'Regelmäßige Abstimmung', 'Tests & Qualität'],
  },
  {
    number: '4',
    title: 'Betreuung',
    subtitle: 'Dauerhaft',
    icon: Headphones,
    items: ['Updates & Wartung', 'Support bei Fragen', 'Optimierung'],
  },
];

// Services (nutzenorientiert)
const services = [
  {
    icon: Globe,
    title: 'Websites & Webshops',
    description: 'Ihre digitale Visitenkarte - professionell, modern und rund um die Uhr erreichbar',
    forWhom: 'Handwerker, Dienstleister, Unternehmen',
  },
  {
    icon: Layers,
    title: 'Web-Anwendungen',
    description: 'Digitale Werkzeuge, die Ihre Geschäftsprozesse automatisieren',
    forWhom: 'Agenturen, Beratungen, Mittelstand',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Ihre Marke in der Hosentasche Ihrer Kunden',
    forWhom: 'Unternehmen mit mobilem Kundenkontakt',
  },
  {
    icon: Lightbulb,
    title: 'IT-Beratung',
    description: 'Klarheit vor der Investition - unabhängige Beratung',
    forWhom: 'Vor digitalen Entscheidungen',
  },
];

// Testimonials
const testimonials = [
  {
    name: 'Eyup Akpinar',
    company: 'Flighthour',
    quote: 'Super Zusammenarbeit, gerne wieder!',
  },
  {
    name: 'Max Mustermann',
    company: 'Beispiel GmbH',
    quote: 'Professionelle Umsetzung und tolle Kommunikation.',
  },
  {
    name: 'Anna Schmidt',
    company: 'Schmidt & Partner',
    quote: 'Schnell, zuverlässig und kreativ. Absolut empfehlenswert!',
  },
];

export default function Home() {
  const featuredProjects = getFeaturedProjects().slice(0, 3);

  return (
    <main>
        <Hero />

        {/* Vorteile/USPs Sektion */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Warum Unternehmen mit uns arbeiten
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Wir verstehen die Bedürfnisse von kleinen und mittelständischen Unternehmen
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Icon className="h-7 w-7 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Fuer wen wir arbeiten - Branchen */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Für wen wir arbeiten
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Von der einfachen Website bis zum komplexen System - wir finden die richtige Lösung für Ihr Unternehmen
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {targetGroups.map((group, index) => {
                const Icon = group.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
                  >
                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
                      <Icon className="h-8 w-8 text-primary-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">
                      {group.title}
                    </h3>
                    <p className="text-primary-600 font-medium mb-4">
                      {group.subtitle}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">
                      Anwendungsbeispiele
                    </p>
                    <ul className="space-y-2 mb-6">
                      {group.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-600 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/kontakt"
                      className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                    >
                      Mehr erfahren
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Services Teaser */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Unsere Leistungen
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Maßgeschneiderte Lösungen für Ihre digitalen Herausforderungen
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {service.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {service.forWhom}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link
                href="/services"
                className="inline-flex items-center text-primary-600 font-semibold hover:underline"
              >
                Finden Sie die richtige Lösung
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Prozess-Sektion */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                So arbeiten wir zusammen
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Vom ersten Gespräch bis zur dauerhaften Betreuung - transparent und planbar
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div className="bg-white rounded-xl p-6 border border-gray-200 h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          {step.number}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{step.title}</h3>
                          {step.subtitle && (
                            <span className="text-xs text-primary-600 font-medium">{step.subtitle}</span>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {step.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start text-gray-600 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  Ausgewählte Projekte
                </span>
              </h2>
              <p className="text-xl text-gray-600">
                Einblicke in unsere erfolgreichen Projekte
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {featuredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link
                href="/projekte"
                className="inline-flex items-center text-primary-600 font-semibold hover:underline"
              >
                Alle Projekte ansehen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary-50 to-blue-50">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Das sagen{' '}
                <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  unsere Kunden
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Vertrauen durch erfolgreiche Zusammenarbeit
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-primary-100 hover:border-primary-200 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600" />
                  <div className="text-5xl text-primary-400 mb-4 font-serif">"</div>
                  <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                    {testimonial.quote}
                  </p>
                  <div className="border-t border-primary-100 pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-primary-600">{testimonial.company}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-2xl border-2 border-primary-500 overflow-hidden"
            >
              {/* Background Grid Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(0deg, rgb(59, 130, 246) 1px, transparent 1px), linear-gradient(90deg, rgb(59, 130, 246) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                  }}
                />
              </div>

              <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12">
                {/* Left: Decorative Elements */}
                <div className="hidden md:flex items-center justify-center relative">
                  <motion.div
                    animate={{
                      y: [0, -20, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-0 left-0"
                  >
                    <div className="w-20 h-20 border-2 border-primary-500 rounded-2xl flex items-center justify-center">
                      <Code2 className="h-10 w-10 text-primary-600" />
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, 20, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="absolute bottom-4 right-4"
                  >
                    <div className="w-16 h-16 border-2 border-primary-500 rounded-2xl flex items-center justify-center">
                      <Smartphone className="h-8 w-8 text-primary-600" />
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                    className="absolute top-1/3 right-1/4"
                  >
                    <div className="w-14 h-14 border-2 border-primary-500 rounded-xl flex items-center justify-center">
                      <Database className="h-7 w-7 text-primary-600" />
                    </div>
                  </motion.div>

                  <div className="w-32 h-32 border-2 border-primary-500 rounded-3xl flex items-center justify-center">
                    <Lightbulb className="h-16 w-16 text-primary-600" />
                  </div>
                </div>

                {/* Right: Content */}
                <div className="flex flex-col justify-center text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    Bereit für Ihr Projekt?
                  </h2>
                  <p className="text-xl mb-8 text-gray-600">
                    In einem kostenlosen Erstgespräch klären wir Ihre Anforderungen und zeigen Ihnen, wie wir helfen können.
                  </p>
                  <div>
                    <Link
                      href="/kontakt"
                      className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 hover:scale-105 hover:shadow-xl transition-all duration-300 text-lg"
                    >
                      Kostenloses Erstgespräch vereinbaren
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
    </main>
  );
}