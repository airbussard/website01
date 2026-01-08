'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Settings2,
  Lock
} from 'lucide-react';
import DatabaseConfigModal from './DatabaseConfigModal';
import type { ServerDatabase } from '@/types/dashboard';

interface DatabaseConfigPanelProps {
  serverId: string;
  onSynced?: () => void;
}

export default function DatabaseConfigPanel({ serverId, onSynced }: DatabaseConfigPanelProps) {
  const [databases, setDatabases] = useState<ServerDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDb, setEditDb] = useState<ServerDatabase | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchDatabases = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/servers/${serverId}/server-databases`);
      if (response.ok) {
        const data = await response.json();
        setDatabases(data.databases || []);
      }
    } catch (error) {
      console.error('Error fetching database configs:', error);
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus(null);

    try {
      const response = await fetch(`/api/admin/servers/${serverId}/server-databases/sync`, {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSyncStatus({
          success: true,
          message: `${data.databases_synced} Datenbank(en) synchronisiert`
        });
        onSynced?.();
      } else {
        setSyncStatus({
          success: false,
          message: data.error || 'Synchronisation fehlgeschlagen'
        });
      }
    } catch (error) {
      setSyncStatus({
        success: false,
        message: 'Verbindung zum Agent fehlgeschlagen'
      });
    } finally {
      setSyncing(false);
      // Status nach 5 Sekunden ausblenden
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const handleDelete = async (dbId: string) => {
    try {
      const response = await fetch(`/api/admin/servers/${serverId}/server-databases/${dbId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDatabases();
      }
    } catch (error) {
      console.error('Error deleting database:', error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const openAddModal = () => {
    setEditDb(null);
    setModalOpen(true);
  };

  const openEditModal = (db: ServerDatabase) => {
    setEditDb(db);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Settings2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Datenbank-Konfiguration ({databases.length})
          </h2>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          {/* Actions Bar */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Datenbank hinzufuegen
            </button>

            <div className="flex items-center space-x-3">
              {syncStatus && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center text-sm ${syncStatus.success ? 'text-green-600' : 'text-red-600'}`}
                >
                  {syncStatus.success ? (
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1.5" />
                  )}
                  {syncStatus.message}
                </motion.div>
              )}
              <button
                onClick={handleSync}
                disabled={syncing || databases.length === 0}
                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
                Sync zu Agent
              </button>
            </div>
          </div>

          {/* Database List */}
          <div className="p-4">
            {databases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Keine Datenbanken konfiguriert</p>
                <p className="text-sm text-gray-400 mt-1">
                  Fuege eine Datenbank hinzu um das Monitoring zu starten
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {databases.map((db) => (
                  <motion.div
                    key={db.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${db.is_active ? 'bg-green-100' : 'bg-gray-200'}`}>
                        <Database className={`h-4 w-4 ${db.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{db.name}</p>
                          {db.ssl_enabled && (
                            <span title="SSL aktiviert">
                              <Lock className="h-3 w-3 text-green-600" />
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {db.host}:{db.port}/{db.database_name} ({db.username})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(db)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Bearbeiten"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {deleteConfirm === db.id ? (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleDelete(db.id)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Ja
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            Nein
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(db.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Loeschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Info */}
            <p className="mt-4 text-xs text-gray-400 text-center">
              Nach Aenderungen auf &quot;Sync zu Agent&quot; klicken, um die Konfiguration zu uebernehmen
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      <DatabaseConfigModal
        isOpen={modalOpen}
        serverId={serverId}
        database={editDb}
        onClose={() => setModalOpen(false)}
        onSaved={fetchDatabases}
      />
    </div>
  );
}
