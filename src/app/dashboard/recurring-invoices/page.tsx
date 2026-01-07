'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Plus,
  Search,
  Loader2,
  CheckCircle,
  Pause,
  Calendar,
  Euro,
  FolderKanban,
  Trash2,
  Edit,
  Play,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import CreateRecurringModal from '@/components/recurring/CreateRecurringModal';
import type { RecurringInvoice, RecurringInterval } from '@/types/dashboard';

const intervalLabels: Record<RecurringInterval, string> = {
  monthly: 'Monatlich',
  quarterly: 'Vierteljährlich',
  yearly: 'Jährlich',
};

type RecurringInvoiceWithProject = RecurringInvoice & {
  project?: { id: string; name: string };
};

export default function RecurringInvoicesPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoiceWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    const fetchRecurringInvoices = async () => {
      if (!user || !isAdmin) return;

      try {
        let query = supabase
          .from('recurring_invoices')
          .select(`
            *,
            project:pm_projects(id, name)
          `)
          .order('next_invoice_date', { ascending: true });

        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        setRecurringInvoices(data || []);
      } catch (error) {
        console.error('Error fetching recurring invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecurringInvoices();
  }, [user, isAdmin, searchQuery, supabase]);

  const toggleActive = async (recurring: RecurringInvoiceWithProject) => {
    setTogglingId(recurring.id);
    try {
      const { error } = await supabase
        .from('recurring_invoices')
        .update({ is_active: !recurring.is_active })
        .eq('id', recurring.id);

      if (error) throw error;

      setRecurringInvoices(prev =>
        prev.map(r => r.id === recurring.id ? { ...r, is_active: !r.is_active } : r)
      );
    } catch (error) {
      console.error('Error toggling recurring invoice:', error);
    } finally {
      setTogglingId(null);
    }
  };

  const deleteRecurring = async (id: string) => {
    if (!confirm('Wiederkehrende Rechnung wirklich loeschen?')) return;

    try {
      const { error } = await supabase
        .from('recurring_invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecurringInvoices(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting recurring invoice:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleCreated = (newRecurring: RecurringInvoice) => {
    setRecurringInvoices(prev => [newRecurring as RecurringInvoiceWithProject, ...prev]);
    setShowCreateModal(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const activeCount = recurringInvoices.filter(r => r.is_active).length;
  const pausedCount = recurringInvoices.filter(r => !r.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wiederkehrende Rechnungen</h1>
          <p className="text-gray-600">
            Automatische Rechnungsgenerierung verwalten
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Neue wiederkehrende Rechnung
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Gesamt</p>
              <p className="text-xl font-bold text-gray-900">{recurringInvoices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Aktiv</p>
              <p className="text-xl font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Pause className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pausiert</p>
              <p className="text-xl font-bold text-gray-900">{pausedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Titel suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Table */}
      {recurringInvoices.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Titel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Projekt
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Intervall
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Naechste Rechnung
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Betrag
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Generiert
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recurringInvoices.map((recurring, index) => {
                  const totalAmount = recurring.net_amount * (1 + recurring.tax_rate / 100);
                  const isOverdue = recurring.is_active && new Date(recurring.next_invoice_date) < new Date();
                  return (
                    <motion.tr
                      key={recurring.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(recurring)}
                          disabled={togglingId === recurring.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            recurring.is_active ? 'bg-green-500' : 'bg-gray-300'
                          } disabled:opacity-50`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              recurring.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{recurring.title}</p>
                          {recurring.description && (
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">{recurring.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">
                          {recurring.project?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                          {intervalLabels[recurring.interval_type]}
                          {recurring.interval_value > 1 && ` (alle ${recurring.interval_value})`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                          <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {new Date(recurring.next_invoice_date).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(totalAmount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          inkl. {recurring.tax_rate}% MwSt.
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {recurring.invoices_generated}x
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => deleteRecurring(recurring.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Loeschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 p-12 text-center"
        >
          <RefreshCw className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine wiederkehrenden Rechnungen</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? 'Keine Ergebnisse fuer Ihre Suche'
              : 'Es wurden noch keine wiederkehrenden Rechnungen erstellt'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Erste wiederkehrende Rechnung erstellen
          </button>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Hinweis:</strong> Wiederkehrende Rechnungen werden automatisch jeden Tag um 6:00 Uhr generiert,
          wenn das naechste Rechnungsdatum erreicht ist. Bei aktivierter Lexoffice-Integration werden die Rechnungen
          automatisch synchronisiert.
        </p>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateRecurringModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
