'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Settings,
  Server,
  Database,
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  Activity,
  Loader2,
  Info,
  Sliders,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

interface SystemStats {
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalInvoices: number;
  paidInvoices: number;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (authLoading) return;
      if (!isAdmin) {
        router.push('/dashboard');
        return;
      }

      try {
        // Fetch all statistics in parallel
        const [
          usersResult,
          projectsResult,
          activeProjectsResult,
          tasksResult,
          completedTasksResult,
          invoicesResult,
          paidInvoicesResult,
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('pm_projects').select('*', { count: 'exact', head: true }),
          supabase.from('pm_projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('tasks').select('*', { count: 'exact', head: true }),
          supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done'),
          supabase.from('invoices').select('*', { count: 'exact', head: true }),
          supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
        ]);

        setStats({
          totalUsers: usersResult.count || 0,
          totalProjects: projectsResult.count || 0,
          activeProjects: activeProjectsResult.count || 0,
          totalTasks: tasksResult.count || 0,
          completedTasks: completedTasksResult.count || 0,
          totalInvoices: invoicesResult.count || 0,
          paidInvoices: paidInvoicesResult.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [authLoading, isAdmin, router, supabase]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    {
      label: 'Benutzer',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Projekte gesamt',
      value: stats?.totalProjects || 0,
      subValue: `${stats?.activeProjects || 0} aktiv`,
      icon: FolderKanban,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Aufgaben',
      value: stats?.totalTasks || 0,
      subValue: `${stats?.completedTasks || 0} erledigt`,
      icon: CheckSquare,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Rechnungen',
      value: stats?.totalInvoices || 0,
      subValue: `${stats?.paidInvoices || 0} bezahlt`,
      icon: FileText,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const defaultSettings = [
    {
      label: 'Standard-Projektstatus',
      value: 'Planung',
      description: 'Status für neue Projekte',
    },
    {
      label: 'Standard-Projektpriorität',
      value: 'Mittel',
      description: 'Priorität für neue Projekte',
    },
    {
      label: 'Standard-Aufgabenstatus',
      value: 'Zu erledigen',
      description: 'Status für neue Aufgaben',
    },
    {
      label: 'Standard-Aufgabenpriorität',
      value: 'Mittel',
      description: 'Priorität für neue Aufgaben',
    },
    {
      label: 'Standard-MwSt.-Satz',
      value: '19%',
      description: 'MwSt.-Satz für neue Rechnungen',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin-Einstellungen</h1>
        <p className="text-gray-600">
          System-Informationen und Standardwerte verwalten
        </p>
      </div>

      {/* System Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Server className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">System-Informationen</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              <Info className="h-4 w-4" />
              <span>Version</span>
            </div>
            <p className="font-semibold text-gray-900">1.0.0</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              <Database className="h-4 w-4" />
              <span>Datenbank</span>
            </div>
            <p className="font-semibold text-gray-900">Supabase PostgreSQL</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              <Activity className="h-4 w-4" />
              <span>Umgebung</span>
            </div>
            <p className="font-semibold text-gray-900">
              {process.env.NODE_ENV === 'production' ? 'Produktion' : 'Entwicklung'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              <Server className="h-4 w-4" />
              <span>Framework</span>
            </div>
            <p className="font-semibold text-gray-900">Next.js 15</p>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Activity className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Statistiken</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className={`p-2 ${stat.color} rounded-lg w-fit mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
                {stat.subValue && (
                  <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Default Values */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Sliders className="h-5 w-5 text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Standard-Werte</h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Diese Standardwerte werden beim Erstellen neuer Elemente verwendet.
        </p>

        <div className="space-y-3">
          {defaultSettings.map((setting, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{setting.label}</p>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
              <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                {setting.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-700">
            <Info className="h-4 w-4 inline mr-2" />
            Die Standardwerte sind aktuell fest definiert. Eine editierbare Version ist in Planung.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
