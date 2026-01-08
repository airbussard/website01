'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Loader2,
  RefreshCw,
  Table2,
  Users,
  Clock,
  HardDrive,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DatabaseInfo {
  id: string;
  name: string;
  host: string;
  port: number;
  database: string;
  isConnected: boolean;
}

interface DatabaseStats {
  database: string;
  size_bytes: number;
  size_human: string;
  connections_active: number;
  connections_max: number;
  connections_percent: string;
  uptime_seconds: number;
  version: string;
}

interface TableInfo {
  schema: string;
  table: string;
  size_bytes: number;
  size_human: string;
  row_count: number;
}

interface ConnectionInfo {
  pid: number;
  user: string;
  application: string;
  client_ip: string;
  state: string;
  duration_seconds: number;
  query: string;
}

interface SlowQuery {
  query: string;
  calls: number;
  avg_time_ms: string;
  total_time_ms: string;
}

interface DatabaseSectionProps {
  serverId: string;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function DatabaseSection({ serverId }: DatabaseSectionProps) {
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'tables' | 'connections' | 'slow-queries'>('stats');
  const [expanded, setExpanded] = useState(true);

  const fetchDatabases = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/servers/${serverId}/databases`);
      if (response.ok) {
        const data = await response.json();
        setDatabases(data.databases || []);
        if (data.databases?.length > 0 && !selectedDb) {
          setSelectedDb(data.databases[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
    } finally {
      setLoading(false);
    }
  }, [serverId, selectedDb]);

  const fetchDbData = useCallback(async (dbId: string, endpoint: string) => {
    try {
      const response = await fetch(`/api/admin/servers/${serverId}/databases/${dbId}?endpoint=${endpoint}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
    return null;
  }, [serverId]);

  const loadTabData = useCallback(async () => {
    if (!selectedDb) return;

    const data = await fetchDbData(selectedDb, activeTab);
    if (!data) return;

    switch (activeTab) {
      case 'stats':
        setStats(data);
        break;
      case 'tables':
        setTables(data.tables || []);
        break;
      case 'connections':
        setConnections(data.connections || []);
        break;
      case 'slow-queries':
        setSlowQueries(data.queries || []);
        break;
    }
  }, [selectedDb, activeTab, fetchDbData]);

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  useEffect(() => {
    if (selectedDb) {
      loadTabData();
    }
  }, [selectedDb, activeTab, loadTabData]);

  const terminateConnection = async (pid: number) => {
    if (!selectedDb || !confirm(`Connection ${pid} wirklich beenden?`)) return;

    try {
      const response = await fetch(
        `/api/admin/servers/${serverId}/databases/${selectedDb}?action=terminate-connection`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pid })
        }
      );

      if (response.ok) {
        loadTabData();
      }
    } catch (error) {
      console.error('Error terminating connection:', error);
    }
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

  if (databases.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Datenbanken</h2>
        </div>
        <p className="text-gray-500 text-center py-4">Keine Datenbanken konfiguriert</p>
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
          <Database className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Datenbanken ({databases.length})</h2>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          {/* Database Selector */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {databases.map((db) => (
                <button
                  key={db.id}
                  onClick={() => setSelectedDb(db.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedDb === db.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    db.isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  {db.name}
                </button>
              ))}
            </div>
            <button
              onClick={loadTabData}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[
              { id: 'stats', label: 'Statistiken', icon: HardDrive },
              { id: 'tables', label: 'Tabellen', icon: Table2 },
              { id: 'connections', label: 'Connections', icon: Users },
              { id: 'slow-queries', label: 'Slow Queries', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Stats Tab */}
            {activeTab === 'stats' && stats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Groesse</p>
                  <p className="text-xl font-bold text-gray-900">{stats.size_human}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Connections</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.connections_active} / {stats.connections_max}
                  </p>
                  <p className="text-xs text-gray-400">{stats.connections_percent}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Uptime</p>
                  <p className="text-xl font-bold text-gray-900">{formatUptime(stats.uptime_seconds)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Version</p>
                  <p className="text-xl font-bold text-gray-900">{stats.version}</p>
                </div>
              </motion.div>
            )}

            {/* Tables Tab */}
            {activeTab === 'tables' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Tabelle</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500">Groesse</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500">Zeilen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.slice(0, 20).map((table, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <span className="text-gray-400">{table.schema}.</span>
                          <span className="font-medium text-gray-900">{table.table}</span>
                        </td>
                        <td className="py-2 px-3 text-right text-gray-600">{table.size_human}</td>
                        <td className="py-2 px-3 text-right text-gray-600">{table.row_count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tables.length > 20 && (
                  <p className="text-center text-sm text-gray-400 py-2">
                    ... und {tables.length - 20} weitere Tabellen
                  </p>
                )}
              </motion.div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-500">PID</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">User</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">App</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500">Dauer</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections.map((conn) => (
                      <tr key={conn.pid} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 font-mono text-gray-600">{conn.pid}</td>
                        <td className="py-2 px-3 text-gray-900">{conn.user}</td>
                        <td className="py-2 px-3 text-gray-600 truncate max-w-[150px]">{conn.application}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            conn.state === 'active' ? 'bg-green-100 text-green-700' :
                            conn.state === 'idle' ? 'bg-gray-100 text-gray-600' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {conn.state}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-gray-600">
                          {conn.duration_seconds > 0 ? `${conn.duration_seconds}s` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => terminateConnection(conn.pid)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Connection beenden"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* Slow Queries Tab */}
            {activeTab === 'slow-queries' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {slowQueries.length > 0 ? (
                  <div className="space-y-3">
                    {slowQueries.map((query, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3 text-sm">
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded font-medium">
                              {query.avg_time_ms}ms avg
                            </span>
                            <span className="text-gray-500">{query.calls} Aufrufe</span>
                          </div>
                        </div>
                        <pre className="text-xs text-gray-600 font-mono overflow-x-auto whitespace-pre-wrap">
                          {query.query}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Keine langsamen Queries gefunden</p>
                    <p className="text-sm text-gray-400">oder pg_stat_statements nicht aktiviert</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
