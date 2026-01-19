'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Globe,
  Stethoscope,
  HeartPulse,
  Pill,
  Activity,
  Heart,
  Smile,
  FileText,
  CalendarCheck,
  Users,
  Shield,
  Clock,
  CheckCircle,
  Headphones,
  Layers,
  Award,
  Eye,
  Monitor,
  Accessibility,
} from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import { getFeaturedProjects } from '@/lib/data/projects';

// Services für Praxen
const praxisServices = [
  {
    icon: Globe,
    title: 'Praxis-Website',
    description: 'Moderne Online-Präsenz mit Leistungsspektrum, Team-Vorstellung und Praxisinfos.',
  },
  {
    icon: CalendarCheck,
    title: 'Online-Terminbuchung',
    description: 'Patienten buchen Termine 24/7 - integriert mit Ihrer Praxis-Software.',
  },
  {
    icon: FileText,
    title: 'Patientenportal',
    description: 'Befunde einsehen, Rezepte anfragen, Dokumente sicher austauschen.',
  },
  {
    icon: Accessibility,
    title: 'Barrierefreies Design',
    description: 'WCAG-konforme Websites für alle Patienten - unabhängig von Einschränkungen.',
  },
];

// USPs für Praxen
const praxisBenefits = [
  {
    icon: Heart,
    title: 'Patientenvertrauen',
    description: 'Professionelles Design, das Kompetenz und Fürsorglichkeit vermittelt.',
  },
  {
    icon: Accessibility,
    title: 'Barrierefreiheit',
    description: 'WCAG 2.1 konform - zugänglich für Patienten mit Seh- oder Höreinschränkungen.',
  },
  {
    icon: Shield,
    title: 'Medizinische Compliance',
    description: 'DSGVO-konform mit besonderem Fokus auf sensible Gesundheitsdaten.',
  },
  {
    icon: Clock,
    title: 'Zeit sparen',
    description: 'Online-Terminbuchung und Rezeptanfragen reduzieren Telefonanrufe um bis zu 40%.',
  },
];

// Zielgruppen / Praxistypen
const praxisTypen = [
  {
    icon: Stethoscope,
    title: 'Hausärzte & Allgemeinmedizin',
    description: 'Familienfreundliche Websites mit allen wichtigen Praxisinformationen.',
    features: ['Sprechzeiten-Anzeige', 'Akut-Termine online', 'Impfkalender', 'Notfall-Infos'],
  },
  {
    icon: Activity,
    title: 'Fachärzte & Spezialisten',
    description: 'Spezialisierte Präsenz mit Fokus auf Ihr Fachgebiet.',
    features: ['Behandlungsspektrum', 'Geräte & Technologie', 'Vorher/Nachher Galerie', 'Patientenberichte'],
  },
  {
    icon: Smile,
    title: 'Zahnärzte & Kieferorthopädie',
    description: 'Ansprechende Websites für Dental-Praxen aller Art.',
    features: ['Behandlungsfotos', '3D-Praxis-Tour', 'Finanzierungsrechner', 'Angstpatienten-Info'],
  },
];

// Barrierefreiheit Features
const accessibilityFeatures = [
  {
    icon: Eye,
    title: 'Kontrastreiche Gestaltung',
    description: 'Gut lesbare Texte und klare visuelle Hierarchie für alle Nutzer.',
  },
  {
    icon: Monitor,
    title: 'Screenreader-optimiert',
    description: 'Semantischer HTML-Code und ARIA-Labels für assistive Technologien.',
  },
  {
    icon: Accessibility,
    title: 'Tastaturnavigation',
    description: 'Vollständige Bedienbarkeit ohne Maus für motorisch eingeschränkte Nutzer.',
  },
  {
    icon: Heart,
    title: 'WCAG-konform',
    description: 'Erfüllung der Web Content Accessibility Guidelines für maximale Zugänglichkeit.',
  },
];

export default function WebdesignAerztePage() {
  const featuredProjects = getFeaturedProjects().slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/stock/industry-medical.jpg"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-primary-50/90" />
        </div>

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

        <div className="relative container mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  Webdesign für Praxen
                </span>
                <br />
                <span className="text-gray-900">die Vertrauen schaffen</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Moderne <strong>Praxis-Websites</strong> für Ärzte und Zahnärzte.
                <strong> Barrierefrei</strong>, DSGVO-konform und optimiert für die
                Gewinnung neuer Patienten.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Heart className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Patientenorientiert</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Accessibility className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Barrierefrei</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Shield className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">DSGVO-konform</span>
                </div>
              </div>

              <Link
                href="/kontakt"
                className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 hover:scale-105 hover:shadow-xl transition-all duration-300 text-lg"
              >
                Kostenloses Erstgespräch
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>

            {/* Right: Animated Icons */}
            <div className="hidden md:flex items-center justify-center relative h-80">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-1/4"
              >
                <div className="w-20 h-20 border-2 border-primary-500 rounded-2xl flex items-center justify-center bg-white shadow-lg">
                  <HeartPulse className="h-10 w-10 text-primary-600" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-0 left-0"
              >
                <div className="w-16 h-16 border-2 border-primary-500 rounded-2xl flex items-center justify-center bg-white shadow-lg">
                  <Pill className="h-8 w-8 text-primary-600" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/4 right-0"
              >
                <div className="w-18 h-18 border-2 border-primary-500 rounded-2xl flex items-center justify-center bg-white shadow-lg p-4">
                  <Activity className="h-9 w-9 text-primary-600" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-1/4 right-1/4"
              >
                <div className="w-14 h-14 border-2 border-primary-500 rounded-xl flex items-center justify-center bg-white shadow-lg">
                  <CalendarCheck className="h-7 w-7 text-primary-600" />
                </div>
              </motion.div>

              {/* Center Icon */}
              <div className="w-32 h-32 border-2 border-primary-500 rounded-3xl flex items-center justify-center bg-white shadow-xl">
                <Stethoscope className="h-16 w-16 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
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
              Digitale Lösungen für Ihre Praxis
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Von der modernen <strong>Praxis-Website</strong> bis zum vollständigen
              <strong> Patientenportal</strong> - wir entwickeln maßgeschneiderte Lösungen für Ärzte.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {praxisServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all border border-gray-100 group"
                >
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                    <Icon className="h-7 w-7 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {service.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
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
              Warum wir die richtige Wahl für Ihre Praxis sind
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Wir kennen die besonderen Anforderungen an <strong>Arzt-Websites</strong> und
              sorgen für <strong>barrierefreie</strong> und professionelle Online-Auftritte.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {praxisBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
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

      {/* Target Audiences Section */}
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
              Spezialisierte Websites für jeden Praxis-Typ
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ob <strong>Hausarztpraxis</strong>, <strong>Facharzt</strong> oder <strong>Zahnarzt</strong> -
              wir entwickeln die passende digitale Lösung für Ihre Anforderungen.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {praxisTypen.map((praxis, index) => {
              const Icon = praxis.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all border border-gray-100 group"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
                    <Icon className="h-8 w-8 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    {praxis.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {praxis.description}
                  </p>
                  <ul className="space-y-2">
                    {praxis.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-600 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
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
              Barrierefreies Webdesign - Praxis-Websites für alle
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Als <strong>barrierefreie Praxis-Website Agentur</strong> achten wir auf <strong>Webdesign barrierefrei</strong> nach
              aktuellen Standards. Damit erreichen Sie alle Patienten - unabhängig von Einschränkungen.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {accessibilityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Projects Section */}
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
              Unsere Referenzen
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Überzeugen Sie sich von der Qualität unserer Arbeit.
              Hier finden Sie ausgewählte Projekte aus verschiedenen Branchen.
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

      {/* Testimonials Section - Coming Soon */}
      {/*
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
              Das sagen unsere Kunden
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial Cards hier einfügen *}
          </div>
        </div>
      </section>
      */}

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
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
              {/* Left: Animated Icons */}
              <div className="hidden md:flex items-center justify-center relative">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 left-0"
                >
                  <div className="w-20 h-20 border-2 border-primary-500 rounded-2xl flex items-center justify-center">
                    <Stethoscope className="h-10 w-10 text-primary-600" />
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-4 right-4"
                >
                  <div className="w-16 h-16 border-2 border-primary-500 rounded-2xl flex items-center justify-center">
                    <Headphones className="h-8 w-8 text-primary-600" />
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-1/3 right-1/4"
                >
                  <div className="w-14 h-14 border-2 border-primary-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-primary-600" />
                  </div>
                </motion.div>

                <div className="w-32 h-32 border-2 border-primary-500 rounded-3xl flex items-center justify-center">
                  <Layers className="h-16 w-16 text-primary-600" />
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex flex-col justify-center text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  Jetzt Praxis-Website erstellen lassen
                </h2>
                <p className="text-xl mb-8 text-gray-600">
                  Bereit für Ihre neue <strong>Arzt-Website</strong>? Wir beraten Sie
                  kostenlos und unverbindlich. Barrierefrei und DSGVO-konform.
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

      {/* SEO Text Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Professionelles Webdesign für Ärzte und Praxen
            </h2>
            <p className="text-gray-600 mb-4">
              Als spezialisierte Agentur für <strong>Praxis-Webdesign</strong> verstehen wir die besonderen
              Anforderungen im Gesundheitswesen. Eine <strong>Arzt-Website</strong> muss nicht nur professionell
              aussehen, sondern auch <strong>barrierefrei</strong> und DSGVO-konform sein.
            </p>
            <p className="text-gray-600 mb-4">
              Wir entwickeln <strong>moderne Praxis-Websites</strong> für Hausärzte, Fachärzte, Zahnärzte und
              Kieferorthopäden. Von der einfachen <strong>Praxis-Homepage</strong> bis zum vollständigen
              <strong> Patientenportal</strong> mit Online-Terminbuchung - wir bieten maßgeschneiderte
              Lösungen für Ihre Anforderungen.
            </p>
            <p className="text-gray-600">
              Mit <strong>lokaler SEO-Optimierung</strong> sorgen wir dafür, dass potenzielle Patienten Sie
              bei der Suche nach einem Arzt in Ihrer Region finden. Unsere <strong>Online-Terminbuchung</strong>
              ermöglicht es Patienten, direkt Termine zu vereinbaren - 24 Stunden am Tag, 7 Tage die Woche.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
