'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  Pause,
  Play,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import CreateRecurringModal from '@/components/recurring/CreateRecurringModal';
import type { Invoice, InvoiceStatus, RecurringInvoice, RecurringInterval } from '@/types/dashboard';

const statusOptions: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle Status' },
  { value: 'draft', label: 'Entwurf' },
  { value: 'sent', label: 'Gesendet' },
  { value: 'paid', label: 'Bezahlt' },
  { value: 'overdue', label: 'Ueberfaellig' },
  { value: 'cancelled', label: 'Storniert' },
];

const statusColors: Record<InvoiceStatus, { bg: string; text: string; icon: React.ElementType }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600', icon: FileText },
  sent: { bg: 'bg-blue-100', text: 'text-blue-600', icon: Clock },
  paid: { bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle },
  overdue: { bg: 'bg-red-100', text: 'text-red-600', icon: AlertCircle },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', icon: XCircle },
};

const statusLabels: Record<InvoiceStatus, string> = {
  draft: 'Entwurf',
  sent: 'Gesendet',
  paid: 'Bezahlt',
  overdue: 'Ueberfaellig',
  cancelled: 'Storniert',
};

const intervalLabels: Record<RecurringInterval, string> = {
  monthly: 'Monatlich',
  quarterly: 'Vierteljaehrlich',
  yearly: 'Jaehrlich',
};

type InvoiceWithProject = Invoice & { project?: { name: string } };
type RecurringWithProject = RecurringInvoice & { project?: { id: string; name: string } };

export default function AdminInvoicesPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'invoices' | 'recurring'>('invoices');
  const [invoices, setInvoices] = useState<InvoiceWithProject[]>([]);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [showCreateRecurringModal, setShowCreateRecurringModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !isAdmin) return;

      setLoading(true);
      try {
        // Fetch invoices
        let invoiceQuery = supabase
          .from('invoices')
          .select(`*, project:pm_projects(name)`)
          .order('issue_date', { ascending: false });

        if (statusFilter !== 'all') {
          invoiceQuery = invoiceQuery.eq('status', statusFilter);
        }
        if (searchQuery) {
          invoiceQuery = invoiceQuery.or(`invoice_number.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
        }

        const { data: invoiceData } = await invoiceQuery;
        setInvoices(invoiceData || []);

        // Fetch recurring invoices
        let recurringQuery = supabase
          .from('recurring_invoices')
          .select(`*, project:pm_projects(id, name)`)
          .order('next_invoice_date', { ascending: true });

        if (searchQuery) {
          recurringQuery = recurringQuery.ilike('title', `%${searchQuery}%`);
        }

        const { data: recurringData } = await recurringQuery;
        setRecurringInvoices(recurringData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin, statusFilter, searchQuery, supabase]);

  const toggleRecurringActive = async (recurring: RecurringWithProject) => {
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
      console.error('Error toggling recurring:', error);
    } finally {
      setTogglingId(null);
    }
  };

  const deleteRecurring = async (id: string) => {
    if (!confirm('Wiederkehrende Rechnung wirklich loeschen?')) return;
    try {
      const { error } = await supabase.from('recurring_invoices').delete().eq('id', id);
      if (error) throw error;
      setRecurringInvoices(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting recurring:', error);
    }
  };

  const handleRecurringCreated = (newRecurring: RecurringInvoice) => {
    setRecurringInvoices(prev => [newRecurring as RecurringWithProject, ...prev]);
    setShowCreateRecurringModal(false);
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const activeRecurringCount = recurringInvoices.filter(r => r.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rechnungsverwaltung</h1>
          <p className="text-gray-600">Alle Rechnungen erstellen und verwalten</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'invoices' ? (
            <Link
              href="/dashboard/admin/invoices/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Neue Rechnung
            </Link>
          ) : (
            <button
              onClick={() => setShowCreateRecurringModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Wiederkehrend
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'invoices'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Einzelrechnungen ({invoices.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'recurring'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2" />
              Wiederkehrend ({activeRecurringCount} aktiv)
            </div>
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      {activeTab === 'invoices' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Gesamt', value: invoices.length, icon: FileText, color: 'bg-gray-100 text-gray-600' },
            { label: 'Offen', value: invoices.filter(i => i.status === 'sent').length, icon: Clock, color: 'bg-blue-100 text-blue-600' },
            { label: 'Bezahlt', value: invoices.filter(i => i.status === 'paid').length, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
            { label: 'Ueberfaellig', value: invoices.filter(i => i.status === 'overdue').length, icon: AlertCircle, color: 'bg-red-100 text-red-600' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
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
                <p className="text-xl font-bold text-gray-900">{activeRecurringCount}</p>
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
                <p className="text-xl font-bold text-gray-900">{recurringInvoices.length - activeRecurringCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'invoices' ? 'Rechnungsnummer oder Titel suchen...' : 'Titel suchen...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        {activeTab === 'invoices' && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
              className="pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors appearance-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'invoices' ? (
        // Invoices Table
        invoices.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rechnung</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Projekt</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Datum</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Betrag</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice, index) => {
                    const StatusIcon = statusColors[invoice.status].icon;
                    return (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                            <p className="text-sm text-gray-500">{invoice.title}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">{invoice.project?.name || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status].bg} ${statusColors[invoice.status].text}`}>
                            <StatusIcon className="h-3.5 w-3.5 mr-1" />
                            {statusLabels[invoice.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{new Date(invoice.issue_date).toLocaleDateString('de-DE')}</p>
                          {invoice.due_date && (
                            <p className="text-xs text-gray-500">Faellig: {new Date(invoice.due_date).toLocaleDateString('de-DE')}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(invoice.total_amount, invoice.currency)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/dashboard/admin/invoices/${invoice.id}`}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Ansehen/Bearbeiten"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {invoice.pdf_url && (
                              <a
                                href={invoice.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="PDF herunterladen"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}
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
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Rechnungen gefunden</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== 'all' ? 'Versuchen Sie andere Suchkriterien' : 'Es wurden noch keine Rechnungen erstellt'}
            </p>
            <Link
              href="/dashboard/admin/invoices/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Erste Rechnung erstellen
            </Link>
          </motion.div>
        )
      ) : (
        // Recurring Invoices Table
        recurringInvoices.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Titel</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Projekt</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Intervall</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Naechste</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Betrag</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Generiert</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktionen</th>
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
                            onClick={() => toggleRecurringActive(recurring)}
                            disabled={togglingId === recurring.id}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              recurring.is_active ? 'bg-green-500' : 'bg-gray-300'
                            } disabled:opacity-50`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              recurring.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{recurring.title}</p>
                          {recurring.description && (
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">{recurring.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">{recurring.project?.name || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                            {intervalLabels[recurring.interval_type]}
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
                          <p className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</p>
                          <p className="text-xs text-gray-500">inkl. {recurring.tax_rate}% MwSt.</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {recurring.invoices_generated}x
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => deleteRecurring(recurring.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Loeschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
            <p className="text-gray-500 mb-6">Erstellen Sie eine wiederkehrende Rechnung fuer automatische Generierung</p>
            <button
              onClick={() => setShowCreateRecurringModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Wiederkehrend erstellen
            </button>
          </motion.div>
        )
      )}

      {/* Info Box for recurring */}
      {activeTab === 'recurring' && recurringInvoices.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Hinweis:</strong> Wiederkehrende Rechnungen werden automatisch jeden Tag um 6:00 Uhr generiert,
            wenn das naechste Rechnungsdatum erreicht ist.
          </p>
        </div>
      )}

      {/* Create Recurring Modal */}
      {showCreateRecurringModal && (
        <CreateRecurringModal
          onClose={() => setShowCreateRecurringModal(false)}
          onCreated={handleRecurringCreated}
        />
      )}
    </div>
  );
}
