'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { projects as allProjects } from '@/lib/data/projects';
import { Globe, Github, Filter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const categories = [
  { id: 'all', label: 'Alle Projekte' },
  { id: 'web', label: 'Web Development' },
  { id: 'mobile', label: 'Mobile Apps' },
  { id: 'system', label: 'System Architecture' }
];

export default function ReferenzenPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProjects = allProjects.filter(project =>
    selectedCategory === 'all' || project.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Unsere Referenzen
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Entdecken Sie eine Auswahl unserer erfolgreich umgesetzten Projekte und überzeugen Sie sich von unserer Expertise
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {category.label}
              {selectedCategory === category.id && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {filteredProjects.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Keine Projekte in dieser Kategorie vorhanden.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {

              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 relative overflow-hidden">
                    {project.imageUrl ? (
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-primary-600/20 dark:text-primary-400/20">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                        {project.category === 'web' && 'Web'}
                        {project.category === 'mobile' && 'Mobile'}
                        {project.category === 'system' && 'System'}
                      </span>
                    </div>

                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-yellow-500 text-yellow-900 text-xs rounded-full font-semibold">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                            +{project.technologies.length - 3} mehr
                          </span>
                        )}
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex items-center space-x-4">
                      {project.liveUrl && (
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(project.liveUrl!, '_blank');
                          }}
                          className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <Globe className="h-5 w-5" />
                        </span>
                      )}
                      {project.githubUrl && (
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(project.githubUrl!, '_blank');
                          }}
                          className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <Github className="h-5 w-5" />
                        </span>
                      )}
                      <span className="text-primary-600 dark:text-primary-400 text-sm font-medium ml-auto">
                        Details ansehen →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Statistics Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {allProjects.length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Projekte
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {allProjects.filter(p => p.category === 'web').length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Webanwendungen
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {allProjects.filter(p => p.category === 'mobile').length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Mobile Apps
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              100%
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Zufriedenheit
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ihr Projekt könnte das nächste sein
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Lassen Sie uns gemeinsam etwas Großartiges erschaffen
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Projekt starten
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}