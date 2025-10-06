'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { projects as allProjects } from '@/lib/data/projects';
import { Filter } from 'lucide-react';
import Link from 'next/link';

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
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
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