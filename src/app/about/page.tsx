'use client';

import { motion } from 'framer-motion';
import { Code, Briefcase, Award, Users, Target, Heart, Lightbulb, TrendingUp, MessageSquare, Shield, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const highlights = [
  {
    icon: MessageSquare,
    title: 'Klare Kommunikation',
    description: 'Ich erkläre alles so, dass Sie es verstehen - ohne Fachbegriffe',
  },
  {
    icon: Shield,
    title: 'Zuverlässigkeit',
    description: 'Ein fester Ansprechpartner von Anfang bis Ende',
  },
  {
    icon: Zap,
    title: 'Schnelle Umsetzung',
    description: 'Effiziente Entwicklung ohne unnötige Verzögerungen',
  },
  {
    icon: Heart,
    title: 'Ehrliche Beratung',
    description: 'Ich empfehle nur, was Sie wirklich brauchen',
  },
];

const values = [
  {
    icon: Target,
    title: 'Lösungsorientiert',
    description: 'Ich konzentriere mich auf das, was Ihrem Unternehmen wirklich hilft - nicht auf technische Spielereien.',
  },
  {
    icon: Briefcase,
    title: 'Partnerschaftlich',
    description: 'Ich sehe mich als Ihren Partner, nicht als Dienstleister. Ihr Erfolg ist auch mein Erfolg.',
  },
  {
    icon: Lightbulb,
    title: 'Pragmatisch',
    description: 'Die beste Lösung ist oft die einfachste. Ich setze auf bewährte Ansätze statt auf unnötige Komplexität.',
  },
  {
    icon: TrendingUp,
    title: 'Langfristig',
    description: 'Ich entwickle Lösungen, die auch in Jahren noch funktionieren - und betreue Sie auch nach dem Projekt.',
  },
];

export default function AboutPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Wer steckt hinter getemergence?
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ein Ansprechpartner. Individuelle Lösungen. Langfristige Betreuung.
          </p>
        </motion.div>

        {/* Main Content - Oscar Introduction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-8 shadow-lg"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Digitale Lösungen - einfach erklärt
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Sie brauchen eine Website oder ein digitales Werkzeug für Ihr Unternehmen?
              Ich entwickle Lösungen, die genau zu Ihren Anforderungen passen -
              ohne unnötige Komplexität und zu fairen Preisen.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Seit über 10 Jahren helfe ich Unternehmen dabei, online erfolgreicher zu werden.
              Von der einfachen Firmenwebsite bis zum komplexen Buchungssystem -
              ich begleite Sie von der ersten Idee bis zum fertigen Produkt und darüber hinaus.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Das Wichtigste dabei: <strong>Ich erkläre alles so, dass Sie es verstehen.</strong> Keine
              Fachbegriffe, kein Verkaufsdruck - nur ehrliche Beratung und zuverlässige Umsetzung.
            </p>
          </motion.div>

          {/* Oscar Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/oscar.jpeg"
                  alt="Oscar Knabe - Ihr Ansprechpartner"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-lg">
                <p className="font-semibold text-gray-900">Oscar Knabe</p>
                <p className="text-sm text-primary-600">Ihr Ansprechpartner</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Highlights */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Was Sie von mir erwarten können
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
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-800">
                    {highlight.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {highlight.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Meine Arbeitsweise
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
                  className="bg-white rounded-xl p-8 shadow-lg"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-7 w-7 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-800">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
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
                  <Code className="h-10 w-10 text-primary-600" />
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
                  <Users className="h-8 w-8 text-primary-600" />
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
                  <Award className="h-7 w-7 text-primary-600" />
                </div>
              </motion.div>

              <div className="w-32 h-32 border-2 border-primary-500 rounded-3xl flex items-center justify-center">
                <Heart className="h-16 w-16 text-primary-600" />
              </div>
            </div>

            {/* Right: Content */}
            <div className="flex flex-col justify-center text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Lassen Sie uns sprechen
              </h2>
              <p className="text-xl mb-8 text-gray-600">
                Erzählen Sie mir von Ihrem Vorhaben - in einem kostenlosen Erstgespräch finden wir heraus, wie ich Ihnen helfen kann.
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
      </main>
    </div>
  );
}
