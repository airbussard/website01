'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Globe,
  Building2,
  Home,
  Key,
  FileSearch,
  FileText,
  MessageSquare,
  BarChart3,
  Users,
  User,
  Shield,
  Clock,
  TrendingUp,
  Settings,
  Layers,
  Link as LinkIcon,
  Lock,
  Mail,
  Smartphone,
  CheckCircle,
  Headphones,
  Award,
  Zap,
} from 'lucide-react';
// import ProjectCard from '@/components/ProjectCard'; // Temporär ausgeblendet
// import { getFeaturedProjects } from '@/lib/data/projects'; // Temporär ausgeblendet

// Standard-Paket Features
const standardFeatures = [
  {
    icon: Building2,
    title: 'Objektverwaltung',
    description: 'Alle Immobilien zentral verwalten mit Bildern, Dokumenten und Details.',
    included: true,
  },
  {
    icon: FileText,
    title: 'Exposé-Generator',
    description: 'Professionelle PDF-Exposés auf Knopfdruck erstellen.',
    included: true,
  },
  {
    icon: MessageSquare,
    title: 'Anfrage-Management',
    description: 'Interessenten-Anfragen automatisch erfassen und bearbeiten.',
    included: true,
  },
  {
    icon: Users,
    title: 'Basis-CRM',
    description: 'Kundenkontakte verwalten und Kommunikation nachverfolgen.',
    included: true,
  },
];

// Individuelle Erweiterungen
const erweiterungen = [
  {
    icon: Globe,
    title: 'Makler-Website',
    description: 'Professionelle Immobilien-Website mit automatischer Objekt-Anzeige und Suchfunktion.',
  },
  {
    icon: LinkIcon,
    title: 'Website-Integration',
    description: 'Nahtlose Integration in Ihre bestehende Website mit automatischer Objekt-Synchronisation.',
  },
  {
    icon: Mail,
    title: 'E-Mail-Automation',
    description: 'Automatische Benachrichtigungen bei neuen Objekten für passende Interessenten.',
  },
  {
    icon: BarChart3,
    title: 'Erweiterte Auswertungen',
    description: 'Detaillierte Statistiken, Provision-Tracking und Performance-Reports.',
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Objekte und Anfragen unterwegs verwalten - iOS und Android.',
  },
  {
    icon: Lock,
    title: 'Portal-Anbindung',
    description: 'Automatische Synchronisation mit ImmoScout24, Immowelt & Co.',
  },
  {
    icon: Users,
    title: 'Mandantenfähigkeit',
    description: 'Mehrere Maklerbüros in einem System mit separaten Zugängen.',
  },
];

// USPs
const softwareBenefits = [
  {
    icon: Clock,
    title: 'Zeitersparnis',
    description: 'Automatisierte Prozesse sparen bis zu 10 Stunden pro Woche.',
  },
  {
    icon: TrendingUp,
    title: 'Mehr Abschlüsse',
    description: 'Schnellere Reaktionszeiten und professionelle Exposés überzeugen Kunden.',
  },
  {
    icon: Layers,
    title: 'Alles in einem',
    description: 'Keine Insellösungen mehr - ein System für alle Prozesse.',
  },
  {
    icon: Settings,
    title: 'Individuell anpassbar',
    description: 'Erweitern Sie das System nach Ihren Bedürfnissen.',
  },
];

// Zielgruppen
const maklerTypen = [
  {
    icon: User,
    title: 'Einzelmakler',
    description: 'Effiziente Verwaltung für Solo-Makler mit wenig Aufwand.',
    features: ['Einfache Bedienung', 'Schneller Start', 'Günstiger Einstieg', 'Keine IT-Kenntnisse nötig'],
  },
  {
    icon: Users,
    title: 'Maklerteams',
    description: 'Gemeinsame Objektverwaltung und Teamkoordination.',
    features: ['Mehrbenutzerzugriff', 'Aufgabenverteilung', 'Aktivitätsprotokoll', 'Team-Dashboard'],
  },
  {
    icon: Building2,
    title: 'Maklerbüros',
    description: 'Professionelle Lösung für etablierte Immobilienbüros.',
    features: ['Filialverwaltung', 'Provision-Splitting', 'Führungskräfte-Reports', 'API-Anbindungen'],
  },
];

export default function ImmobilienSoftwarePage() {
  // const featuredProjects = getFeaturedProjects().slice(0, 3); // Temporär ausgeblendet

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/stock/industry-realestate.jpg"
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
                  Immobilien-Software
                </span>
                <br />
                <span className="text-gray-900">für erfolgreiche Makler</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Das <strong>All-in-One Maklersystem</strong> für Objektverwaltung, Exposé-Erstellung,
                Anfrage-Management und CRM. <strong>Standard-Paket</strong> mit optionalen
                <strong> individuellen Erweiterungen</strong>.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Building2 className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Immobilien-Experten</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Zap className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Automatisierung</span>
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
                Kostenlose Demo anfragen
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
                  <Home className="h-10 w-10 text-primary-600" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-0 left-0"
              >
                <div className="w-16 h-16 border-2 border-primary-500 rounded-2xl flex items-center justify-center bg-white shadow-lg">
                  <FileSearch className="h-8 w-8 text-primary-600" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/4 right-0"
              >
                <div className="w-18 h-18 border-2 border-primary-500 rounded-2xl flex items-center justify-center bg-white shadow-lg p-4">
                  <Users className="h-9 w-9 text-primary-600" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-1/4 right-1/4"
              >
                <div className="w-14 h-14 border-2 border-primary-500 rounded-xl flex items-center justify-center bg-white shadow-lg">
                  <BarChart3 className="h-7 w-7 text-primary-600" />
                </div>
              </motion.div>

              {/* Center Icon */}
              <div className="w-32 h-32 border-2 border-primary-500 rounded-3xl flex items-center justify-center bg-white shadow-xl">
                <Building2 className="h-16 w-16 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Standard-Paket Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <CheckCircle className="h-4 w-4" />
              Standard-Paket
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Alles, was Sie für den Start brauchen
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Unser <strong>Standard-Paket</strong> enthält alle wichtigen Funktionen für eine
              effiziente Immobilienverwaltung - sofort einsatzbereit.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {standardFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all border border-gray-100 group relative"
                >
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                    <Icon className="h-7 w-7 text-primary-600 group-hover:text-white transition-colors" />
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

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/kontakt"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Angebot anfragen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Erweiterungen Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Settings className="h-4 w-4" />
              Individuelle Erweiterungen
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Erweitern Sie Ihr System nach Bedarf
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Passen Sie die Software an Ihre individuellen Anforderungen an.
              Alle Erweiterungen werden <strong>maßgeschneidert</strong> für Ihr Unternehmen entwickelt.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {erweiterungen.map((erweiterung, index) => {
              const Icon = erweiterung.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-gray-100 group"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                    <Icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    {erweiterung.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {erweiterung.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <p className="text-gray-500 text-sm">
              Weitere Erweiterungen auf Anfrage. Sprechen Sie mit uns über Ihre Anforderungen.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
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
              Ihre Vorteile mit unserer Immobilien-Software
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Steigern Sie Ihre Effizienz und schließen Sie mehr Geschäfte ab -
              mit dem richtigen Werkzeug an Ihrer Seite.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {softwareBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
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
              Die richtige Lösung für jeden Makler-Typ
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ob <strong>Einzelmakler</strong>, <strong>Team</strong> oder <strong>Maklerbüro</strong> -
              unsere Software wächst mit Ihren Anforderungen.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {maklerTypen.map((makler, index) => {
              const Icon = makler.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all border border-gray-100 group"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
                    <Icon className="h-8 w-8 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    {makler.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {makler.description}
                  </p>
                  <ul className="space-y-2">
                    {makler.features.map((feature, featureIndex) => (
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
              Unsere Referenzen
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Überzeugen Sie sich von der Qualität unserer Arbeit.
              Hier finden Sie ausgewählte Projekte - darunter unser ImmoGear-System.
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
                    <Building2 className="h-10 w-10 text-primary-600" />
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
                  <Key className="h-16 w-16 text-primary-600" />
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex flex-col justify-center text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  Ihre maßgeschneiderte Immobilien-Software
                </h2>
                <p className="text-xl mb-8 text-gray-600">
                  Vom <strong>Standard-Paket</strong> bis zur individuellen Lösung - wir beraten Sie
                  kostenlos und unverbindlich zu Ihren Anforderungen.
                </p>
                <div>
                  <Link
                    href="/kontakt"
                    className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 hover:scale-105 hover:shadow-xl transition-all duration-300 text-lg"
                  >
                    Kostenlose Demo anfragen
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
              Professionelle Immobilien-Software für Makler
            </h2>
            <p className="text-gray-600 mb-4">
              Als spezialisierter Anbieter für <strong>Maklersoftware</strong> verstehen wir die besonderen
              Anforderungen der Immobilienbranche. Eine <strong>Immobilien-Software</strong> muss nicht nur
              funktional sein, sondern auch Zeit sparen und den Verkaufsprozess unterstützen.
            </p>
            <p className="text-gray-600 mb-4">
              Unser <strong>All-in-One Maklersystem</strong> umfasst <strong>Objektverwaltung</strong>,
              <strong> Exposé-Generator</strong>, <strong>Anfrage-Management</strong> und ein vollständiges
              <strong> CRM-System</strong>. Mit optionalen Erweiterungen wie Portal-Anbindung, Mobile App
              oder E-Mail-Automation passen Sie die Software genau an Ihre Bedürfnisse an.
            </p>
            <p className="text-gray-600">
              Ob <strong>Einzelmakler</strong>, <strong>Maklerteam</strong> oder <strong>Maklerbüro</strong> -
              unsere Software wächst mit Ihrem Unternehmen. Automatisierte Prozesse sparen wertvolle Zeit,
              professionelle Exposés überzeugen Kunden und das integrierte CRM sorgt dafür, dass keine
              Anfrage unbeantwortet bleibt.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
