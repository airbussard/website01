'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Loader2,
  FolderKanban,
  User,
  AlertCircle,
  RefreshCw,
  Link2,
  Receipt,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { Quotation, QuotationStatus, InvoiceLineItem } from '@/types/dashboard';

const statusColors: Record<QuotationStatus, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: FileText },
  sent: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Send },
  accepted: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
  expired: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: AlertCircle },
};

const statusLabels: Record<QuotationStatus, string> = {
  draft: 'Entwurf',
  sent: 'Gesendet',
  accepted: 'Angenommen',
  rejected: 'Abgelehnt',
  expired: 'Abgelaufen',
};

type QuotationWithRelations = Quotation & {
  project?: { id: string; name: string; client_id: string };
  creator?: { full_name: string; email: string };
};

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;
  const { user, isManagerOrAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [quotation, setQuotation] = useState<QuotationWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sendingToLexoffice, setSendingToLexoffice] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const fetchQuotation = async () => {
      if (!user || authLoading) return;

      try {
        const { data, error } = await supabase
          .from('quotations')
          .select(`
            *,
            project:pm_projects(id, name, client_id),
            creator:profiles(full_name, email)
          `)
          .eq('id', quotationId)
          .single();

        if (error) throw error;
        setQuotation(data);
      } catch (error) {
        console.error('Error fetching quotation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [user, authLoading, quotationId, supabase]);

  const updateStatus = async (newStatus: QuotationStatus) => {
    if (!quotation || !isManagerOrAdmin) return;

    setUpdating(true);
    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      } else if (newStatus === 'rejected') {
        updateData.rejected_at = new Date().toISOString();
      } else if (newStatus === 'sent') {
        updateData.sent_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('quotations')
        .update(updateData)
        .eq('id', quotation.id);

      if (error) throw error;
      setQuotation({
        ...quotation,
        status: newStatus,
        accepted_at: newStatus === 'accepted' ? new Date().toISOString() : quotation.accepted_at,
        rejected_at: newStatus === 'rejected' ? new Date().toISOString() : quotation.rejected_at,
        sent_at: newStatus === 'sent' ? new Date().toISOString() : quotation.sent_at,
      });
    } catch (error) {
      console.error('Error updating quotation:', error);
    } finally {
      setUpdating(false);
    }
  };

  const sendToLexoffice = async () => {
    if (!quotation || !isManagerOrAdmin) return;

    setSendingToLexoffice(true);
    try {
      const response = await fetch(`/api/quotations/${quotation.id}/send-to-lexoffice`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Senden an Lexoffice');
      }

      setQuotation({
        ...quotation,
        lexoffice_id: data.lexoffice_id,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending to Lexoffice:', error);
      alert(error instanceof Error ? error.message : 'Fehler beim Senden an Lexoffice');
    } finally {
      setSendingToLexoffice(false);
    }
  };

  const deleteQuotation = async () => {
    if (!quotation || !isManagerOrAdmin || !confirm('Angebot wirklich loeschen?')) return;

    try {
      const { error } = await supabase.from('quotations').delete().eq('id', quotation.id);
      if (error) throw error;
      router.push('/dashboard/quotations');
    } catch (error) {
      console.error('Error deleting quotation:', error);
    }
  };

  const convertToInvoice = async () => {
    if (!quotation || !isManagerOrAdmin) return;
    if (!confirm('Angebot in Rechnung umwandeln? Das Angebot wird als "Angenommen" markiert.')) return;

    setConverting(true);
    try {
      const response = await fetch(`/api/quotations/${quotation.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ set_accepted: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Konvertieren');
      }

      // Zur neuen Rechnung navigieren
      router.push(`/dashboard/admin/invoices/${data.invoice.id}`);
    } catch (error) {
      console.error('Error converting quotation:', error);
      alert(error instanceof Error ? error.message : 'Fehler beim Konvertieren');
    } finally {
      setConverting(false);
    }
  };

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

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Angebot nicht gefunden</h2>
        <p className="text-gray-500 mb-4">Das angeforderte Angebot existiert nicht oder Sie haben keinen Zugriff.</p>
        <Link href="/dashboard/quotations" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurueck zu Angeboten
        </Link>
      </div>
    );
  }

  const StatusIcon = statusColors[quotation.status].icon;
  const isExpired = quotation.valid_until && new Date(quotation.valid_until) < new Date() && quotation.status === 'sent';
  const lineItems = quotation.line_items as InvoiceLineItem[];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link href="/dashboard/quotations" className="text-gray-500 hover:text-primary-600 transition-colors">
          Angebote
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{quotation.quotation_number}</span>
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
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${
                isExpired
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : `${statusColors[quotation.status].bg} ${statusColors[quotation.status].text} ${statusColors[quotation.status].border}`
              }`}>
                {isExpired ? (
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                ) : (
                  <StatusIcon className="h-4 w-4 mr-1.5" />
                )}
                {isExpired ? 'Abgelaufen' : statusLabels[quotation.status]}
              </span>
              {quotation.lexoffice_id && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                  <Link2 className="h-3 w-3 mr-1" />
                  Lexoffice
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{quotation.quotation_number}</h1>
            <p className="text-lg text-gray-700">{quotation.title}</p>
            {quotation.description && (
              <p className="text-gray-500 mt-2">{quotation.description}</p>
            )}
          </div>

          {isManagerOrAdmin && (
            <div className="flex items-center gap-2">
              {quotation.pdf_url && (
                <a
                  href={quotation.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="PDF herunterladen"
                >
                  <Download className="h-5 w-5" />
                </a>
              )}
              {quotation.status === 'draft' && !quotation.lexoffice_id && (
                <button
                  onClick={sendToLexoffice}
                  disabled={sendingToLexoffice}
                  className="inline-flex items-center px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  title="An Lexoffice senden"
                >
                  {sendingToLexoffice ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Send className="h-4 w-4 mr-1.5" />
                  )}
                  An Lexoffice
                </button>
              )}
              {['sent', 'accepted'].includes(quotation.status) && (
                <button
                  onClick={convertToInvoice}
                  disabled={converting}
                  className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  title="In Rechnung umwandeln"
                >
                  {converting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Receipt className="h-4 w-4 mr-1.5" />
                  )}
                  In Rechnung
                </button>
              )}
              <button
                onClick={deleteQuotation}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Loeschen"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Betraege */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Nettobetrag</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(quotation.net_amount, quotation.currency)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">MwSt.</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(quotation.tax_amount, quotation.currency)}
              </p>
            </div>
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm text-primary-600 mb-1">Gesamtbetrag</p>
              <p className="text-2xl font-bold text-primary-700">
                {formatCurrency(quotation.total_amount, quotation.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          {quotation.project && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FolderKanban className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Projekt</p>
                <Link
                  href={`/dashboard/projects/${quotation.project.id}`}
                  className="font-medium text-gray-900 hover:text-primary-600"
                >
                  {quotation.project.name}
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Erstellt am</p>
              <p className="font-medium text-gray-900">
                {new Date(quotation.created_at).toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>

          {quotation.valid_until && (
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${isExpired ? 'bg-red-100' : 'bg-orange-100'}`}>
                <Clock className={`h-5 w-5 ${isExpired ? 'text-red-600' : 'text-orange-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Gueltig bis</p>
                <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                  {new Date(quotation.valid_until).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
          )}

          {quotation.accepted_at && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Angenommen am</p>
                <p className="font-medium text-gray-900">
                  {new Date(quotation.accepted_at).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
          )}

          {quotation.rejected_at && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Abgelehnt am</p>
                <p className="font-medium text-gray-900">
                  {new Date(quotation.rejected_at).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
          )}

          {quotation.creator && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Erstellt von</p>
                <p className="font-medium text-gray-900">{quotation.creator.full_name}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Line Items */}
      {lineItems && lineItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Positionen</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Menge</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Einzelpreis</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">MwSt.</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Gesamt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lineItems.map((item, index) => {
                  const itemTotal = item.quantity * item.unit_price;
                  const itemTax = itemTotal * (item.tax_rate / 100);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500">{item.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {item.quantity} {item.unit_name}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {item.tax_rate}%
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(itemTotal + itemTax)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Status aendern (nur fuer Manager/Admin) */}
      {isManagerOrAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status aendern</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(statusLabels) as QuotationStatus[]).map((status) => {
              const StatusBtnIcon = statusColors[status].icon;
              return (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={updating || quotation.status === status}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quotation.status === status
                      ? `${statusColors[status].bg} ${statusColors[status].text} border ${statusColors[status].border}`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  <StatusBtnIcon className="h-4 w-4 mr-1.5" />
                  {statusLabels[status]}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Lexoffice Sync Status */}
      {quotation.lexoffice_id && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lexoffice Synchronisation</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Mit Lexoffice synchronisiert</span>
            </div>
            {quotation.synced_at && (
              <span className="text-sm text-gray-500">
                Letzte Sync: {new Date(quotation.synced_at).toLocaleString('de-DE')}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Lexoffice ID: {quotation.lexoffice_id}
          </p>
        </motion.div>
      )}

      {/* Zurueck-Link */}
      <div className="text-center">
        <Link
          href="/dashboard/quotations"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurueck zu allen Angeboten
        </Link>
      </div>
    </div>
  );
}
