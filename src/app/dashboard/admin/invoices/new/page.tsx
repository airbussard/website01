'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Calendar,
  FolderKanban,
  Send,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Select from '@/components/ui/Select';
import LineItemsEditor, {
  LineItemForm,
  createEmptyLineItem,
  calculateTotals,
  prepareLineItemsForApi,
  formatCurrency,
} from '@/components/shared/LineItemsEditor';
import type { PMProject } from '@/types/dashboard';

export default function AdminNewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProjectId = searchParams.get('project');

  const { user, isAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [sendingToLexoffice, setSendingToLexoffice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<PMProject[]>([]);

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(preselectedProjectId || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItemForm[]>([createEmptyLineItem()]);

  // Calculate totals
  const { netAmount, taxAmount, totalAmount } = calculateTotals(lineItems);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!isAdmin || authLoading) return;

      try {
        const { data, error } = await supabase
          .from('pm_projects')
          .select('id, name')
          .order('name');

        if (error) throw error;
        if (data) setProjects(data);

        // Generate invoice number
        const { count } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true });

        const year = new Date().getFullYear();
        const nextNumber = (count || 0) + 1;
        setInvoiceNumber(`RE-${year}-${String(nextNumber).padStart(4, '0')}`);

        // Set default due date (14 days from now)
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 14);
        setDueDate(defaultDueDate.toISOString().split('T')[0]);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchProjects();
  }, [authLoading, isAdmin, supabase]);

  const validateForm = () => {
    if (!title.trim()) return 'Bitte geben Sie einen Titel ein';
    if (!projectId) return 'Bitte waehlen Sie ein Projekt aus';
    if (lineItems.length === 0) return 'Bitte fuegen Sie mindestens eine Position hinzu';

    for (const item of lineItems) {
      if (!item.name.trim()) return 'Alle Positionen muessen einen Namen haben';
      if (!item.unit_price || parseFloat(item.unit_price) <= 0) {
        return 'Alle Positionen muessen einen gueltigen Preis haben';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent, sendToLexoffice: boolean = false) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (sendToLexoffice) {
      setSendingToLexoffice(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const invoiceData = {
        invoice_number: invoiceNumber,
        title: title.trim(),
        description: description.trim() || null,
        project_id: projectId,
        line_items: prepareLineItemsForApi(lineItems),
        amount: netAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: 'EUR',
        status: sendToLexoffice ? 'sent' : 'draft',
        issue_date: issueDate,
        due_date: dueDate || null,
        sync_to_lexoffice: sendToLexoffice,
        finalize_in_lexoffice: sendToLexoffice,
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Rechnung');
      }

      router.push(`/dashboard/admin/invoices/${data.invoice.id}`);
    } catch (err: unknown) {
      console.error('Error creating invoice:', err);
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Erstellen der Rechnung';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setSendingToLexoffice(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link href="/dashboard/admin/invoices" className="text-gray-500 hover:text-primary-600 transition-colors">
          Rechnungsverwaltung
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Neue Rechnung</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neue Rechnung erstellen</h1>
          <p className="text-gray-600">Erstellen Sie eine neue Rechnung fuer ein Projekt</p>
        </div>
        <Link
          href="/dashboard/admin/invoices"
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurueck
        </Link>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Invoice Number */}
            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Rechnungsnummer
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="invoiceNumber"
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Issue Date */}
            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Rechnungsdatum *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Titel *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="z.B. Webentwicklung Mai 2024"
            />
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Projekt *
            </label>
            <Select
              value={projectId}
              onChange={setProjectId}
              options={[
                { value: '', label: 'Projekt auswaehlen' },
                ...projects.map((project) => ({ value: project.id, label: project.name })),
              ]}
              icon={<FolderKanban className="h-5 w-5" />}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Beschreibung
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              placeholder="Allgemeine Beschreibung der Rechnung..."
            />
          </div>

          {/* Line Items */}
          <LineItemsEditor
            items={lineItems}
            onChange={setLineItems}
          />

          {/* Totals */}
          {netAmount > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Netto:</span>
                <span className="text-gray-900">{formatCurrency(netAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">MwSt.:</span>
                <span className="text-gray-900">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                <span className="text-gray-700">Gesamt:</span>
                <span className="text-primary-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Faellig am
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <button
              type="submit"
              disabled={loading || sendingToLexoffice}
              className="w-full flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Speichere...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Als Entwurf speichern
                </>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
              disabled={loading || sendingToLexoffice}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {sendingToLexoffice ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Sende an Lexoffice...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Speichern und an Lexoffice senden
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
