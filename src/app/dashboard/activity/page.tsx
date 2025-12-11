'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  Search,
  Filter,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  Upload,
  FileText,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import type { ActivityLog, ActivityAction, ActivityEntityType } from '@/types/dashboard';

const actionLabels: Record<ActivityAction, string> = {
  created: 'erstellt',
  updated: 'aktualisiert',
  deleted: 'gelöscht',
  commented: 'kommentiert',
  uploaded: 'hochgeladen',
  status_changed: 'Status geändert',
  assigned: 'zugewiesen',
  completed: 'abgeschlossen',
  invoice_sent: 'Rechnung gesendet',
  invoice_paid: 'Rechnung bezahlt',
};

const entityLabels: Record<ActivityEntityType, string> = {
  project: 'Projekt',
  task: 'Aufgabe',
  comment: 'Kommentar',
  file: 'Datei',
  invoice: 'Rechnung',
  progress_update: 'Update',
};

const entityIcons: Record<ActivityEntityType, React.ElementType> = {
  project: FolderKanban,
  task: CheckSquare,
  comment: MessageSquare,
  file: Upload,
  invoice: FileText,
  progress_update: Activity,
};

const actionColors: Record<ActivityAction, string> = {
  created: 'bg-green-100 text-green-600',
  updated: 'bg-blue-100 text-blue-600',
  deleted: 'bg-red-100 text-red-600',
  commented: 'bg-purple-100 text-purple-600',
  uploaded: 'bg-orange-100 text-orange-600',
  status_changed: 'bg-yellow-100 text-yellow-600',
  assigned: 'bg-indigo-100 text-indigo-600',
  completed: 'bg-emerald-100 text-emerald-600',
  invoice_sent: 'bg-cyan-100 text-cyan-600',
  invoice_paid: 'bg-green-100 text-green-600',
};

const ITEMS_PER_PAGE = 20;

export default function ActivityPage() {
  const { user, isManagerOrAdmin, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<ActivityEntityType | 'all'>('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchActivities = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;
      if (!user || !isManagerOrAdmin) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const supabase = createClient();

      try {
        let query = supabase
          .from('activity_log')
          .select(`
            *,
            user:profiles(id, full_name, avatar_url),
            project:pm_projects(id, name)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

        // Filter by entity type
        if (entityFilter !== 'all') {
          query = query.eq('entity_type', entityFilter);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        setActivities(data || []);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, isManagerOrAdmin, authLoading, entityFilter, page]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Minute${diffMins !== 1 ? 'n' : ''}`;
    if (diffHours < 24) return `vor ${diffHours} Stunde${diffHours !== 1 ? 'n' : ''}`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays !== 1 ? 'en' : ''}`;
    return date.toLocaleDateString('de-DE');
  };

  // Access restriction for non-managers
  if (!isManagerOrAdmin) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Zugriff verweigert</h3>
        <p className="text-gray-500">
          Nur Manager und Administratoren haben Zugriff auf das Aktivitätsprotokoll.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aktivitätsprotokoll</h1>
        <p className="text-gray-600">
          Alle Aktivitäten im Projektmanagement-System
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Aktivitäten durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Entity Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value as ActivityEntityType | 'all');
              setPage(0);
            }}
            className="pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors appearance-none"
          >
            <option value="all">Alle Typen</option>
            {Object.entries(entityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity List */}
      {activities.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="divide-y divide-gray-100">
            {activities.map((activity, index) => {
              const Icon = entityIcons[activity.entity_type];
              const activityUser = activity as ActivityLog & { user?: { full_name: string; avatar_url?: string } };
              const activityProject = activity as ActivityLog & { project?: { id: string; name: string } };

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {activityUser.user?.avatar_url ? (
                        <img
                          src={activityUser.user.avatar_url}
                          alt={activityUser.user.full_name || ''}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-medium text-gray-900">
                          {activityUser.user?.full_name || 'Unbekannt'}
                        </span>
                        <span className="text-gray-500">hat</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${actionColors[activity.action]}`}>
                          {actionLabels[activity.action]}
                        </span>
                      </div>

                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Icon className="h-4 w-4 mr-1.5 text-gray-400" />
                        <span>{entityLabels[activity.entity_type]}</span>
                        {activityProject.project && (
                          <>
                            <span className="mx-1.5">in</span>
                            <Link
                              href={`/dashboard/projects/${activityProject.project.id}`}
                              className="text-primary-600 hover:text-primary-700"
                            >
                              {activityProject.project.name}
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Details */}
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                          {JSON.stringify(activity.details, null, 2)}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex-shrink-0 text-right">
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(activity.created_at)}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(activity.created_at).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Zeige {page * ITEMS_PER_PAGE + 1} - {Math.min((page + 1) * ITEMS_PER_PAGE, totalCount)} von {totalCount}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Seite {page + 1} von {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 p-12 text-center"
        >
          <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Aktivitäten gefunden</h3>
          <p className="text-gray-500">
            {entityFilter !== 'all'
              ? 'Versuchen Sie andere Filter'
              : 'Es wurden noch keine Aktivitäten protokolliert'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
