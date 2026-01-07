'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Send,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { Quotation, QuotationStatus } from '@/types/dashboard';

const statusOptions: { value: QuotationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle Status' },
  { value: 'draft', label: 'Entwurf' },
  { value: 'sent', label: 'Gesendet' },
  { value: 'accepted', label: 'Angenommen' },
  { value: 'rejected', label: 'Abgelehnt' },
  { value: 'expired', label: 'Abgelaufen' },
];

const statusColors: Record<QuotationStatus, { bg: string; text: string; icon: React.ElementType }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600', icon: FileText },
  sent: { bg: 'bg-blue-100', text: 'text-blue-600', icon: Send },
  accepted: { bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle },
  rejected: { bg: 'bg-red-100', text: 'text-red-600', icon: XCircle },
  expired: { bg: 'bg-amber-100', text: 'text-amber-600', icon: AlertCircle },
};

const statusLabels: Record<QuotationStatus, string> = {
  draft: 'Entwurf',
  sent: 'Gesendet',
  accepted: 'Angenommen',
  rejected: 'Abgelehnt',
  expired: 'Abgelaufen',
};

export default function QuotationsPage() {
  const { user, isManagerOrAdmin } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'all'>('all');

  useEffect(() => {
    const fetchQuotations = async () => {
      if (!user) return;

      const supabase = createClient();

      try {
        let query = supabase
          .from('quotations')
          .select(`
            *,
            project:pm_projects(id, name, client_id)
          `)
          .order('created_at', { ascending: false });

        // Filter by status
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Search
        if (searchQuery) {
          query = query.or(`quotation_number.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        setQuotations(data || []);
      } catch (error) {
        console.error('Error fetching quotations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
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
          <h1 className="text-2xl font-bold text-gray-900">Angebote</h1>
          <p className="text-gray-600">
            Angebote erstellen und verwalten
          </p>
        </div>

        {isManagerOrAdmin && (
          <Link
            href="/dashboard/quotations/new"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Neues Angebot
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'Gesamt',
            value: quotations.length,
            icon: ClipboardList,
            color: 'bg-gray-100 text-gray-600',
          },
          {
            label: 'Entwuerfe',
            value: quotations.filter(q => q.status === 'draft').length,
            icon: FileText,
            color: 'bg-gray-100 text-gray-600',
          },
          {
            label: 'Gesendet',
            value: quotations.filter(q => q.status === 'sent').length,
            icon: Send,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Angenommen',
            value: quotations.filter(q => q.status === 'accepted').length,
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Abgelehnt',
            value: quotations.filter(q => q.status === 'rejected').length,
            icon: XCircle,
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
            placeholder="Angebotsnummer oder Titel suchen..."
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
            onChange={(e) => setStatusFilter(e.target.value as QuotationStatus | 'all')}
            className="pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors appearance-none"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      {quotations.length > 0 ? (
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
                    Angebot
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Projekt
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Gueltig bis
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
                {quotations.map((quotation, index) => {
                  const StatusIcon = statusColors[quotation.status].icon;
                  const isExpired = quotation.valid_until && new Date(quotation.valid_until) < new Date() && quotation.status === 'sent';
                  return (
                    <motion.tr
                      key={quotation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{quotation.quotation_number}</p>
                          <p className="text-sm text-gray-500">{quotation.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">
                          {(quotation as Quotation & { project?: { name: string } }).project?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          isExpired
                            ? 'bg-amber-100 text-amber-600'
                            : `${statusColors[quotation.status].bg} ${statusColors[quotation.status].text}`
                        }`}>
                          {isExpired ? (
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                          ) : (
                            <StatusIcon className="h-3.5 w-3.5 mr-1" />
                          )}
                          {isExpired ? 'Abgelaufen' : statusLabels[quotation.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {quotation.valid_until ? (
                            <p className={`${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(quotation.valid_until).toLocaleDateString('de-DE')}
                            </p>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(quotation.total_amount, quotation.currency)}
                        </p>
                        {quotation.tax_amount > 0 && (
                          <p className="text-xs text-gray-500">
                            inkl. {formatCurrency(quotation.tax_amount, quotation.currency)} MwSt.
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/dashboard/quotations/${quotation.id}`}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Ansehen"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {quotation.pdf_url && (
                            <a
                              href={quotation.pdf_url}
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
          <ClipboardList className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Angebote gefunden</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Versuchen Sie andere Suchkriterien'
              : 'Es wurden noch keine Angebote erstellt'}
          </p>
          {isManagerOrAdmin && (
            <Link
              href="/dashboard/quotations/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Erstes Angebot erstellen
            </Link>
          )}
        </motion.div>
      )}
    </div>
  );
}
