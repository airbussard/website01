'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Code2, Smartphone, Database, Lightbulb } from 'lucide-react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { getFeaturedProjects } from '@/lib/data/projects';

const services = [
  {
    icon: Code2,
    title: 'Web Development',
    description: 'Moderne Webanwendungen mit aktuellen Technologien',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Native iOS und Android Apps für Ihr Business',
  },
  {
    icon: Database,
    title: 'System Architecture',
    description: 'Skalierbare und sichere IT-Infrastrukturen',
  },
  {
    icon: Lightbulb,
    title: 'IT Consulting',
    description: 'Strategische Beratung für digitale Transformation',
  },
];

export default function Home() {
  const featuredProjects = getFeaturedProjects().slice(0, 3);

  return (
    <>
      <Header />
      <main>
        <Hero />

        {/* Services Teaser */}
        <section className="py-20 bg-white dark:bg-gray-800">
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
                  Unsere Services
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
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
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {service.description}
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
                className="inline-flex items-center text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Alle Services ansehen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
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
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Einblicke in unsere erfolgreichen Projekte
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="h-48 bg-gradient-to-br from-primary-500 to-secondary-500" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/project/${project.id}`}
                      className="inline-flex items-center text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                    >
                      Mehr erfahren
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
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
                href="/referenzen"
                className="inline-flex items-center text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Alle Projekte ansehen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-8 md:p-12 text-center text-white"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Bereit für Ihr nächstes Projekt?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Lassen Sie uns gemeinsam Ihre digitalen Visionen verwirklichen
              </p>
              <Link
                href="/kontakt"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
              >
                Jetzt Kontakt aufnehmen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}