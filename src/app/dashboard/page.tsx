'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  CheckSquare,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Calendar,
  FileSignature,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { PMProject, Task, ActivityLog } from '@/types/dashboard';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  pendingTasks: number;
  overdueTasks: number;
  pendingContracts: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user, profile, isManagerOrAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    pendingContracts: 0,
  });
  const [recentProjects, setRecentProjects] = useState<PMProject[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      const supabase = createClient();

      try {
        // Filter fuer normale User berechnen (client_id, organization, project_members)
        let userProjectFilter = 'id.not.is.null'; // Default fuer Admin

        if (!isManagerOrAdmin) {
          // User's organizations laden
          const { data: userOrgs } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id);

          const orgIds = userOrgs?.map((o: { organization_id: string }) => o.organization_id) || [];

          // User's project_members Eintraege laden
          const { data: memberProjects } = await supabase
            .from('project_members')
            .select('project_id')
            .eq('user_id', user.id);

          const memberProjectIds = memberProjects?.map((m: { project_id: string }) => m.project_id) || [];

          // Filter bauen: client_id ODER organization ODER project_member
          const filters: string[] = [`client_id.eq.${user.id}`];

          if (orgIds.length > 0) {
            filters.push(`organization_id.in.(${orgIds.join(',')})`);
          }

          if (memberProjectIds.length > 0) {
            filters.push(`id.in.(${memberProjectIds.join(',')})`);
          }

          userProjectFilter = filters.join(',');
        }

        // Fetch projects based on role
        const { data: projects } = await supabase
          .from('pm_projects')
          .select('*')
          .order('updated_at', { ascending: false })
          .or(userProjectFilter)
          .limit(5);

        // Fetch tasks
        let tasksQuery = supabase
          .from('tasks')
          .select('*, project:pm_projects(name)')
          .in('status', ['todo', 'in_progress'])
          .order('due_date', { ascending: true });

        if (!isManagerOrAdmin) {
          tasksQuery = tasksQuery.eq('assignee_id', user.id);
        }

        const { data: tasks } = await tasksQuery.limit(5);

        // Calculate stats
        const { count: totalProjects } = await supabase
          .from('pm_projects')
          .select('*', { count: 'exact', head: true })
          .or(userProjectFilter);

        const { count: activeProjects } = await supabase
          .from('pm_projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .or(userProjectFilter);

        const { count: pendingTasks } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .in('status', ['todo', 'in_progress']);

        const { count: overdueTasks } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .lt('due_date', new Date().toISOString())
          .not('status', 'eq', 'done');

        // Fetch recent activity
        if (isManagerOrAdmin) {
          const { data: activity } = await supabase
            .from('activity_log')
            .select('*, user:profiles(full_name, avatar_url)')
            .order('created_at', { ascending: false })
            .limit(5);

          setRecentActivity(activity || []);
        }

        // Fetch pending contracts count
        const { count: pendingContracts } = await supabase
          .from('contracts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending_signature');

        setStats({
          totalProjects: totalProjects || 0,
          activeProjects: activeProjects || 0,
          pendingTasks: pendingTasks || 0,
          overdueTasks: overdueTasks || 0,
          pendingContracts: pendingContracts || 0,
        });

        setRecentProjects(projects || []);
        setUpcomingTasks(tasks || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isManagerOrAdmin]);

  const statCards = [
    {
      name: 'Projekte gesamt',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'bg-blue-500',
      href: '/dashboard/projects',
    },
    {
      name: 'Aktive Projekte',
      value: stats.activeProjects,
      icon: TrendingUp,
      color: 'bg-green-500',
      href: '/dashboard/projects?status=active',
    },
    {
      name: 'Offene Aufgaben',
      value: stats.pendingTasks,
      icon: CheckSquare,
      color: 'bg-purple-500',
      href: '/dashboard/tasks',
    },
    {
      name: 'Überfällig',
      value: stats.overdueTasks,
      icon: AlertCircle,
      color: 'bg-red-500',
      href: '/dashboard/tasks?filter=overdue',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'planning':
        return 'bg-blue-100 text-blue-700';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Willkommen zurück, {profile?.full_name || 'Gast'}. Hier ist Ihre Projektübersicht.
        </p>
      </motion.div>

      {/* Contract Warning */}
      {stats.pendingContracts > 0 && (
        <motion.div variants={itemVariants}>
          <Link
            href="/dashboard/contracts?status=pending_signature"
            className="block bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 p-2 bg-amber-100 rounded-lg">
                  <FileSignature className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800">
                    {stats.pendingContracts} Vertrag{stats.pendingContracts > 1 ? 'e' : ''} warten auf Ihre Unterschrift
                  </p>
                  <p className="text-sm text-amber-600">
                    Bitte prüfen und unterschreiben Sie die ausstehenden Dokumente.
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-amber-600" />
            </div>
          </Link>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Details ansehen</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Aktuelle Projekte</h2>
            <Link href="/dashboard/projects" className="text-sm text-primary-600 hover:text-primary-700">
              Alle ansehen
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {project.description || 'Keine Beschreibung'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status === 'active' ? 'Aktiv' :
                       project.status === 'planning' ? 'Planung' :
                       project.status === 'on_hold' ? 'Pausiert' :
                       project.status === 'completed' ? 'Abgeschlossen' : project.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FolderKanban className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Noch keine Projekte vorhanden</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Anstehende Aufgaben</h2>
            <Link href="/dashboard/tasks" className="text-sm text-primary-600 hover:text-primary-700">
              Alle ansehen
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/dashboard/tasks/${task.id}`}
                  className={`block p-4 hover:bg-gray-50 transition-colors border-l-4 ${getTaskPriorityColor(task.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {(task as Task & { project?: { name: string } }).project?.name || 'Kein Projekt'}
                      </p>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(task.due_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Keine offenen Aufgaben</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Activity Feed (Manager/Admin only) */}
      {isManagerOrAdmin && (
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Letzte Aktivitäten</h2>
            <Link href="/dashboard/activity" className="text-sm text-primary-600 hover:text-primary-700">
              Alle ansehen
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">
                        {(activity as ActivityLog & { user?: { full_name: string } }).user?.full_name || 'Unbekannt'}
                      </span>
                      {' '}
                      <span className="text-gray-600">
                        {activity.action === 'created' ? 'hat erstellt' :
                         activity.action === 'updated' ? 'hat aktualisiert' :
                         activity.action === 'deleted' ? 'hat gelöscht' :
                         activity.action === 'commented' ? 'hat kommentiert' :
                         activity.action === 'completed' ? 'hat abgeschlossen' :
                         activity.action}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(activity.created_at).toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Noch keine Aktivitäten</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/projects"
            className="flex items-center space-x-3 bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors"
          >
            <FolderKanban className="h-5 w-5" />
            <span>Projekte verwalten</span>
          </Link>
          <Link
            href="/dashboard/tasks"
            className="flex items-center space-x-3 bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors"
          >
            <CheckSquare className="h-5 w-5" />
            <span>Aufgaben ansehen</span>
          </Link>
          <Link
            href="/dashboard/invoices"
            className="flex items-center space-x-3 bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors"
          >
            <FileText className="h-5 w-5" />
            <span>Rechnungen</span>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
