'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Code2, Smartphone, Database, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    id: 'web-development',
    icon: Code2,
    title: 'Web Development',
    shortDescription: 'Moderne Webanwendungen mit aktuellen Technologien',
    description: 'Entwicklung von skalierbaren, performanten Webanwendungen mit modernsten Technologien. Von der einfachen Landing Page bis zur komplexen Enterprise-Anwendung.',
    features: [
      'Single Page Applications (SPA)',
      'Progressive Web Apps (PWA)',
      'E-Commerce Lösungen',
      'Content Management Systeme',
      'API Entwicklung',
      'Cloud-native Anwendungen'
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    benefits: [
      'Schnelle Ladezeiten durch optimierte Performance',
      'Responsive Design für alle Geräte',
      'SEO-optimiert für beste Sichtbarkeit',
      'Barrierefreie Entwicklung nach WCAG Standards'
    ]
  },
  {
    id: 'mobile-development',
    icon: Smartphone,
    title: 'Mobile App Development',
    shortDescription: 'Native iOS und Android Apps für Ihr Business',
    description: 'Entwicklung nativer Apps für iOS und Android mit optimaler User Experience. Von der Konzeption bis zur Veröffentlichung im App Store.',
    features: [
      'Native iOS Apps mit Swift/SwiftUI',
      'Android Apps mit Kotlin',
      'Cross-Platform mit React Native',
      'App Store Optimierung',
      'Push Notifications',
      'In-App Purchases'
    ],
    technologies: ['Swift', 'SwiftUI', 'Kotlin', 'React Native', 'Firebase', 'CoreData'],
    benefits: [
      'Native Performance und Geschwindigkeit',
      'Zugriff auf alle Gerätefunktionen',
      'Offline-Fähigkeit',
      'Optimale User Experience'
    ]
  },
  {
    id: 'system-architecture',
    icon: Database,
    title: 'System Architecture',
    shortDescription: 'Skalierbare und sichere IT-Infrastrukturen',
    description: 'Design und Implementierung von robusten, skalierbaren Systemarchitekturen. Von Microservices bis zu Cloud-Migrationen.',
    features: [
      'Microservices Architektur',
      'Cloud Migration (AWS, Azure, GCP)',
      'Container Orchestrierung',
      'CI/CD Pipelines',
      'Monitoring & Logging',
      'Sicherheitskonzepte'
    ],
    technologies: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins', 'Prometheus'],
    benefits: [
      'Hohe Verfügbarkeit und Ausfallsicherheit',
      'Automatisierte Deployments',
      'Kostenoptimierte Infrastruktur',
      'Skalierbarkeit nach Bedarf'
    ]
  },
  {
    id: 'consulting',
    icon: Lightbulb,
    title: 'IT Consulting',
    shortDescription: 'Strategische Beratung für digitale Transformation',
    description: 'Kompetente Beratung bei der digitalen Transformation Ihres Unternehmens. Von der Analyse bis zur Umsetzung.',
    features: [
      'Technologie-Evaluierung',
      'Digitalisierungsstrategie',
      'Prozessoptimierung',
      'Team Training & Workshops',
      'Code Reviews',
      'Performance Audits'
    ],
    technologies: ['Best Practices', 'Agile', 'Scrum', 'DevOps', 'Lean', 'Design Thinking'],
    benefits: [
      'Unabhängige Technologieberatung',
      'Erfahrung aus diversen Projekten',
      'Wissenstransfer an Ihr Team',
      'Langfristige Partnerschaft'
    ]
  }
];

export default function ServicesPage() {
  const [expandedService, setExpandedService] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Unsere Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Von der Idee bis zur fertigen Lösung - wir begleiten Sie auf dem Weg zur digitalen Transformation
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-8 mb-16">
          {services.map((service) => {
            const Icon = service.icon;
            const isExpanded = expandedService === service.id;

            return (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300"
              >
                <div
                  className="p-8 cursor-pointer"
                  onClick={() => setExpandedService(isExpanded ? null : service.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-primary-100 rounded-lg">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {service.title}
                        </h2>
                        <p className="text-gray-600">
                          {service.shortDescription}
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-primary-600 transition-transform transform">
                      <ArrowRight className={`h-6 w-6 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-8 pb-8 border-t border-gray-100 animate-fadeIn">
                    <div className="pt-6">
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Features */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Leistungen
                          </h3>
                          <ul className="space-y-2">
                            {service.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-600 text-sm">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Benefits */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Ihre Vorteile
                          </h3>
                          <ul className="space-y-2">
                            {service.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-600 text-sm">
                                  {benefit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Technologies */}
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Technologien
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {service.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
                  <Code2 className="h-10 w-10 text-primary-600" />
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
                  <Smartphone className="h-8 w-8 text-primary-600" />
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
                  <Database className="h-7 w-7 text-primary-600" />
                </div>
              </motion.div>

              <div className="w-32 h-32 border-2 border-primary-500 rounded-3xl flex items-center justify-center">
                <Lightbulb className="h-16 w-16 text-primary-600" />
              </div>
            </div>

            {/* Right: Content */}
            <div className="flex flex-col justify-center text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Bereit für Ihr nächstes Projekt?
              </h2>
              <p className="text-xl mb-8 text-gray-600">
                Lassen Sie uns gemeinsam Ihre Ideen verwirklichen
              </p>
              <div>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 hover:scale-105 hover:shadow-xl transition-all duration-300 text-lg"
                >
                  Kontakt aufnehmen
                  <ArrowRight className="ml-2 h-5 w-5" />
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