'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckSquare,
  Calendar,
  User,
  FolderKanban,
  Edit,
  Trash2,
  Loader2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import type { Task, TaskStatus, Priority } from '@/types/dashboard';

const statusColors: Record<TaskStatus, string> = {
  backlog: 'bg-gray-100 text-gray-700 border-gray-200',
  todo: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  review: 'bg-purple-100 text-purple-700 border-purple-200',
  done: 'bg-green-100 text-green-700 border-green-200',
};

const statusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'Zu erledigen',
  in_progress: 'In Arbeit',
  review: 'Review',
  done: 'Erledigt',
};

const priorityColors: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
};

const priorityLabels: Record<Priority, string> = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
  critical: 'Kritisch',
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { user, isManagerOrAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!user || authLoading) return;

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            project:pm_projects(id, name),
            assignee:profiles(id, full_name, email, avatar_url)
          `)
          .eq('id', taskId)
          .single();

        if (error) throw error;
        setTask(data);
      } catch (error) {
        console.error('Error fetching task:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [user, authLoading, taskId, supabase]);

  const updateStatus = async (newStatus: TaskStatus) => {
    if (!task) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', task.id);

      if (error) throw error;
      setTask({ ...task, status: newStatus });
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setUpdating(false);
    }
  };

  const deleteTask = async () => {
    if (!task || !confirm('Aufgabe wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id);
      if (error) throw error;
      router.push('/dashboard/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aufgabe nicht gefunden</h2>
        <p className="text-gray-500 mb-4">Die angeforderte Aufgabe existiert nicht oder Sie haben keinen Zugriff.</p>
        <Link href="/dashboard/tasks" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu Aufgaben
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link href="/dashboard/tasks" className="text-gray-500 hover:text-primary-600 transition-colors">
          Aufgaben
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium truncate">{task.title}</span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusColors[task.status]}`}>
                {statusLabels[task.status]}
              </span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded ${priorityColors[task.priority]}`}>
                {priorityLabels[task.priority]}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
            {task.description && (
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            )}
          </div>

          {isManagerOrAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={deleteTask}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Löschen"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          {task.project && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FolderKanban className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Projekt</p>
                <Link
                  href={`/dashboard/projects/${task.project.id}`}
                  className="font-medium text-gray-900 hover:text-primary-600"
                >
                  {task.project.name}
                </Link>
              </div>
            </div>
          )}

          {task.assignee && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Zugewiesen an</p>
                <p className="font-medium text-gray-900">{task.assignee.full_name}</p>
              </div>
            </div>
          )}

          {task.due_date && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Fällig am</p>
                <p className="font-medium text-gray-900">
                  {new Date(task.due_date).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
          )}

          {task.estimated_hours && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Geschätzt</p>
                <p className="font-medium text-gray-900">{task.estimated_hours}h</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Status ändern */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status ändern</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(statusLabels) as TaskStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => updateStatus(status)}
              disabled={updating || task.status === status}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                task.status === status
                  ? `${statusColors[status]} border`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Zurück-Link */}
      <div className="text-center">
        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu allen Aufgaben
        </Link>
      </div>
    </div>
  );
}
