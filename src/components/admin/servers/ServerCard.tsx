'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Server, Trash2, Activity, HardDrive, Cpu, MemoryStick } from 'lucide-react';
import type { MonitoredServer, ServerStatus } from '@/types/dashboard';

interface ServerCardProps {
  server: MonitoredServer;
  status: ServerStatus | null;
  online: boolean;
  onDelete: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-300`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export default function ServerCard({ server, status, online, onDelete }: ServerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${online ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Server className={`h-5 w-5 ${online ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{server.name}</h3>
              <p className="text-sm text-gray-500">{server.host}:{server.agent_port}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                online ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {online ? 'Online' : 'Offline'}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete(server.id);
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Server loeschen"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        {online && status ? (
          <div className="space-y-3">
            {/* CPU */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center text-gray-600">
                  <Cpu className="h-3.5 w-3.5 mr-1.5" />
                  CPU
                </span>
                <span className="font-medium text-gray-900">{status.cpu.usage.toFixed(1)}%</span>
              </div>
              <ProgressBar
                value={status.cpu.usage}
                color={status.cpu.usage > 80 ? 'bg-red-500' : status.cpu.usage > 50 ? 'bg-yellow-500' : 'bg-green-500'}
              />
            </div>

            {/* RAM */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center text-gray-600">
                  <MemoryStick className="h-3.5 w-3.5 mr-1.5" />
                  RAM
                </span>
                <span className="font-medium text-gray-900">
                  {formatBytes(status.memory.used * 1024 * 1024 * 1024)} / {formatBytes(status.memory.total * 1024 * 1024 * 1024)}
                </span>
              </div>
              <ProgressBar
                value={status.memory.percent}
                color={status.memory.percent > 90 ? 'bg-red-500' : status.memory.percent > 70 ? 'bg-yellow-500' : 'bg-green-500'}
              />
            </div>

            {/* Disk */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center text-gray-600">
                  <HardDrive className="h-3.5 w-3.5 mr-1.5" />
                  Disk
                </span>
                <span className="font-medium text-gray-900">
                  {formatBytes(status.disk.used * 1024 * 1024 * 1024)} / {formatBytes(status.disk.total * 1024 * 1024 * 1024)}
                </span>
              </div>
              <ProgressBar
                value={status.disk.percent}
                color={status.disk.percent > 90 ? 'bg-red-500' : status.disk.percent > 70 ? 'bg-yellow-500' : 'bg-green-500'}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Keine Live-Daten verfuegbar</p>
          </div>
        )}

        {/* Link to detail page */}
        <Link
          href={`/dashboard/admin/servers/${server.id}`}
          className="mt-4 block w-full text-center py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
        >
          Details & Container
        </Link>
      </div>
    </motion.div>
  );
}
