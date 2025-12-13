'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Code2, LayoutDashboard, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Start', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Technologien', href: '/technologien' },
  { name: 'Projekte', href: '/projekte' },
  { name: 'Über uns', href: '/ueber-uns' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Code2 className="h-8 w-8 text-primary-600" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary-500 rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                getemergence.com
              </span>
              <span className="text-xs text-gray-500 -mt-1">
                Digital Solutions
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {!loading && user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 mr-1.5" />
                Dashboard
              </Link>
            ) : !loading ? (
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                <LogIn className="h-4 w-4 mr-1.5" />
                Login
              </Link>
            ) : null}
            <Link
              href="/kontakt"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Kontakt
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 pb-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4"
            >
              <div className="flex flex-col space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavClick}
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-left py-2"
                  >
                    {item.name}
                  </Link>
                ))}
                {!loading && user ? (
                  <Link
                    href="/dashboard"
                    onClick={handleNavClick}
                    className="flex items-center text-primary-600 font-medium py-2"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                ) : !loading ? (
                  <Link
                    href="/auth/login"
                    onClick={handleNavClick}
                    className="flex items-center text-gray-700 hover:text-primary-600 font-medium py-2"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                ) : null}
                <Link
                  href="/kontakt"
                  onClick={handleNavClick}
                  className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center"
                >
                  Kontakt
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}