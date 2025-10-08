'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { projects as allProjects } from '@/lib/data/projects';
import { Filter, Code2, Smartphone, Database, Lightbulb } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Unsere Referenzen
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                  : 'bg-white text-gray-700 hover:bg-gray-100'
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
            <p className="text-gray-500">
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
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {allProjects.length}
            </div>
            <div className="text-gray-600">
              Projekte
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {allProjects.filter(p => p.category === 'web').length}
            </div>
            <div className="text-gray-600">
              Webanwendungen
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {allProjects.filter(p => p.category === 'mobile').length}
            </div>
            <div className="text-gray-600">
              Mobile Apps
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              100%
            </div>
            <div className="text-gray-600">
              Zufriedenheit
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 relative bg-white rounded-2xl border-2 border-primary-500 overflow-hidden"
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
                Ihr Projekt könnte das nächste sein
              </h2>
              <p className="text-xl mb-8 text-gray-600">
                Lassen Sie uns gemeinsam etwas Großartiges erschaffen
              </p>
              <div>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 hover:scale-105 hover:shadow-xl transition-all duration-300 text-lg"
                >
                  Projekt starten
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