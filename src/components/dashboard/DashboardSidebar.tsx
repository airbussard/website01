'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Code2,
  Activity,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  managerOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projekte', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Aufgaben', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Rechnungen', href: '/dashboard/invoices', icon: FileText },
  { name: 'Aktivität', href: '/dashboard/activity', icon: Activity, managerOnly: true },
];

const adminItems: NavItem[] = [
  { name: 'Nutzerverwaltung', href: '/dashboard/admin/users', icon: Users, adminOnly: true },
  { name: 'Einstellungen', href: '/dashboard/admin/settings', icon: Settings, adminOnly: true },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { isAdmin, isManagerOrAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.managerOnly && !isManagerOrAdmin) return false;
    return true;
  });

  const filteredAdminItems = adminItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-40"
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            <Code2 className="h-8 w-8 text-primary-600" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary-500 rounded-full animate-pulse" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  getemergence.com
                </span>
                <span className="text-xs text-gray-500">Kundenportal</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Admin Section */}
        {filteredAdminItems.length > 0 && (
          <>
            <div className="my-4 px-3">
              <AnimatePresence mode="wait">
                {!collapsed ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Administration</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-px bg-gray-200"
                  />
                )}
              </AnimatePresence>
            </div>
            <ul className="space-y-1">
              {filteredAdminItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                        active
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="ml-3 font-medium"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-2 text-sm font-medium">Einklappen</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
