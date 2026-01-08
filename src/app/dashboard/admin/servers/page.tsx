'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Server,
  Plus,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ServerCard from '@/components/admin/servers/ServerCard';
import AddServerModal from '@/components/admin/servers/AddServerModal';
import type { MonitoredServer, ServerStatus } from '@/types/dashboard';

interface ServerWithStatus {
  server: MonitoredServer;
  status: ServerStatus | null;
  online: boolean;
}

export default function ServersPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();

  const [servers, setServers] = useState<ServerWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchServers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/servers');
      if (!response.ok) throw new Error('Fehler beim Laden');

      const data = await response.json();
      const serversData: MonitoredServer[] = data.servers || [];

      // Fetch status for each server in parallel
      const serversWithStatus = await Promise.all(
        serversData.map(async (server) => {
          try {
            const statusResponse = await fetch(`/api/admin/servers/${server.id}/status`);
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              return {
                server,
                status: statusData.status,
                online: statusData.online
              };
            }
            return { server, status: null, online: false };
          } catch {
            return { server, status: null, online: false };
          }
        })
      );

      setServers(serversWithStatus);
    } catch (error) {
      console.error('Error fetching servers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }

    if (isAdmin) {
      fetchServers();

      // Auto-refresh alle 10 Sekunden
      const interval = setInterval(fetchServers, 10000);
      return () => clearInterval(interval);
    }
  }, [authLoading, isAdmin, router, fetchServers]);

  const handleDelete = async (id: string) => {
    if (!confirm('Server wirklich loeschen?')) return;

    try {
      const response = await fetch(`/api/admin/servers/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Fehler beim Loeschen');

      setServers(servers.filter(s => s.server.id !== id));
    } catch (error) {
      console.error('Error deleting server:', error);
    }
  };

  const handleServerCreated = (newServer: { id: string; name: string; host: string; agent_port: number }) => {
    setServers([
      ...servers,
      {
        server: {
          ...newServer,
          auth_token: '***',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        status: null,
        online: false
      }
    ]);
    setShowAddModal(false);
    // Refresh to get status
    fetchServers();
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Zugriff verweigert</p>
      </div>
    );
  }

  const onlineCount = servers.filter(s => s.online).length;
  const offlineCount = servers.length - onlineCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Server-Monitoring</h1>
          <p className="text-gray-600">
            Ueberwachte Server und Docker-Container verwalten
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchServers}
            className="inline-flex items-center px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Server hinzufuegen
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Gesamt</p>
              <p className="text-xl font-bold text-gray-900">{servers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Online</p>
              <p className="text-xl font-bold text-gray-900">{onlineCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Offline</p>
              <p className="text-xl font-bold text-gray-900">{offlineCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Server Grid */}
      {servers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((item) => (
            <ServerCard
              key={item.server.id}
              server={item.server}
              status={item.status}
              online={item.online}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 p-12 text-center"
        >
          <Server className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Server konfiguriert</h3>
          <p className="text-gray-500 mb-6">
            Fuege deinen ersten Server hinzu, um ihn zu ueberwachen
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ersten Server hinzufuegen
          </button>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Hinweis:</strong> Die Server-Daten werden automatisch alle 10 Sekunden aktualisiert.
          Stelle sicher, dass der Server-Agent auf Port 9999 erreichbar ist.
        </p>
      </div>

      {/* Add Server Modal */}
      <AddServerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleServerCreated}
      />
    </div>
  );
}
