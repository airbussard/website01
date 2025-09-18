'use client';

import { motion } from 'framer-motion';
import { Code, Briefcase, Award, Users } from 'lucide-react';

const stats = [
  { number: '5+', label: 'Jahre Erfahrung' },
  { number: '50+', label: 'Projekte' },
  { number: '30+', label: 'Zufriedene Kunden' },
  { number: '100%', label: 'Leidenschaft' },
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
              Über mich
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Leidenschaft für digitale Lösungen
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
              Hallo, ich bin Oscar
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Als Full-Stack Developer und iOS Experte bringe ich Ihre digitalen Ideen zum Leben.
              Mit über 5 Jahren Erfahrung in der Softwareentwicklung habe ich ein breites Spektrum
              an Projekten erfolgreich umgesetzt – von komplexen Websystemen bis zu intuitiven
              mobilen Anwendungen.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Meine Expertise liegt nicht nur in der technischen Umsetzung, sondern auch im
              Verständnis für Geschäftsprozesse und Nutzeranforderungen. Ich glaube daran,
              dass großartige Software entsteht, wenn Technologie und User Experience
              perfekt harmonieren.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Ob Start-up oder etabliertes Unternehmen – ich unterstütze Sie dabei, Ihre
              Vision in eine funktionale, skalierbare und benutzerfreundliche Lösung zu
              verwandeln.
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