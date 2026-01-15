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
  Link2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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

interface LexofficeSettings {
  is_enabled: boolean;
  api_key_set: boolean;
  api_key_masked: string | null;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Lexoffice Settings State
  const [lexofficeSettings, setLexofficeSettings] = useState<LexofficeSettings | null>(null);
  const [lexofficeApiKey, setLexofficeApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [lexofficeSaving, setLexofficeSaving] = useState(false);
  const [lexofficeTesting, setLexofficeTesting] = useState(false);
  const [lexofficeTestResult, setLexofficeTestResult] = useState<'success' | 'error' | null>(null);
  const [lexofficeSaveError, setLexofficeSaveError] = useState<string | null>(null);
  const [lexofficeSaveSuccess, setLexofficeSaveSuccess] = useState(false);

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

        // Fetch Lexoffice settings
        const lexRes = await fetch('/api/admin/lexoffice-settings');
        if (lexRes.ok) {
          const lexData = await lexRes.json();
          setLexofficeSettings(lexData.settings);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [authLoading, isAdmin, router, supabase]);

  // Lexoffice Settings Functions
  const handleLexofficeSave = async () => {
    setLexofficeSaving(true);
    setLexofficeTestResult(null);
    setLexofficeSaveError(null);
    setLexofficeSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/lexoffice-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_enabled: lexofficeSettings?.is_enabled ?? false,
          ...(lexofficeApiKey && { api_key: lexofficeApiKey }),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setLexofficeSettings(data.settings);
        setLexofficeApiKey('');
        setLexofficeSaveSuccess(true);
        setTimeout(() => setLexofficeSaveSuccess(false), 3000);
      } else {
        setLexofficeSaveError(data.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving Lexoffice settings:', error);
      setLexofficeSaveError('Netzwerkfehler - bitte erneut versuchen');
    } finally {
      setLexofficeSaving(false);
    }
  };

  const handleLexofficeToggle = async () => {
    const newEnabled = !lexofficeSettings?.is_enabled;
    setLexofficeSettings(prev => prev ? { ...prev, is_enabled: newEnabled } : null);

    try {
      const res = await fetch('/api/admin/lexoffice-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: newEnabled }),
      });

      if (res.ok) {
        const data = await res.json();
        setLexofficeSettings(data.settings);
      }
    } catch (error) {
      console.error('Error toggling Lexoffice:', error);
      setLexofficeSettings(prev => prev ? { ...prev, is_enabled: !newEnabled } : null);
    }
  };

  const handleLexofficeTest = async () => {
    setLexofficeTesting(true);
    setLexofficeTestResult(null);
    try {
      const res = await fetch('/api/admin/lexoffice-settings', {
        method: 'POST',
      });
      const data = await res.json();
      setLexofficeTestResult(data.success ? 'success' : 'error');
    } catch (error) {
      setLexofficeTestResult('error');
    } finally {
      setLexofficeTesting(false);
    }
  };

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

      {/* Lexoffice Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Link2 className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Lexoffice Integration</h2>
        </div>

        <div className="space-y-6">
          {/* Aktivierung Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Lexoffice aktivieren</p>
              <p className="text-sm text-gray-500">
                Rechnungen und Angebote mit Lexoffice synchronisieren
              </p>
            </div>
            <button
              onClick={handleLexofficeToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                lexofficeSettings?.is_enabled ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  lexofficeSettings?.is_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* API Key Eingabe */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex space-x-3">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={lexofficeApiKey}
                  onChange={(e) => setLexofficeApiKey(e.target.value)}
                  placeholder={lexofficeSettings?.api_key_masked || 'API Key eingeben...'}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={handleLexofficeSave}
                disabled={lexofficeSaving || !lexofficeApiKey}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {lexofficeSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Speichern</span>
                )}
              </button>
            </div>
            {lexofficeSettings?.api_key_set && (
              <p className="mt-2 text-sm text-gray-500">
                Aktueller Key: {lexofficeSettings.api_key_masked}
              </p>
            )}
            {lexofficeSaveError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center text-sm text-red-700">
                <XCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {lexofficeSaveError}
              </div>
            )}
            {lexofficeSaveSuccess && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center text-sm text-green-700">
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                API Key erfolgreich gespeichert
              </div>
            )}
          </div>

          {/* Verbindungstest */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Verbindung testen</p>
                <p className="text-sm text-gray-500">
                  Pruefen Sie, ob die API-Verbindung funktioniert
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {lexofficeTestResult === 'success' && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Verbunden</span>
                  </div>
                )}
                {lexofficeTestResult === 'error' && (
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Fehler</span>
                  </div>
                )}
                <button
                  onClick={handleLexofficeTest}
                  disabled={lexofficeTesting || !lexofficeSettings?.api_key_set}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {lexofficeTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span>Testen</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status Info */}
          {!lexofficeSettings?.api_key_set && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">API Key nicht konfiguriert</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Geben Sie Ihren Lexoffice API Key ein, um die Integration zu nutzen.
                    Den Key finden Sie unter{' '}
                    <a
                      href="https://app.lexware.de/addons/public-api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      app.lexware.de/addons/public-api
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Default Values */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
