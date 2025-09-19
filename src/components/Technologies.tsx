'use client';

import { motion } from 'framer-motion';

const techCategories = [
  {
    name: 'Frontend',
    techs: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Redux'],
  },
  {
    name: 'Backend',
    techs: ['Node.js', 'Express', 'NestJS', 'GraphQL', 'REST APIs', 'WebSocket'],
  },
  {
    name: 'Mobile',
    techs: ['Swift', 'SwiftUI', 'UIKit', 'Core Data', 'CloudKit', 'Push Notifications'],
  },
  {
    name: 'Database',
    techs: ['PostgreSQL', 'MongoDB', 'Redis', 'Supabase', 'Prisma', 'Firebase'],
  },
  {
    name: 'DevOps',
    techs: ['Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'CapRover', 'Vercel'],
  },
  {
    name: 'Tools',
    techs: ['Git', 'VS Code', 'Xcode', 'Figma', 'Postman', 'Jira'],
  },
];

export default function Technologies() {
  return (
    <section id="tech" className="py-20 bg-gray-50 dark:bg-gray-900">
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
              Technologie-Stack
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Die richtigen Werkzeuge für jedes Projekt
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {techCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold mb-4 text-primary-600 dark:text-primary-400">
                {category.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.techs.map((tech, techIndex) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: categoryIndex * 0.1 + techIndex * 0.05,
                    }}
                    viewport={{ once: true }}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-400 transition-colors cursor-default"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400">
            ... und viele weitere Technologien, je nach Projektanforderung.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Wir bleiben stets auf dem neuesten Stand der Technologie.
          </p>
        </motion.div>
      </div>
    </section>
  );
}