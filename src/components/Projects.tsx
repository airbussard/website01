'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Smartphone, Globe, Code } from 'lucide-react';
import Image from 'next/image';
import { Project } from '@/types';

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'Moderne Shopping-Plattform mit React und Node.js',
    longDescription: 'Vollständige E-Commerce-Lösung mit Warenkorb, Zahlungsintegration und Admin-Dashboard',
    category: 'web',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Docker'],
    imageUrl: '/api/placeholder/600/400',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    featured: true,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'iOS Fitness Tracker',
    description: 'Native iOS App für Fitness-Tracking und Workouts',
    longDescription: 'Fitness-App mit HealthKit Integration, personalisierten Trainingsplänen und Social Features',
    category: 'mobile',
    technologies: ['Swift', 'SwiftUI', 'Core Data', 'HealthKit', 'CloudKit'],
    imageUrl: '/api/placeholder/600/400',
    liveUrl: 'https://apps.apple.com',
    featured: true,
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    title: 'CRM System',
    description: 'Kundenmanagement-System für mittelständische Unternehmen',
    longDescription: 'Umfassendes CRM mit Kontaktverwaltung, Pipeline-Management und Reporting',
    category: 'system',
    technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Redis'],
    imageUrl: '/api/placeholder/600/400',
    githubUrl: 'https://github.com',
    featured: false,
    createdAt: '2024-03-01',
  },
  {
    id: '4',
    title: 'Restaurant Booking App',
    description: 'iOS App für Tischreservierungen in Restaurants',
    category: 'mobile',
    technologies: ['Swift', 'Firebase', 'MapKit', 'Push Notifications'],
    imageUrl: '/api/placeholder/600/400',
    featured: false,
    createdAt: '2023-12-01',
  },
  {
    id: '5',
    title: 'Analytics Dashboard',
    description: 'Echtzeit-Analytics-Dashboard mit Datenvisualisierung',
    category: 'web',
    technologies: ['React', 'D3.js', 'WebSocket', 'Node.js', 'MongoDB'],
    imageUrl: '/api/placeholder/600/400',
    liveUrl: 'https://example.com',
    featured: false,
    createdAt: '2023-11-01',
  },
  {
    id: '6',
    title: 'API Gateway',
    description: 'Microservices API Gateway mit Rate Limiting und Auth',
    category: 'system',
    technologies: ['Go', 'Redis', 'Docker', 'Kubernetes', 'gRPC'],
    imageUrl: '/api/placeholder/600/400',
    githubUrl: 'https://github.com',
    featured: false,
    createdAt: '2023-10-01',
  },
];

const categories = [
  { id: 'all', name: 'Alle', icon: null },
  { id: 'web', name: 'Web', icon: Globe },
  { id: 'mobile', name: 'iOS Apps', icon: Smartphone },
  { id: 'system', name: 'Systeme', icon: Code },
];

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const filteredProjects = selectedCategory === 'all'
    ? mockProjects
    : mockProjects.filter(p => p.category === selectedCategory);

  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-900">
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
              Unsere Projekte
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Eine Auswahl unserer erfolgreichen Projekte
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800">
                {project.featured && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold z-10">
                    Featured
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  {project.category === 'mobile' ? (
                    <Smartphone className="h-20 w-20 text-primary-600/20" />
                  ) : project.category === 'system' ? (
                    <Code className="h-20 w-20 text-primary-600/20" />
                  ) : (
                    <Globe className="h-20 w-20 text-primary-600/20" />
                  )}
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>

                {/* Links */}
                <div className="flex items-center space-x-4">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}