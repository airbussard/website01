'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProjectById } from '@/lib/data/projects';
import Image from 'next/image';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const project = getProjectById(id);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Projekt nicht gefunden
          </h1>
          <Link
            href="/#projects"
            className="text-primary-600 hover:text-primary-700 flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zu Projekten
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link
            href="/#projects"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zu Projekten
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  {project.title}
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                {project.description}
              </p>

              {/* Project Image */}
              {project.imageUrl && (
                <div className="mb-12 relative aspect-video rounded-xl overflow-hidden">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                </div>
              )}

              {/* Long Description */}
              {project.longDescription && (
                <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    Projektdetails
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {project.longDescription}
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-24"
            >
              {/* Project Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  Projektinformationen
                </h3>

                {/* Category */}
                <div className="mb-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <Tag className="h-4 w-4 mr-2" />
                    <span className="text-sm">Kategorie</span>
                  </div>
                  <p className="font-medium text-gray-800 dark:text-white capitalize">
                    {project.category === 'mobile' ? 'iOS App' :
                     project.category === 'web' ? 'Web Application' :
                     'System'}
                  </p>
                </div>

                {/* Date */}
                {project.createdAt && (
                  <div className="mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">Fertigstellung</span>
                    </div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {new Date(project.createdAt).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-col space-y-3 mt-6">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Live ansehen
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* Technologies Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  Technologien
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}