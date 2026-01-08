'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Loader2, Cpu, MemoryStick } from 'lucide-react';
import type { Container } from '@/types/dashboard';

interface ContainerLimitsModalProps {
  isOpen: boolean;
  serverId: string;
  container: Container | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ContainerLimitsModal({
  isOpen,
  serverId,
  container,
  onClose,
  onSaved
}: ContainerLimitsModalProps) {
  const [memory, setMemory] = useState('');
  const [cpus, setCpus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!container) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const body: { memory?: string; cpus?: number } = {};
      if (memory) body.memory = memory;
      if (cpus) body.cpus = parseFloat(cpus);

      if (Object.keys(body).length === 0) {
        setError('Bitte mindestens einen Wert angeben');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/admin/servers/${serverId}/containers/${container.id}?action=limits`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim Setzen der Limits');
      }

      setSuccess('Limits erfolgreich aktualisiert');
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !container) return null;

  const currentMemory = container.stats?.memory_limit
    ? `${(container.stats.memory_limit / 1024 / 1024).toFixed(0)}m`
    : 'Unbegrenzt';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Container Limits</h2>
                <p className="text-sm text-gray-500">{container.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            {/* Current Limits Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Aktuelle Limits</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Memory:</span>
                  <span className="ml-2 font-medium text-gray-900">{currentMemory}</span>
                </div>
                <div>
                  <span className="text-gray-500">CPU:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {container.stats?.cpu_percent ? `${container.stats.cpu_percent.toFixed(1)}% genutzt` : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Memory Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Memory Limit
              </label>
              <div className="relative">
                <MemoryStick className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={memory}
                  onChange={(e) => setMemory(e.target.value)}
                  placeholder="z.B. 512m, 2g"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Format: 512m (MB), 2g (GB)
              </p>
            </div>

            {/* CPU Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPU Limit
              </label>
              <div className="relative">
                <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={cpus}
                  onChange={(e) => setCpus(e.target.value)}
                  placeholder="z.B. 0.5, 1, 2"
                  step="0.1"
                  min="0.1"
                  max="16"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Anzahl CPU-Kerne (0.5 = halber Kern, 2 = zwei Kerne)
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading || (!memory && !cpus)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Limits setzen
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
