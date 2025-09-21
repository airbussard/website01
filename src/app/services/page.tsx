'use client';

import { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Unsere Services
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
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
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300"
              >
                <div
                  className="p-8 cursor-pointer"
                  onClick={() => setExpandedService(isExpanded ? null : service.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {service.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                          {service.shortDescription}
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-transform transform">
                      <ArrowRight className={`h-6 w-6 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-8 pb-8 border-t border-gray-100 dark:border-gray-700 animate-fadeIn">
                    <div className="pt-6">
                      <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Features */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Leistungen
                          </h3>
                          <ul className="space-y-2">
                            {service.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-600 dark:text-gray-300 text-sm">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Benefits */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Ihre Vorteile
                          </h3>
                          <ul className="space-y-2">
                            {service.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-600 dark:text-gray-300 text-sm">
                                  {benefit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Technologies */}
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                          Technologien
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {service.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
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
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Bereit für Ihr nächstes Projekt?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Lassen Sie uns gemeinsam Ihre Ideen verwirklichen
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Kontakt aufnehmen
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}