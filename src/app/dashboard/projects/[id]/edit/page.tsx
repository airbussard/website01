'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  FolderKanban,
  AlertCircle,
  Calendar,
  Euro,
  User,
  Trash2,
  Building2,
  Rocket,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Select from '@/components/ui/Select';
import type { ProjectStatus, Priority, Profile, PMProject, Organization } from '@/types/dashboard';

interface OrganizationWithRole extends Organization {
  user_role: string;
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: 'Planung' },
  { value: 'active', label: 'Aktiv' },
  { value: 'on_hold', label: 'Pausiert' },
  { value: 'completed', label: 'Abgeschlossen' },
  { value: 'cancelled', label: 'Abgebrochen' },
];

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Niedrig' },
  { value: 'medium', label: 'Mittel' },
  { value: 'high', label: 'Hoch' },
  { value: 'critical', label: 'Kritisch' },
];

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { user, isManagerOrAdmin, isAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [project, setProject] = useState<PMProject | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [priority, setPriority] = useState<Priority>('medium');
  const [clientId, setClientId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [budget, setBudget] = useState('');
  const [buildTriggerUrl, setBuildTriggerUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user || authLoading) return;

      try {
        // Fetch project
        const { data: projectData, error: projectError } = await supabase
          .from('pm_projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;
        if (!projectData) throw new Error('Projekt nicht gefunden');

        setProject(projectData);

        // Initialize form with project data
        setName(projectData.name || '');
        setDescription(projectData.description || '');
        setStatus(projectData.status || 'planning');
        setPriority(projectData.priority || 'medium');
        setClientId(projectData.client_id || '');
        setManagerId(projectData.manager_id || '');
        setOrganizationId(projectData.organization_id || '');
        setStartDate(projectData.start_date?.split('T')[0] || '');
        setDueDate(projectData.due_date?.split('T')[0] || '');
        setBudget(projectData.budget?.toString() || '');
        setBuildTriggerUrl((projectData.settings as Record<string, string>)?.build_trigger_url || '');

        // Fetch users for dropdowns
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .order('full_name');

        if (usersData) setUsers(usersData);

        // Fetch organizations
        try {
          const res = await fetch('/api/organizations');
          const data = await res.json();
          if (res.ok) {
            setOrganizations(data.organizations || []);
          }
        } catch (err) {
          console.error('Error fetching organizations:', err);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Fehler beim Laden des Projekts');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, projectId, supabase]);

  useEffect(() => {
    if (!authLoading && !isManagerOrAdmin) {
      router.push(`/dashboard/projects/${projectId}`);
    }
  }, [authLoading, isManagerOrAdmin, router, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const projectData = {
        name: name.trim(),
        description: description.trim() || null,
        status,
        priority,
        client_id: clientId || null,
        manager_id: managerId || null,
        organization_id: organizationId || null,
        start_date: startDate || null,
        due_date: dueDate || null,
        budget: budget ? parseFloat(budget) : null,
        settings: {
          ...(project?.settings || {}),
          build_trigger_url: buildTriggerUrl.trim() || null,
        },
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('pm_projects')
        .update(projectData)
        .eq('id', projectId);

      if (updateError) throw updateError;

      router.push(`/dashboard/projects/${projectId}`);
    } catch (err: unknown) {
      console.error('Error updating project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Speichern des Projekts';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !isAdmin || !confirm('Projekt wirklich löschen? Alle zugehörigen Aufgaben und Dateien werden ebenfalls gelöscht.')) return;

    try {
      const { error } = await supabase.from('pm_projects').delete().eq('id', project.id);
      if (error) throw error;
      router.push('/dashboard/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Fehler beim Löschen des Projekts');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isManagerOrAdmin) {
    return null;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Projekt nicht gefunden</h2>
        <p className="text-gray-500 mb-4">Das angeforderte Projekt existiert nicht.</p>
        <Link href="/dashboard/projects" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu Projekten
        </Link>
      </div>
    );
  }

  // Filter users by role for different dropdowns
  const clients = users.filter(u => u.role === 'user');
  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link href="/dashboard/projects" className="text-gray-500 hover:text-primary-600 transition-colors">
          Projekte
        </Link>
        <span className="text-gray-400">/</span>
        <Link href={`/dashboard/projects/${projectId}`} className="text-gray-500 hover:text-primary-600 transition-colors">
          {project.name}
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Bearbeiten</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projekt bearbeiten</h1>
          <p className="text-gray-600">Aktualisieren Sie die Projektdetails</p>
        </div>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Link>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Projektname *
            </label>
            <div className="relative">
              <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="z.B. Website Redesign"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Beschreibung
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              placeholder="Beschreiben Sie das Projekt..."
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={status}
                onChange={(val) => setStatus(val as ProjectStatus)}
                options={statusOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioritaet
              </label>
              <Select
                value={priority}
                onChange={(val) => setPriority(val as Priority)}
                options={priorityOptions}
              />
            </div>
          </div>

          {/* Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organisation / Firma
            </label>
            <Select
              value={organizationId}
              onChange={setOrganizationId}
              options={[
                { value: '', label: 'Keine Organisation' },
                ...organizations.map((org) => ({ value: org.id, label: org.name })),
              ]}
              icon={<Building2 className="h-5 w-5" />}
            />
            <p className="mt-1 text-xs text-gray-500">
              Alle Mitglieder der Organisation haben Zugriff auf dieses Projekt.
            </p>
          </div>

          {/* Client & Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kunde
              </label>
              <Select
                value={clientId}
                onChange={setClientId}
                options={[
                  { value: '', label: 'Kein Kunde' },
                  ...clients.map((u) => ({ value: u.id, label: u.full_name || u.email })),
                ]}
                icon={<User className="h-5 w-5" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projektmanager
              </label>
              <Select
                value={managerId}
                onChange={setManagerId}
                options={[
                  { value: '', label: 'Kein Manager' },
                  ...managers.map((u) => ({ value: u.id, label: u.full_name || u.email })),
                ]}
                icon={<User className="h-5 w-5" />}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Startdatum
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
              Budget (EUR)
            </label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Build Trigger */}
          <div>
            <label htmlFor="buildTrigger" className="block text-sm font-medium text-gray-700 mb-2">
              Build-Trigger URL (CapRover)
            </label>
            <div className="relative">
              <Rocket className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="buildTrigger"
                type="url"
                value={buildTriggerUrl}
                onChange={(e) => setBuildTriggerUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="https://captain.example.com/api/v2/user/apps/webhooks/triggerbuild?..."
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Webhook-URL zum Ausloesen eines neuen Builds. Alle Projektmitglieder koennen den Build triggern.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Änderungen speichern
                </>
              )}
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center justify-center px-6 py-3 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Löschen
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
