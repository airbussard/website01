'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, User, MoreHorizontal, GripVertical } from 'lucide-react';
import type { Task, TaskStatus, Priority } from '@/types/dashboard';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, newStatus: TaskStatus) => void;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'border-gray-300' },
  { id: 'todo', title: 'Zu erledigen', color: 'border-blue-400' },
  { id: 'in_progress', title: 'In Arbeit', color: 'border-yellow-400' },
  { id: 'review', title: 'Review', color: 'border-purple-400' },
  { id: 'done', title: 'Erledigt', color: 'border-green-400' },
];

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

export default function KanbanBoard({ tasks, onTaskUpdate }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    if (draggedTask) {
      const task = tasks.find(t => t.id === draggedTask);
      if (task && task.status !== columnId) {
        onTaskUpdate(draggedTask, columnId);
      }
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const getColumnTasks = (columnId: TaskStatus) => {
    return tasks.filter(task => task.status === columnId);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = getColumnTasks(column.id);
        const isDragOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-72 bg-gray-50 rounded-xl transition-all ${
              isDragOver ? 'ring-2 ring-primary-500 bg-primary-50' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={`p-4 border-b-2 ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-white text-gray-600 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-3 space-y-3 min-h-[200px]">
              {columnTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layoutId={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                    draggedTask === task.id ? 'opacity-50' : ''
                  }`}
                >
                  <Link href={`/dashboard/tasks/${task.id}`} className="block p-3">
                    {/* Priority Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColors[task.priority]}`}>
                        {priorityLabels[task.priority]}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Title */}
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</h4>

                    {/* Project Name */}
                    {(task as Task & { project?: { name: string } }).project && (
                      <p className="text-xs text-gray-500 mb-3">
                        {(task as Task & { project?: { name: string } }).project?.name}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      {task.due_date ? (
                        <div className={`flex items-center text-xs ${
                          new Date(task.due_date) < new Date() && task.status !== 'done'
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}>
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {new Date(task.due_date).toLocaleDateString('de-DE')}
                        </div>
                      ) : (
                        <div />
                      )}

                      {task.assignee && (
                        <div
                          className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600"
                          title={task.assignee.full_name || ''}
                        >
                          {task.assignee.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Drag Handle */}
                  <div className="px-3 pb-2 flex justify-center">
                    <GripVertical className="h-4 w-4 text-gray-300" />
                  </div>
                </motion.div>
              ))}

              {columnTasks.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-sm">
                  Keine Aufgaben
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
