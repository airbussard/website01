'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckSquare,
  FileText,
  Clock,
  Edit,
  MoreVertical,
  Plus,
  ExternalLink,
  Loader2,
  Building2,
  Rocket,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { PMProject, Task, ProgressUpdate, ProjectStatus, Priority } from '@/types/dashboard';

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-blue-100 text-blue-700 border-blue-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const statusLabels: Record<ProjectStatus, string> = {
  planning: 'Planung',
  active: 'Aktiv',
  on_hold: 'Pausiert',
  completed: 'Abgeschlossen',
  cancelled: 'Abgebrochen',
};

const priorityColors: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
};

const taskStatusColors: Record<string, string> = {
  backlog: 'bg-gray-100 text-gray-600',
  todo: 'bg-blue-100 text-blue-600',
  in_progress: 'bg-yellow-100 text-yellow-600',
  review: 'bg-purple-100 text-purple-600',
  done: 'bg-green-100 text-green-600',
};

// Rate Limiting fuer Re-Deploy
const BUILD_RATE_LIMIT = 2;
const BUILD_RATE_WINDOW = 60 * 60 * 1000; // 1 Stunde in ms
const getBuildTimestampsKey = (projectId: string) => `build_timestamps_${projectId}`;

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user, isManagerOrAdmin } = useAuth();

  const [project, setProject] = useState<PMProject | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'updates' | 'files'>('overview');
  const [triggering, setTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState<'success' | 'error' | null>(null);
  const [rateLimitReached, setRateLimitReached] = useState(false);
  const [nextBuildTime, setNextBuildTime] = useState<Date | null>(null);
  const [deletingUpdateId, setDeletingUpdateId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!user || !projectId) return;

      const supabase = createClient();

      try {
        // Fetch project
        const { data: projectData, error: projectError } = await supabase
          .from('pm_projects')
          .select(`
            *,
            client:profiles!pm_projects_client_id_fkey(id, full_name, email, avatar_url, company),
            manager:profiles!pm_projects_manager_id_fkey(id, full_name, email, avatar_url),
            organization:organizations(id, name, slug)
          `)
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;

        // Fetch tasks
        const { data: tasksData } = await supabase
          .from('tasks')
          .select(`
            *,
            assignee:profiles(id, full_name, avatar_url)
          `)
          .eq('project_id', projectId)
          .order('position', { ascending: true });

        // Fetch progress updates - Query aufbauen
        let updatesQuery = supabase
          .from('progress_updates')
          .select(`
            *,
            author:profiles(id, full_name, avatar_url)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        // Nur fuer normale User auf oeffentliche Updates filtern
        if (!isManagerOrAdmin) {
          updatesQuery = updatesQuery.eq('is_public', true);
        }

        const { data: updatesData } = await updatesQuery;

        setProject(projectData);
        setTasks(tasksData || []);
        setUpdates(updatesData || []);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [user, projectId, isManagerOrAdmin]);

  // Rate Limit pruefen - MUSS vor early returns sein (Rules of Hooks)
  const checkRateLimit = useCallback(() => {
    if (!project?.id) return;

    const key = getBuildTimestampsKey(project.id);
    const stored = localStorage.getItem(key);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];

    const now = Date.now();
    const windowStart = now - BUILD_RATE_WINDOW;
    const recentBuilds = timestamps.filter(t => t > windowStart);

    if (recentBuilds.length >= BUILD_RATE_LIMIT) {
      setRateLimitReached(true);
      const oldestInWindow = Math.min(...recentBuilds);
      setNextBuildTime(new Date(oldestInWindow + BUILD_RATE_WINDOW));
    } else {
      setRateLimitReached(false);
      setNextBuildTime(null);
    }
  }, [project?.id]);

  // Build-Timestamp speichern
  const recordBuild = useCallback(() => {
    if (!project?.id) return;

    const key = getBuildTimestampsKey(project.id);
    const stored = localStorage.getItem(key);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];

    const now = Date.now();
    const windowStart = now - BUILD_RATE_WINDOW;
    const recentBuilds = timestamps.filter(t => t > windowStart);
    recentBuilds.push(now);

    localStorage.setItem(key, JSON.stringify(recentBuilds));
    checkRateLimit();
  }, [project?.id, checkRateLimit]);

  // Rate Limit beim Laden pruefen
  useEffect(() => {
    checkRateLimit();
  }, [checkRateLimit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Projekt nicht gefunden</h2>
        <p className="text-gray-500 mb-4">Das angeforderte Projekt existiert nicht oder Sie haben keinen Zugriff.</p>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu Projekten
        </Link>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const tabs = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'tasks', label: `Aufgaben (${tasks.length})` },
    { id: 'updates', label: `Updates (${updates.length})` },
    { id: 'files', label: 'Dateien' },
  ] as const;

  const handleTriggerBuild = async () => {
    if (rateLimitReached) return;

    const buildUrl = (project?.settings as Record<string, string>)?.build_trigger_url;
    if (!buildUrl) return;

    setTriggering(true);
    setTriggerResult(null);

    try {
      const res = await fetch(buildUrl, { method: 'POST' });
      if (res.ok) {
        setTriggerResult('success');
        recordBuild();
      } else {
        setTriggerResult('error');
      }
    } catch {
      setTriggerResult('error');
    } finally {
      setTriggering(false);
      setTimeout(() => setTriggerResult(null), 3000);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!confirm('Moechten Sie dieses Update wirklich loeschen?')) return;

    setDeletingUpdateId(updateId);
    try {
      const res = await fetch(`/api/progress-updates/${updateId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUpdates((prev) => prev.filter((u) => u.id !== updateId));
      } else {
        const data = await res.json();
        alert(data.error || 'Fehler beim Loeschen');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Fehler beim Loeschen des Updates');
    } finally {
      setDeletingUpdateId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link href="/dashboard/projects" className="text-gray-500 hover:text-primary-600 transition-colors">
          Projekte
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{project.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusColors[project.status]}`}>
                {statusLabels[project.status]}
              </span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded ${priorityColors[project.priority]}`}>
                {project.priority === 'critical' ? 'Kritisch' :
                 project.priority === 'high' ? 'Hoch' :
                 project.priority === 'medium' ? 'Mittel' : 'Niedrig'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600 max-w-2xl">
              {project.description
                ? project.description.length > 200
                  ? project.description.slice(0, 200) + '...'
                  : project.description
                : 'Keine Beschreibung vorhanden'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(project.settings as Record<string, string>)?.build_trigger_url && (
              <div className="relative">
                <button
                  onClick={handleTriggerBuild}
                  disabled={triggering || rateLimitReached}
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    triggerResult === 'success'
                      ? 'bg-green-100 text-green-700'
                      : triggerResult === 'error'
                      ? 'bg-red-100 text-red-700'
                      : rateLimitReached
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  title={rateLimitReached && nextBuildTime
                    ? `Naechster Build moeglich ab ${nextBuildTime.toLocaleTimeString('de-DE')}`
                    : undefined
                  }
                >
                  {triggering ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Rocket className="h-4 w-4 mr-2" />
                  )}
                  {triggerResult === 'success' ? 'Build gestartet!' : triggerResult === 'error' ? 'Fehler' : 'Re-Deploy'}
                </button>
                {rateLimitReached && nextBuildTime && (
                  <p className="absolute top-full left-0 mt-1 text-xs text-amber-600 whitespace-nowrap">
                    Max 2x/Std. Naechster ab {nextBuildTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            )}
            {isManagerOrAdmin && (
              <>
                <Link
                  href={`/dashboard/projects/${project.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Link>
                <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <CheckSquare className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Aufgaben</p>
              <p className="font-semibold text-gray-900">{completedTasks} / {tasks.length}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Fortschritt</p>
              <p className="font-semibold text-gray-900">{progress}%</p>
            </div>
          </div>

          {project.due_date && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Deadline</p>
                <p className="font-semibold text-gray-900">
                  {new Date(project.due_date).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
          )}

          {project.client && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Kunde</p>
                <p className="font-semibold text-gray-900">{project.client.full_name}</p>
              </div>
            </div>
          )}

          {project.organization && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Organisation</p>
                <p className="font-semibold text-gray-900">{project.organization.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-primary-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Projektbeschreibung</h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {project.description || 'Keine detaillierte Beschreibung vorhanden.'}
                </p>
              </div>

              {/* Recent Tasks */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Aktuelle Aufgaben</h3>
                  <Link
                    href={`/dashboard/projects/${project.id}/tasks`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Alle ansehen
                  </Link>
                </div>
                {tasks.slice(0, 5).length > 0 ? (
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <Link
                        key={task.id}
                        href={`/dashboard/tasks/${task.id}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${taskStatusColors[task.status]}`}>
                            {task.status === 'backlog' ? 'Backlog' :
                             task.status === 'todo' ? 'Zu erledigen' :
                             task.status === 'in_progress' ? 'In Arbeit' :
                             task.status === 'review' ? 'Review' : 'Erledigt'}
                          </span>
                          <span className="text-gray-900">{task.title}</span>
                        </div>
                        {task.assignee && (
                          <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600">
                            {task.assignee.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Noch keine Aufgaben vorhanden</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Team */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team</h3>
                <div className="space-y-4">
                  {project.manager && (
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-600">
                        {project.manager.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{project.manager.full_name}</p>
                        <p className="text-sm text-gray-500">Projektmanager</p>
                      </div>
                    </div>
                  )}
                  {project.client && (
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                        {project.client.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{project.client.full_name}</p>
                        <p className="text-sm text-gray-500">Kunde</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Organization */}
              {project.organization && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Organisation</h3>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/organizations/${project.organization.id}`}
                        className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {project.organization.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        Alle Mitglieder haben Zugriff
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Budget (Manager/Admin only) */}
              {isManagerOrAdmin && project.budget && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Verwendet</span>
                      <span className="font-medium text-gray-900">
                        {project.budget_used.toLocaleString('de-DE')} EUR
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Gesamt</span>
                      <span className="font-medium text-gray-900">
                        {project.budget.toLocaleString('de-DE')} EUR
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (project.budget_used / project.budget) > 0.9 ? 'bg-red-500' :
                          (project.budget_used / project.budget) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((project.budget_used / project.budget) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      {Math.round((project.budget_used / project.budget) * 100)}% des Budgets verwendet
                    </p>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Zeitraum</h3>
                <div className="space-y-3 text-sm">
                  {project.start_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Start</span>
                      <span className="font-medium text-gray-900">
                        {new Date(project.start_date).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  )}
                  {project.due_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deadline</span>
                      <span className="font-medium text-gray-900">
                        {new Date(project.due_date).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  )}
                  {project.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Abgeschlossen</span>
                      <span className="font-medium text-green-600">
                        {new Date(project.completed_at).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Alle Aufgaben</h3>
              {isManagerOrAdmin && (
                <Link
                  href={`/dashboard/projects/${project.id}/tasks/new`}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Aufgabe
                </Link>
              )}
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/dashboard/tasks/${task.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded ${taskStatusColors[task.status]}`}>
                        {task.status === 'backlog' ? 'Backlog' :
                         task.status === 'todo' ? 'Zu erledigen' :
                         task.status === 'in_progress' ? 'In Arbeit' :
                         task.status === 'review' ? 'Review' : 'Erledigt'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {task.due_date && (
                        <span className="text-sm text-gray-500">
                          {new Date(task.due_date).toLocaleDateString('de-DE')}
                        </span>
                      )}
                      {task.assignee && (
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600">
                          {task.assignee.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">Noch keine Aufgaben vorhanden</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Fortschrittsupdates</h3>
              {isManagerOrAdmin && (
                <Link
                  href={`/dashboard/projects/${project.id}/updates/new`}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Neues Update
                </Link>
              )}
            </div>
            {updates.length > 0 ? (
              <div className="space-y-6">
                {updates.map((update) => (
                  <div key={update.id} className="border-l-4 border-primary-500 pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{update.title}</h4>
                          {!update.is_public && (
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                              Intern
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {update.author?.full_name} - {new Date(update.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {update.progress_percentage !== null && (
                          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                            {update.progress_percentage}%
                          </span>
                        )}
                        {isManagerOrAdmin && (
                          <>
                            <Link
                              href={`/dashboard/projects/${project.id}/updates/${update.id}/edit`}
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                              title="Bearbeiten"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteUpdate(update.id)}
                              disabled={deletingUpdateId === update.id}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Loeschen"
                            >
                              {deletingUpdateId === update.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {update.content && (
                      <div
                        className="mt-2 text-gray-600 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: update.content }}
                      />
                    )}
                    {update.images && update.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {update.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt={img.caption || 'Update Bild'}
                            className="h-20 w-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">Noch keine Updates vorhanden</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Dateien</h3>
              <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Datei hochladen
              </button>
            </div>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Noch keine Dateien vorhanden</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
