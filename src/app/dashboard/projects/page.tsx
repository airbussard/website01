'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { PMProject, ProjectStatus, Priority } from '@/types/dashboard';

const statusOptions: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle Status' },
  { value: 'planning', label: 'Planung' },
  { value: 'active', label: 'Aktiv' },
  { value: 'on_hold', label: 'Pausiert' },
  { value: 'completed', label: 'Abgeschlossen' },
  { value: 'cancelled', label: 'Abgebrochen' },
];

const priorityColors: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
};

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

export default function ProjectsPage() {
  const { user, isManagerOrAdmin } = useAuth();
  const [projects, setProjects] = useState<PMProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      const supabase = createClient();

      try {
        let query = supabase
          .from('pm_projects')
          .select(`
            *,
            client:profiles!pm_projects_client_id_fkey(id, full_name, avatar_url),
            manager:profiles!pm_projects_manager_id_fkey(id, full_name, avatar_url)
          `)
          .order('updated_at', { ascending: false });

        // Filter by user role
        if (!isManagerOrAdmin) {
          query = query.eq('client_id', user.id);
        }

        // Filter by status
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Search
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, isManagerOrAdmin, statusFilter, searchQuery]);

  const calculateProgress = (project: PMProject) => {
    if (project.task_count && project.completed_task_count) {
      return Math.round((project.completed_task_count / project.task_count) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projekte</h1>
          <p className="text-gray-600">
            {isManagerOrAdmin ? 'Alle Projekte verwalten' : 'Ihre Projekte'}
          </p>
        </div>

        {isManagerOrAdmin && (
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Neues Projekt
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Projekte suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            className="pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors appearance-none"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[project.status]}`}>
                      {statusLabels[project.status]}
                    </div>
                    <div className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColors[project.priority]}`}>
                      {project.priority === 'critical' ? 'Kritisch' :
                       project.priority === 'high' ? 'Hoch' :
                       project.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {project.description || 'Keine Beschreibung vorhanden'}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-600">Fortschritt</span>
                      <span className="font-medium text-gray-900">{calculateProgress(project)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${calculateProgress(project)}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    {project.due_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        {new Date(project.due_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                    {project.client && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1.5" />
                        {project.client.full_name}
                      </div>
                    )}
                  </div>

                  {/* Budget (Manager/Admin only) */}
                  {isManagerOrAdmin && project.budget && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Budget</span>
                      <span className="font-medium text-gray-900">
                        {project.budget_used.toLocaleString('de-DE')} / {project.budget.toLocaleString('de-DE')} EUR
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-gray-50 rounded-b-xl flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Aktualisiert: {new Date(project.updated_at).toLocaleDateString('de-DE')}
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 p-12 text-center"
        >
          <FolderKanban className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Projekte gefunden</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Versuchen Sie andere Suchkriterien'
              : 'Es wurden noch keine Projekte angelegt'}
          </p>
          {isManagerOrAdmin && (
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Erstes Projekt erstellen
            </Link>
          )}
        </motion.div>
      )}
    </div>
  );
}
