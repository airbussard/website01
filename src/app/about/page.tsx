'use client';

import { motion } from 'framer-motion';
import { Code, Briefcase, Award, Users, Target, Heart, Lightbulb, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const stats = [
  { number: '10+', label: 'Jahre Erfahrung' },
  { number: '100+', label: 'Erfolgreiche Projekte' },
  { number: '50+', label: 'Zufriedene Kunden' },
  { number: '24/7', label: 'Support' },
];

const highlights = [
  {
    icon: Code,
    title: 'Technische Expertise',
    description: 'Breites Spektrum an Technologien von React bis Swift',
  },
  {
    icon: Briefcase,
    title: 'Business Verständnis',
    description: 'Lösungen die technisch und wirtschaftlich überzeugen',
  },
  {
    icon: Award,
    title: 'Qualität im Fokus',
    description: 'Clean Code, beste Practices und durchdachte Architektur',
  },
  {
    icon: Users,
    title: 'Teamplayer',
    description: 'Agile Zusammenarbeit und klare Kommunikation',
  },
];

const values = [
  {
    icon: Target,
    title: 'Zielorientiert',
    description: 'Wir fokussieren uns auf messbare Ergebnisse und den Erfolg Ihrer digitalen Projekte. Jede Zeile Code dient einem klaren Geschäftsziel.',
  },
  {
    icon: Heart,
    title: 'Leidenschaft',
    description: 'Technologie ist nicht nur unser Beruf, sondern unsere Passion. Diese Begeisterung spiegelt sich in jedem Projekt wider.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Wir bleiben am Puls der Zeit und setzen modernste Technologien ein, um zukunftssichere Lösungen zu schaffen.',
  },
  {
    icon: TrendingUp,
    title: 'Wachstum',
    description: 'Ihr Erfolg ist unser Erfolg. Wir entwickeln skalierbare Lösungen, die mit Ihrem Unternehmen wachsen.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Über getemergence.com
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Ihr Partner für digitale Innovation und maßgeschneiderte Software-Lösungen
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
              Innovation durch Technologie
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              getemergence.com ist Ihr vertrauenswürdiger Partner für digitale Transformation.
              Unser erfahrenes Team aus Full-Stack Entwicklern und iOS Experten bringt Ihre
              digitalen Visionen zum Leben. Mit über einem Jahrzehnt Erfahrung haben wir
              erfolgreich Lösungen für Unternehmen jeder Größe entwickelt.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Unsere Stärke liegt in der perfekten Verbindung von technischer Exzellenz
              und tiefem Verständnis für Geschäftsprozesse. Wir entwickeln nicht nur Software –
              wir schaffen digitale Erlebnisse, die Ihre Nutzer begeistern und Ihr Business
              voranbringen.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Von Start-ups bis zu etablierten Unternehmen – wir sind der Partner, der Ihre
              digitalen Herausforderungen in erfolgreiche Lösungen verwandelt. Technologie
              ist unsere Leidenschaft, Ihr Erfolg unser Ziel.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Highlights */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Warum getemergence.com?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                    {highlight.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {highlight.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Unsere Werte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Unser Team
          </h2>
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">OK</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Oscar Knabe
              </h3>
              <p className="text-primary-600 dark:text-primary-400 mb-4 font-medium">
                Founder & Lead Developer
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Mit über 10 Jahren Erfahrung in der Software-Entwicklung bringe ich technische Expertise
                und strategisches Denken zusammen. Spezialisiert auf Full-Stack Development, iOS Apps
                und System-Architektur entwickle ich maßgeschneiderte Lösungen für digitale Herausforderungen.
              </p>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
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
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Code className="h-10 w-10 text-white" />
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
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
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
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Award className="h-7 w-7 text-white" />
                </div>
              </motion.div>

              <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                <Heart className="h-16 w-16 text-white" />
              </div>
            </div>

            {/* Right: Content */}
            <div className="flex flex-col justify-center text-center md:text-left text-white">
              <h2 className="text-3xl font-bold mb-4">
                Lassen Sie uns zusammenarbeiten
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Bereit für Ihr nächstes digitales Projekt? Wir freuen uns auf Ihre Ideen!
              </p>
              <div>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 hover:scale-105 hover:shadow-2xl transition-all duration-300 text-lg"
                >
                  Jetzt Kontakt aufnehmen
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
