'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Star, TrendingUp, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const techCategories = [
  {
    name: 'Frontend',
    techs: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Redux'],
    expertise: 'Expert',
    icon: '🎨',
  },
  {
    name: 'Backend',
    techs: ['Node.js', 'Express', 'NestJS', 'GraphQL', 'REST APIs', 'WebSocket'],
    expertise: 'Expert',
    icon: '⚙️',
  },
  {
    name: 'Mobile',
    techs: ['Swift', 'SwiftUI', 'UIKit', 'Core Data', 'CloudKit', 'Push Notifications'],
    expertise: 'Expert',
    icon: '📱',
  },
  {
    name: 'Database',
    techs: ['PostgreSQL', 'MongoDB', 'Redis', 'Supabase', 'Prisma', 'Firebase'],
    expertise: 'Advanced',
    icon: '🗄️',
  },
  {
    name: 'DevOps',
    techs: ['Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'CapRover', 'Vercel'],
    expertise: 'Advanced',
    icon: '🚀',
  },
  {
    name: 'Tools',
    techs: ['Git', 'VS Code', 'Xcode', 'Figma', 'Postman', 'Jira'],
    expertise: 'Expert',
    icon: '🛠️',
  },
];

const techPhilosophy = [
  {
    icon: Star,
    title: 'Best Practices',
    description: 'Wir setzen auf bewährte Patterns und Architekturen, die sich in der Praxis tausendfach bewährt haben.',
  },
  {
    icon: TrendingUp,
    title: 'Zukunftssicher',
    description: 'Wir wählen Technologien mit langfristiger Perspektive und aktiver Community-Unterstützung.',
  },
  {
    icon: Shield,
    title: 'Sicherheit',
    description: 'Security by Design - Sicherheit ist bei uns kein Nachgedanke, sondern integraler Bestandteil.',
  },
];

const techDetails = [
  {
    category: 'Web Development',
    description: 'Moderne Webanwendungen mit React, Next.js und TypeScript. Server-Side Rendering, Static Site Generation und API Routes für maximale Performance und SEO.',
    techs: ['React 18+', 'Next.js 15', 'TypeScript 5', 'Tailwind CSS', 'Framer Motion', 'React Query'],
    useCases: ['E-Commerce Plattformen', 'SaaS Anwendungen', 'Corporate Websites', 'Admin Dashboards'],
  },
  {
    category: 'Mobile Development',
    description: 'Native iOS Apps mit Swift und SwiftUI. Voller Zugriff auf alle Apple Frameworks und optimale Performance durch native Entwicklung.',
    techs: ['Swift 5+', 'SwiftUI', 'UIKit', 'Combine', 'Core Data', 'HealthKit', 'ARKit'],
    useCases: ['Consumer Apps', 'Enterprise Apps', 'Health & Fitness', 'E-Commerce Apps'],
  },
  {
    category: 'Backend & APIs',
    description: 'Skalierbare Backend-Systeme mit Node.js und modernen API-Designs. REST, GraphQL und WebSocket für alle Anforderungen.',
    techs: ['Node.js', 'Express', 'NestJS', 'GraphQL', 'Prisma', 'JWT Auth'],
    useCases: ['REST APIs', 'GraphQL APIs', 'Microservices', 'Real-time Apps'],
  },
  {
    category: 'DevOps & Deployment',
    description: 'Container-basierte Deployments mit automatisierten CI/CD Pipelines. Von Docker bis Kubernetes - wir bringen Ihre App sicher in Production.',
    techs: ['Docker', 'Kubernetes', 'GitHub Actions', 'CapRover', 'AWS', 'Vercel'],
    useCases: ['Automated Deployments', 'Staging Environments', 'Load Balancing', 'Auto-Scaling'],
  },
];

export default function TechPage() {
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
              Technologie-Stack
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Die richtigen Werkzeuge für jedes Projekt - bewährt, modern und zukunftssicher
          </p>
        </motion.div>

        {/* Tech Categories */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Unsere Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <span className="text-3xl mr-3">{category.icon}</span>
                    {category.name}
                  </h3>
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-semibold">
                    {category.expertise}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.techs.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-400 transition-colors cursor-default"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech Philosophy */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Unsere Technologie-Philosophie
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techPhilosophy.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center"
                >
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detailed Tech Stack */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Technologie im Detail
          </h2>
          <div className="space-y-8">
            {techDetails.map((detail, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {detail.category}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {detail.description}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                      Technologien
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {detail.techs.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                      Anwendungsfälle
                    </h4>
                    <ul className="space-y-2">
                      {detail.useCases.map((useCase, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm">
                            {useCase}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 mb-12 text-center"
        >
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
            ... und viele weitere Technologien, je nach Projektanforderung.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Wir bleiben stets auf dem neuesten Stand der Technologie und erweitern kontinuierlich unser Know-how.
          </p>
        </motion.div>

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
                  <Star className="h-10 w-10 text-white" />
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
                  <TrendingUp className="h-8 w-8 text-white" />
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
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </motion.div>

              <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                <Shield className="h-16 w-16 text-white" />
              </div>
            </div>

            {/* Right: Content */}
            <div className="flex flex-col justify-center text-center md:text-left text-white">
              <h2 className="text-3xl font-bold mb-4">
                Bereit für moderne Technologie?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Lassen Sie uns gemeinsam die perfekte Tech-Stack für Ihr Projekt finden
              </p>
              <div>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 hover:scale-105 hover:shadow-2xl transition-all duration-300 text-lg"
                >
                  Jetzt beraten lassen
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
