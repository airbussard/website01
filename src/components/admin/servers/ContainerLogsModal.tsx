'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Loader2, FileText, ChevronDown } from 'lucide-react';

interface ContainerLogsModalProps {
  isOpen: boolean;
  serverId: string;
  containerId: string;
  containerName: string;
  onClose: () => void;
}

export default function ContainerLogsModal({
  isOpen,
  serverId,
  containerId,
  containerName,
  onClose
}: ContainerLogsModalProps) {
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [tailSize, setTailSize] = useState(100);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/servers/${serverId}/containers/${containerId}?action=logs&tail=${tailSize}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const data = await response.json();
        setLogs(`Fehler: ${data.error || 'Logs konnten nicht geladen werden'}`);
        return;
      }

      const data = await response.json();
      setLogs(data.logs || 'Keine Logs verfuegbar');
    } catch (error) {
      setLogs(`Fehler beim Laden: ${error instanceof Error ? error.message : 'Unbekannt'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && containerId) {
      fetchLogs();
    }
  }, [isOpen, containerId, tailSize]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-white">Container Logs</h2>
                <p className="text-sm text-gray-400">{containerName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Tail Size Selector */}
              <div className="relative">
                <select
                  value={tailSize}
                  onChange={(e) => setTailSize(Number(e.target.value))}
                  className="appearance-none bg-gray-800 text-gray-200 text-sm px-3 py-1.5 pr-8 rounded-lg border border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={100}>100 Zeilen</option>
                  <option value={500}>500 Zeilen</option>
                  <option value={1000}>1000 Zeilen</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="flex items-center px-3 py-1.5 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2 text-sm">Aktualisieren</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Logs Content */}
          <div className="flex-1 overflow-auto p-4">
            {loading && !logs ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-all leading-relaxed">
                {logs}
                <div ref={logsEndRef} />
              </pre>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
