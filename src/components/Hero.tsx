'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Linkedin, Mail, MapPin, User, FileCheck } from 'lucide-react';
import Link from 'next/link';

const trustBadges = [
  { icon: MapPin, text: 'Made in Germany' },
  { icon: User, text: 'Persoenlicher Ansprechpartner' },
  { icon: FileCheck, text: 'Festpreis-Garantie' },
];

export default function Hero() {
  const scrollToProjects = () => {
    const element = document.querySelector('#projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Ihre Website.
              </span>
              <br />
              <span className="text-gray-800">
                Ihr Wettbewerbsvorteil.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Individuelle Digitalloesungen fuer Ihr Unternehmen -
            <span className="text-primary-600 font-medium"> schnell umgesetzt</span>,
            <span className="text-primary-600 font-medium"> fair bepreist</span> und mit
            <span className="text-primary-600 font-medium"> dauerhafter Betreuung</span>.
          </motion.p>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8"
          >
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm"
                >
                  <Icon className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium">{badge.text}</span>
                </div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link
              href="/kontakt"
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Kostenloses Erstgespraech
            </Link>
            <button
              onClick={scrollToProjects}
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              Projekte ansehen
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center space-x-6"
          >
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Linkedin className="h-6 w-6" />
            </Link>
            <Link
              href="mailto:hello@getemergence.com"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Mail className="h-6 w-6" />
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <button
            onClick={scrollToProjects}
            className="animate-bounce text-gray-400 hover:text-primary-600 transition-colors"
          >
            <ArrowDown className="h-8 w-8" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}