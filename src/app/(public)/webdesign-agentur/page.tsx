'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Globe,
  Palette,
  Smartphone,
  Search,
  Code2,
  Zap,
  Shield,
  Users,
  Euro,
  CheckCircle,
  Wrench,
  Briefcase,
  Building2,
  Eye,
  Monitor,
  Accessibility,
  Heart,
  Award,
  Headphones,
  TrendingUp,
  Layers
} from 'lucide-react';
// import ProjectCard from '@/components/ProjectCard'; // Temporär ausgeblendet
// import { getFeaturedProjects } from '@/lib/data/projects'; // Temporär ausgeblendet

// Services der Webagentur
const webdesignServices = [
  {
    icon: Palette,
    title: 'Professionelles Webdesign',
    description: 'Individuelles Design, das Ihre Marke perfekt repräsentiert und Besucher zu Kunden macht.',
    keywords: 'Webdesign, Website Design Agentur',
  },
  {
    icon: Smartphone,
    title: 'Responsive Webdesign',
    description: 'Websites, die auf allen Geräten perfekt aussehen - vom Smartphone bis zum Desktop.',
    keywords: 'Responsive Webdesign Agentur',
  },
  {
    icon: Code2,
    title: 'Webentwicklung',
    description: 'Moderne Technologien für schnelle, sichere und skalierbare Web-Anwendungen.',
    keywords: 'Webentwicklung Agentur, Web Development',
  },
  {
    icon: Search,
    title: 'SEO & Suchmaschinenoptimierung',
    description: 'Werden Sie bei Google gefunden - mit technischer und inhaltlicher SEO-Optimierung.',
    keywords: 'Webagentur SEO, Internetagentur Suchmaschinenoptimierung',
  },
];

// USPs der Digitalagentur
const agencyBenefits = [
  {
    icon: Euro,
    title: 'Transparente Festpreise',
    description: 'Keine versteckten Kosten. Sie wissen vorher genau, was Ihre Website kostet.',
  },
  {
    icon: Zap,
    title: 'Schnelle Umsetzung',
    description: 'Von der Idee zur fertigen Website in wenigen Wochen - nicht Monaten.',
  },
  {
    icon: Shield,
    title: 'Persönliche Betreuung',
    description: 'Ein fester Ansprechpartner, der Ihr Projekt von A bis Z begleitet.',
  },
  {
    icon: TrendingUp,
    title: 'Messbare Ergebnisse',
    description: 'Websites, die nicht nur gut aussehen, sondern auch Kunden bringen.',
  },
];

// Zielgruppen
const targetAudiences = [
  {
    icon: Wrench,
    title: 'Handwerker & lokale Betriebe',
    description: 'Professionelle Homepage erstellen lassen - für mehr Sichtbarkeit in Ihrer Region.',
    features: ['Lokale SEO-Optimierung', 'Google Maps Integration', 'Kontaktformular', 'Responsive Design'],
  },
  {
    icon: Briefcase,
    title: 'Dienstleister & Freiberufler',
    description: 'Website erstellen lassen, die Vertrauen schafft und Anfragen generiert.',
    features: ['Portfolio & Referenzen', 'Online-Terminbuchung', 'Blog-Integration', 'SSL-Zertifikat'],
  },
  {
    icon: Building2,
    title: 'Mittelstand & Unternehmen',
    description: 'Individuelle Web-Lösungen für komplexe Anforderungen und Prozesse.',
    features: ['Kundenportale', 'CRM-Integration', 'Mehrsprachigkeit', 'Enterprise-Hosting'],
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

export default function WebdesignAgenturPage() {
  // const featuredProjects = getFeaturedProjects().slice(0, 3); // Temporär ausgeblendet

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
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
                  Ihre Webdesign Agentur
                </span>
                <br />
                <span className="text-gray-900">für professionelle Websites</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Als erfahrene <strong>Webagentur</strong> und <strong>Digitalagentur</strong> entwickeln wir
                maßgeschneiderte Websites, die nicht nur gut aussehen, sondern auch Kunden gewinnen.
                Von der ersten Idee bis zur fertigen <strong>Internetagentur</strong>-Lösung.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Award className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">10+ Jahre Erfahrung</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Users className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">50+ zufriedene Kunden</span>
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
                  <Globe className="h-10 w-10 text-primary-600" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-0 left-0"
              >
                <div className="w-16 h-16 border-2 border-primary-500 rounded-2xl flex items-center justify-center bg-white shadow-lg">
                  <Search className="h-8 w-8 text-primary-600" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/4 right-0"
              >
                <div className="w-18 h-18 border-2 border-primary-500 rounded-2xl flex items-center justify-center bg-white shadow-lg p-4">
                  <Smartphone className="h-9 w-9 text-primary-600" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-1/4 right-1/4"
              >
                <div className="w-14 h-14 border-2 border-primary-500 rounded-xl flex items-center justify-center bg-white shadow-lg">
                  <Code2 className="h-7 w-7 text-primary-600" />
                </div>
              </motion.div>

              {/* Center Icon */}
              <div className="w-32 h-32 border-2 border-primary-500 rounded-3xl flex items-center justify-center bg-white shadow-xl">
                <Palette className="h-16 w-16 text-primary-600" />
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
              Full Service Webagentur - Alles aus einer Hand
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ob Sie eine neue <strong>Website erstellen lassen</strong> möchten oder Ihre bestehende
              <strong> Homepage professionell erstellen lassen</strong> wollen - wir bieten das komplette Spektrum
              einer modernen <strong>Web Agentur</strong>.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {webdesignServices.map((service, index) => {
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
              Ihre Digitalagentur mit persönlicher Betreuung
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Als <strong>Webdesign Firma</strong> legen wir Wert auf Qualität und Kundennähe.
              Das macht uns zur <strong>besten Webagentur</strong> für Ihr Projekt.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {agencyBenefits.map((benefit, index) => {
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
              Webentwicklung Agentur für jeden Bedarf
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ob kleine <strong>Website Agentur</strong>-Lösung oder komplexe <strong>Agentur für Webdesign</strong>-Projekte -
              wir finden die passende Lösung für Ihre Anforderungen.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {targetAudiences.map((audience, index) => {
              const Icon = audience.icon;
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
                    {audience.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {audience.description}
                  </p>
                  <ul className="space-y-2">
                    {audience.features.map((feature, featureIndex) => (
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
              Barrierefreies Webdesign - Websites für alle
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Als <strong>barrierefreie Website Agentur</strong> achten wir auf <strong>Webdesign barrierefrei</strong> nach
              aktuellen Standards. Damit erreichen Sie alle Nutzer - unabhängig von Einschränkungen.
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

      {/* Projects Section - Temporär ausgeblendet
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
              Professionelle Webdesign Agentur - Unsere Projekte
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Überzeugen Sie sich selbst von der Qualität unserer <strong>Internet Agentur</strong>.
              Hier finden Sie ausgewählte Referenzen unserer <strong>Webdesign Internetagentur</strong>.
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
                    <Globe className="h-10 w-10 text-primary-600" />
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
                  Jetzt Website erstellen lassen
                </h2>
                <p className="text-xl mb-8 text-gray-600">
                  Bereit für Ihre neue Website? Als <strong>professionelle Webdesign Agentur</strong> beraten wir Sie
                  kostenlos und unverbindlich zu Ihrem Projekt.
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
              Warum eine professionelle Webdesign Agentur beauftragen?
            </h2>
            <p className="text-gray-600 mb-4">
              Eine <strong>Webdesign Agentur</strong> bringt nicht nur technisches Know-how mit, sondern auch
              Erfahrung in der Konzeption und Gestaltung erfolgreicher Websites. Als <strong>Digitalagentur</strong>
              verstehen wir, wie wichtig eine durchdachte Online-Präsenz für Ihr Geschäft ist.
            </p>
            <p className="text-gray-600 mb-4">
              Ob Sie eine einfache <strong>Homepage erstellen lassen</strong> möchten oder eine komplexe
              <strong> Web-Anwendung</strong> benötigen - unsere <strong>Internetagentur</strong> bietet
              maßgeschneiderte Lösungen. Mit <strong>responsivem Webdesign</strong> stellen wir sicher,
              dass Ihre Website auf allen Geräten perfekt funktioniert.
            </p>
            <p className="text-gray-600">
              Als <strong>Full Service Webagentur</strong> kümmern wir uns um alle Aspekte Ihrer digitalen
              Präsenz: von der Konzeption über das Design bis hin zur <strong>Suchmaschinenoptimierung (SEO)</strong>.
              Lassen Sie sich von unserer <strong>Webentwicklung Agentur</strong> überzeugen und starten Sie
              Ihr Projekt noch heute.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
