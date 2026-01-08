'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Server,
  Loader2,
  RefreshCw,
  Cpu,
  MemoryStick,
  HardDrive,
  Clock,
  Box,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ContainerTable from '@/components/admin/servers/ContainerTable';
import ContainerLogsModal from '@/components/admin/servers/ContainerLogsModal';
import ContainerLimitsModal from '@/components/admin/servers/ContainerLimitsModal';
import type { MonitoredServer, ServerStatus, Container } from '@/types/dashboard';

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ServerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params.id as string;
  const { isAdmin, loading: authLoading } = useAuth();

  const [server, setServer] = useState<MonitoredServer | null>(null);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [logsModal, setLogsModal] = useState<{ open: boolean; containerId: string; containerName: string }>({
    open: false,
    containerId: '',
    containerName: ''
  });
  const [limitsModal, setLimitsModal] = useState<{ open: boolean; container: Container | null }>({
    open: false,
    container: null
  });

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);

    try {
      // Fetch server details
      const serverRes = await fetch(`/api/admin/servers/${serverId}`);
      if (!serverRes.ok) throw new Error('Server nicht gefunden');
      const serverData = await serverRes.json();
      setServer(serverData.server);

      // Fetch status
      const statusRes = await fetch(`/api/admin/servers/${serverId}/status`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatus(statusData.status);
        setOnline(statusData.online);
      } else {
        setOnline(false);
        setStatus(null);
      }

      // Fetch containers
      const containersRes = await fetch(`/api/admin/servers/${serverId}/containers`);
      if (containersRes.ok) {
        const containersData = await containersRes.json();
        setContainers(containersData.containers || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [serverId]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }

    if (isAdmin && serverId) {
      fetchData();

      // Auto-refresh alle 10 Sekunden
      const interval = setInterval(() => fetchData(), 10000);
      return () => clearInterval(interval);
    }
  }, [authLoading, isAdmin, router, serverId, fetchData]);

  const handleRestart = async (containerId: string) => {
    if (!confirm('Container wirklich neustarten?')) return;

    try {
      const response = await fetch(
        `/api/admin/servers/${serverId}/containers/${containerId}?action=restart`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Fehler beim Neustarten');
        return;
      }

      // Refresh containers
      fetchData(true);
    } catch (error) {
      console.error('Error restarting container:', error);
      alert('Fehler beim Neustarten');
    }
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

  if (!server) {
    return (
      <div className="text-center py-12">
        <Server className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Server nicht gefunden</h2>
        <Link href="/dashboard/admin/servers" className="text-primary-600 hover:text-primary-700">
          Zurueck zur Uebersicht
        </Link>
      </div>
    );
  }

  const runningContainers = containers.filter(c => c.state === 'running').length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link href="/dashboard/admin/servers" className="text-gray-500 hover:text-primary-600 transition-colors">
          Server
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{server.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/admin/servers"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{server.name}</h1>
              <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  online ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {online ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-gray-500">{server.host}:{server.agent_port}</p>
          </div>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Aktualisieren
        </button>
      </div>

      {/* Server Stats */}
      {online && status ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {/* CPU */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                status.cpu.usage > 80 ? 'bg-red-100 text-red-600' :
                status.cpu.usage > 50 ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">CPU</p>
                <p className="text-xl font-bold text-gray-900">{status.cpu.usage.toFixed(1)}%</p>
                <p className="text-xs text-gray-400">{status.cpu.cores} Cores</p>
              </div>
            </div>
          </div>

          {/* RAM */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                status.memory.percent > 90 ? 'bg-red-100 text-red-600' :
                status.memory.percent > 70 ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                <MemoryStick className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">RAM</p>
                <p className="text-xl font-bold text-gray-900">{status.memory.percent.toFixed(1)}%</p>
                <p className="text-xs text-gray-400">
                  {formatBytes(status.memory.used * 1024 * 1024 * 1024)} / {formatBytes(status.memory.total * 1024 * 1024 * 1024)}
                </p>
              </div>
            </div>
          </div>

          {/* Disk */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                status.disk.percent > 90 ? 'bg-red-100 text-red-600' :
                status.disk.percent > 70 ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Disk</p>
                <p className="text-xl font-bold text-gray-900">{status.disk.percent.toFixed(1)}%</p>
                <p className="text-xs text-gray-400">
                  {formatBytes(status.disk.used * 1024 * 1024 * 1024)} / {formatBytes(status.disk.total * 1024 * 1024 * 1024)}
                </p>
              </div>
            </div>
          </div>

          {/* Uptime */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Uptime</p>
                <p className="text-xl font-bold text-gray-900">{formatUptime(status.uptime)}</p>
                <p className="text-xs text-gray-400">{status.os.distro}</p>
              </div>
            </div>
          </div>

          {/* Containers */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Box className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Container</p>
                <p className="text-xl font-bold text-gray-900">{runningContainers} / {containers.length}</p>
                <p className="text-xs text-gray-400">Running</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">
            Server ist offline oder nicht erreichbar. Live-Daten sind nicht verfuegbar.
          </p>
        </div>
      )}

      {/* Containers Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Docker Container ({containers.length})
        </h2>
        <ContainerTable
          containers={containers}
          loading={refreshing}
          onRestart={handleRestart}
          onLogs={(containerId, containerName) => setLogsModal({ open: true, containerId, containerName })}
          onLimits={(container) => setLimitsModal({ open: true, container })}
        />
      </div>

      {/* Logs Modal */}
      <ContainerLogsModal
        isOpen={logsModal.open}
        serverId={serverId}
        containerId={logsModal.containerId}
        containerName={logsModal.containerName}
        onClose={() => setLogsModal({ open: false, containerId: '', containerName: '' })}
      />

      {/* Limits Modal */}
      <ContainerLimitsModal
        isOpen={limitsModal.open}
        serverId={serverId}
        container={limitsModal.container}
        onClose={() => setLimitsModal({ open: false, container: null })}
        onSaved={() => fetchData(true)}
      />
    </div>
  );
}
