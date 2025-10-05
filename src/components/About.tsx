'use client';

import { motion } from 'framer-motion';
import { Code, Briefcase, Award, Users } from 'lucide-react';

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

export default function About() {
  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-800">
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
              Über uns
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Ihr Partner für digitale Innovation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
              Innovation durch Technologie
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              getemergence.com ist Ihr vertrauenswürdiger Partner für digitale Transformation.
              Unser erfahrenes Team aus Full-Stack Entwicklern und iOS Experten bringt Ihre
              digitalen Visionen zum Leben. Mit über einem Jahrzehnt Erfahrung haben wir
              erfolgreich Lösungen für Unternehmen jeder Größe entwickelt.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Unsere Stärke liegt in der perfekten Verbindung von technischer Exzellenz
              und tiefem Verständnis für Geschäftsprozesse. Wir entwickeln nicht nur Software –
              wir schaffen digitale Erlebnisse, die Ihre Nutzer begeistern und Ihr Business
              voranbringen.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
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
                className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
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
                className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                  {highlight.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
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