'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  LayoutGrid,
  List,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Task, TaskStatus, Priority } from '@/types/dashboard';
import KanbanBoard from '@/components/dashboard/KanbanBoard';

type ViewMode = 'list' | 'kanban';

const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle Status' },
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'Zu erledigen' },
  { value: 'in_progress', label: 'In Arbeit' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Erledigt' },
];

const priorityColors: Record<Priority, string> = {
  low: 'border-l-gray-300',
  medium: 'border-l-blue-500',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};

const statusColors: Record<TaskStatus, string> = {
  backlog: 'bg-gray-100 text-gray-600',
  todo: 'bg-blue-100 text-blue-600',
  in_progress: 'bg-yellow-100 text-yellow-600',
  review: 'bg-purple-100 text-purple-600',
  done: 'bg-green-100 text-green-600',
};

const statusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'Zu erledigen',
  in_progress: 'In Arbeit',
  review: 'Review',
  done: 'Erledigt',
};

export default function TasksPage() {
  const { user, isManagerOrAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>(isManagerOrAdmin ? 'kanban' : 'list');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') {
          params.set('status', statusFilter);
        }

        const response = await fetch(`/api/tasks?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();

        // Filter by search query client-side
        let filteredTasks = data.tasks || [];
        if (searchQuery) {
          filteredTasks = filteredTasks.filter((task: Task) =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setTasks(filteredTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, statusFilter, searchQuery]);

  const handleTaskUpdate = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update local state
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aufgaben</h1>
          <p className="text-gray-600">
            {isManagerOrAdmin ? 'Alle Aufgaben verwalten' : 'Ihre zugewiesenen Aufgaben'}
          </p>
        </div>

        {isManagerOrAdmin && (
          <Link
            href="/dashboard/tasks/new"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Neue Aufgabe
          </Link>
        )}
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Aufgaben suchen..."
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
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
            className="pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        {/* View Toggle (Manager/Admin only) */}
        {isManagerOrAdmin && (
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4 mr-1.5" />
              Liste
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              Kanban
            </button>
          </div>
        )}
      </div>

      {/* Tasks View */}
      {viewMode === 'kanban' && isManagerOrAdmin ? (
        <KanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} />
      ) : (
        <>
          {tasks.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="divide-y divide-gray-100">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className={`flex items-center p-4 hover:bg-gray-50 transition-colors border-l-4 ${priorityColors[task.priority]}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded ${statusColors[task.status]}`}>
                            {statusLabels[task.status]}
                          </span>
                          <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {(task as Task & { project?: { name: string } }).project && (
                            <span>{(task as Task & { project?: { name: string } }).project?.name}</span>
                          )}
                          {task.due_date && (
                            <span className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {new Date(task.due_date).toLocaleDateString('de-DE')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 p-12 text-center"
            >
              <CheckSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Aufgaben gefunden</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Versuchen Sie andere Suchkriterien'
                  : 'Es wurden noch keine Aufgaben erstellt'}
              </p>
              {isManagerOrAdmin && (
                <Link
                  href="/dashboard/tasks/new"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Erste Aufgabe erstellen
                </Link>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
