'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Code, ArrowRight } from 'lucide-react';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="relative h-48 bg-gray-100 border-b-2 border-primary-500 flex items-center justify-center overflow-hidden">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <Code className="h-20 w-20 text-primary-500 opacity-20" />
        )}
        {/* Price Tag */}
        {project.price && (
          <div className="absolute top-3 right-3 bg-green-500 text-white rounded-lg px-3 py-1.5 font-semibold text-sm shadow-lg">
            ab {project.price.toLocaleString('de-DE')} €
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900">
          {project.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {tech}
            </span>
          ))}
        </div>
        <Link
          href={`/project/${project.id}`}
          className="inline-flex items-center text-primary-600 font-semibold hover:underline"
        >
          Mehr erfahren
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}
