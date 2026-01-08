'use client';

import { motion } from 'framer-motion';
import { Box, RefreshCw, FileText, Settings, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import type { Container } from '@/types/dashboard';

interface ContainerTableProps {
  containers: Container[];
  loading?: boolean;
  onRestart: (containerId: string) => void;
  onLogs: (containerId: string, containerName: string) => void;
  onLimits: (container: Container) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const stateColors: Record<string, string> = {
  running: 'bg-green-100 text-green-700',
  exited: 'bg-red-100 text-red-700',
  paused: 'bg-yellow-100 text-yellow-700',
  restarting: 'bg-blue-100 text-blue-700',
  created: 'bg-gray-100 text-gray-700',
  dead: 'bg-red-100 text-red-700',
};

function ActionsDropdown({
  container,
  onRestart,
  onLogs,
  onLimits
}: {
  container: Container;
  onRestart: () => void;
  onLogs: () => void;
  onLimits: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {container.state === 'running' && (
              <button
                onClick={() => { onRestart(); setOpen(false); }}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Neustarten
              </button>
            )}
            <button
              onClick={() => { onLogs(); setOpen(false); }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Logs anzeigen
            </button>
            {container.state === 'running' && (
              <button
                onClick={() => { onLimits(); setOpen(false); }}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Limits setzen
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function ContainerTable({
  containers,
  loading,
  onRestart,
  onLogs,
  onLimits
}: ContainerTableProps) {
  if (containers.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <Box className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Container</h3>
        <p className="text-gray-500">Auf diesem Server laufen keine Docker-Container</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Container
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                CPU
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                RAM
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {containers.map((container, index) => (
              <motion.tr
                key={container.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Box className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{container.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{container.id.substring(0, 12)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stateColors[container.state] || 'bg-gray-100 text-gray-700'}`}>
                    {container.state}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {container.stats ? (
                    <span className="text-sm text-gray-900 font-medium">
                      {container.stats.cpu_percent.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {container.stats ? (
                    <div>
                      <span className="text-sm text-gray-900 font-medium">
                        {formatBytes(container.stats.memory_usage)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        / {formatBytes(container.stats.memory_limit)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 truncate max-w-[200px]" title={container.image}>
                    {container.image}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <ActionsDropdown
                    container={container}
                    onRestart={() => onRestart(container.id)}
                    onLogs={() => onLogs(container.id, container.name)}
                    onLimits={() => onLimits(container)}
                  />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
