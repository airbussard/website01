'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  FolderKanban,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Invoice, InvoiceStatus } from '@/types/dashboard';

const statusColors: Record<InvoiceStatus, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: FileText },
  sent: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Clock },
  paid: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
  overdue: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', icon: XCircle },
};

const statusLabels: Record<InvoiceStatus, string> = {
  draft: 'Entwurf',
  sent: 'Gesendet',
  paid: 'Bezahlt',
  overdue: 'Überfällig',
  cancelled: 'Storniert',
};

type InvoiceWithRelations = Invoice & {
  project?: { id: string; name: string; client_id: string };
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!user || authLoading) return;

      try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }
        const data = await response.json();
        setInvoice(data.invoice);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [user, authLoading, invoiceId]);

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Rechnung nicht gefunden</h2>
        <p className="text-gray-500 mb-4">Die angeforderte Rechnung existiert nicht oder Sie haben keinen Zugriff.</p>
        <Link href="/dashboard/invoices" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu Rechnungen
        </Link>
      </div>
    );
  }

  const StatusIcon = statusColors[invoice.status].icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link href="/dashboard/invoices" className="text-gray-500 hover:text-primary-600 transition-colors">
          Rechnungen
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{invoice.invoice_number}</span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${statusColors[invoice.status].bg} ${statusColors[invoice.status].text} ${statusColors[invoice.status].border}`}>
                <StatusIcon className="h-4 w-4 mr-1.5" />
                {statusLabels[invoice.status]}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{invoice.invoice_number}</h1>
            <p className="text-lg text-gray-700">{invoice.title}</p>
            {invoice.description && (
              <p className="text-gray-500 mt-2">{invoice.description}</p>
            )}
          </div>

          {invoice.pdf_url && (
            <a
              href={invoice.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              PDF herunterladen
            </a>
          )}
        </div>

        {/* Beträge */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Nettobetrag</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(invoice.amount, invoice.currency)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">MwSt.</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(invoice.tax_amount, invoice.currency)}
              </p>
            </div>
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm text-primary-600 mb-1">Gesamtbetrag</p>
              <p className="text-2xl font-bold text-primary-700">
                {formatCurrency(invoice.total_amount, invoice.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          {invoice.project && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FolderKanban className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Projekt</p>
                <Link
                  href={`/dashboard/projects/${invoice.project.id}`}
                  className="font-medium text-gray-900 hover:text-primary-600"
                >
                  {invoice.project.name}
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rechnungsdatum</p>
              <p className="font-medium text-gray-900">
                {new Date(invoice.issue_date).toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>

          {invoice.due_date && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Fällig am</p>
                <p className="font-medium text-gray-900">
                  {new Date(invoice.due_date).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
          )}

          {invoice.paid_at && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bezahlt am</p>
                <p className="font-medium text-gray-900">
                  {new Date(invoice.paid_at).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Zurueck-Link */}
      <div className="text-center">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurueck zu meinen Rechnungen
        </Link>
      </div>
    </div>
  );
}
