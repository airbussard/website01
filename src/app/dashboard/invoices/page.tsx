'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { Invoice, InvoiceStatus } from '@/types/dashboard';

const statusOptions: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle Status' },
  { value: 'draft', label: 'Entwurf' },
  { value: 'sent', label: 'Gesendet' },
  { value: 'paid', label: 'Bezahlt' },
  { value: 'overdue', label: 'Überfällig' },
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
  overdue: 'Überfällig',
  cancelled: 'Storniert',
};

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;

      const supabase = createClient();

      try {
        // Fetch invoices for projects where user is client
        const { data: projects } = await supabase
          .from('pm_projects')
          .select('id')
          .eq('client_id', user.id);

        if (!projects || projects.length === 0) {
          setInvoices([]);
          setLoading(false);
          return;
        }

        const projectIds = projects.map((p: { id: string }) => p.id);

        let query = supabase
          .from('invoices')
          .select(`
            *,
            project:pm_projects(id, name, client_id)
          `)
          .in('project_id', projectIds)
          .order('issue_date', { ascending: false });

        // Filter by status
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Search
        if (searchQuery) {
          query = query.or(`invoice_number.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        setInvoices(data || []);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user, statusFilter, searchQuery]);

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meine Rechnungen</h1>
          <p className="text-gray-600">Uebersicht Ihrer Rechnungen</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Gesamt',
            value: invoices.length,
            icon: FileText,
            color: 'bg-gray-100 text-gray-600',
          },
          {
            label: 'Offen',
            value: invoices.filter(i => i.status === 'sent').length,
            icon: Clock,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Bezahlt',
            value: invoices.filter(i => i.status === 'paid').length,
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Überfällig',
            value: invoices.filter(i => i.status === 'overdue').length,
            icon: AlertCircle,
            color: 'bg-red-100 text-red-600',
          },
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechnungsnummer oder Titel suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
            className="pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Invoices Table */}
      {invoices.length > 0 ? (
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
                    Rechnung
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Projekt
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Betrag
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
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
                        <span className="text-gray-600">
                          {(invoice as Invoice & { project?: { name: string } }).project?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status].bg} ${statusColors[invoice.status].text}`}>
                          <StatusIcon className="h-3.5 w-3.5 mr-1" />
                          {statusLabels[invoice.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">
                            {new Date(invoice.issue_date).toLocaleDateString('de-DE')}
                          </p>
                          {invoice.due_date && (
                            <p className="text-gray-500">
                              Fällig: {new Date(invoice.due_date).toLocaleDateString('de-DE')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(invoice.total_amount, invoice.currency)}
                        </p>
                        {invoice.tax_amount > 0 && (
                          <p className="text-xs text-gray-500">
                            inkl. {formatCurrency(invoice.tax_amount, invoice.currency)} MwSt.
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/dashboard/invoices/${invoice.id}`}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Ansehen"
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
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Versuchen Sie andere Suchkriterien'
              : 'Sie haben noch keine Rechnungen erhalten'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
