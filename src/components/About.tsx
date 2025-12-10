'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Shield, Zap, Heart } from 'lucide-react';
import Image from 'next/image';

const highlights = [
  {
    icon: MessageSquare,
    title: 'Klare Kommunikation',
    description: 'Wir erklären alles so, dass Sie es verstehen - ohne Fachbegriffe',
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
    description: 'Wir empfehlen nur, was Sie wirklich brauchen',
  },
];

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
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
              Ihr Ansprechpartner
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Ein fester Kontakt für alle Ihre digitalen Projekte
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold mb-4 text-gray-800">
              Digitale Lösungen - einfach erklärt
            </h3>
            <p className="text-gray-600 mb-4">
              Sie brauchen eine Website oder ein digitales Werkzeug für Ihr Unternehmen?
              Wir entwickeln Lösungen, die genau zu Ihren Anforderungen passen -
              ohne unnötige Komplexität und zu fairen Preisen.
            </p>
            <p className="text-gray-600 mb-4">
              Seit über 10 Jahren helfen wir Unternehmen dabei, online erfolgreicher zu werden.
              Von der einfachen Firmenwebsite bis zum komplexen Buchungssystem -
              wir begleiten Sie von der ersten Idee bis zum fertigen Produkt und darüber hinaus.
            </p>
            <p className="text-gray-600">
              Das Wichtigste dabei: <strong>Wir erklären alles so, dass Sie es verstehen.</strong> Keine
              Fachbegriffe, kein Verkaufsdruck - nur ehrliche Beratung und zuverlässige Umsetzung.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/oscar.jpeg"
                  alt="Oscar Knabe - Ihr Ansprechpartner"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-lg">
                <p className="font-semibold text-gray-900">Oscar Knabe</p>
                <p className="text-sm text-primary-600">Ihr Ansprechpartner</p>
              </div>
            </div>
          </motion.div>
        </div>

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
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
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
    </section>
  );
}