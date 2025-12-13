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
  Euro,
  Calendar,
  FolderKanban,
  Percent,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { InvoiceStatus, PMProject } from '@/types/dashboard';

const statusOptions: { value: InvoiceStatus; label: string }[] = [
  { value: 'draft', label: 'Entwurf' },
  { value: 'sent', label: 'Gesendet' },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProjectId = searchParams.get('project');

  const { user, isManagerOrAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<PMProject[]>([]);

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState('19');
  const [status, setStatus] = useState<InvoiceStatus>('draft');
  const [projectId, setProjectId] = useState(preselectedProjectId || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  // Calculate tax and total
  const netAmount = parseFloat(amount) || 0;
  const taxAmount = netAmount * (parseFloat(taxRate) / 100);
  const totalAmount = netAmount + taxAmount;

  useEffect(() => {
    const fetchProjects = async () => {
      if (!isManagerOrAdmin || authLoading) return;

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
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchProjects();
  }, [authLoading, isManagerOrAdmin, supabase]);

  useEffect(() => {
    if (!authLoading && !isManagerOrAdmin) {
      router.push('/dashboard/invoices');
    }
  }, [authLoading, isManagerOrAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !projectId || netAmount <= 0) return;

    setLoading(true);
    setError(null);

    try {
      const invoiceData = {
        invoice_number: invoiceNumber,
        title: title.trim(),
        description: description.trim() || null,
        amount: netAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: 'EUR',
        status,
        project_id: projectId,
        issue_date: issueDate,
        due_date: dueDate || null,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/dashboard/invoices/${data.id}`);
    } catch (err: unknown) {
      console.error('Error creating invoice:', err);
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Erstellen der Rechnung';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isManagerOrAdmin) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link href="/dashboard/invoices" className="text-gray-500 hover:text-primary-600 transition-colors">
          Rechnungen
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Neue Rechnung</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neue Rechnung erstellen</h1>
          <p className="text-gray-600">Erstellen Sie eine neue Rechnung für ein Projekt</p>
        </div>
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Link>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Invoice Number (auto-generated) */}
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
              placeholder="Leistungsbeschreibung..."
            />
          </div>

          {/* Project */}
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
              Projekt *
            </label>
            <div className="relative">
              <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                id="project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              >
                <option value="">Projekt auswählen</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Tax */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Nettobetrag *
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-2">
                MwSt.-Satz
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="taxRate"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                >
                  <option value="0">0%</option>
                  <option value="7">7%</option>
                  <option value="19">19%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calculated Amounts */}
          {netAmount > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Netto:</span>
                <span className="text-gray-900">{formatCurrency(netAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">MwSt. ({taxRate}%):</span>
                <span className="text-gray-900">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                <span className="text-gray-700">Gesamt:</span>
                <span className="text-primary-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fällig am
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
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading || !title.trim() || !projectId || netAmount <= 0}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Erstelle Rechnung...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Rechnung erstellen
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
