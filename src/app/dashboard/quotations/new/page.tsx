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
  Plus,
  Trash2,
  Send,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Select from '@/components/ui/Select';
import type { PMProject, InvoiceLineItem } from '@/types/dashboard';

interface LineItemForm {
  id: string;
  name: string;
  description: string;
  quantity: string;
  unit_name: string;
  unit_price: string;
  tax_rate: '0' | '7' | '19';
}

const createEmptyLineItem = (): LineItemForm => ({
  id: Math.random().toString(36).substring(7),
  name: '',
  description: '',
  quantity: '1',
  unit_name: 'Stück',
  unit_price: '',
  tax_rate: '19',
});

const unitOptions = [
  { value: 'Stueck', label: 'Stueck' },
  { value: 'Stunde', label: 'Stunde' },
  { value: 'Tag', label: 'Tag' },
  { value: 'Monat', label: 'Monat' },
  { value: 'Pauschal', label: 'Pauschal' },
];

export default function NewQuotationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProjectId = searchParams.get('project');

  const { user, isManagerOrAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [sendingToLexoffice, setSendingToLexoffice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<PMProject[]>([]);

  // Form state
  const [quotationNumber, setQuotationNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(preselectedProjectId || '');
  const [validUntil, setValidUntil] = useState('');
  const [lineItems, setLineItems] = useState<LineItemForm[]>([createEmptyLineItem()]);

  // Calculate totals
  const calculateLineItemTotal = (item: LineItemForm) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return quantity * unitPrice;
  };

  const calculateLineItemTax = (item: LineItemForm) => {
    const total = calculateLineItemTotal(item);
    const taxRate = parseInt(item.tax_rate) || 0;
    return total * (taxRate / 100);
  };

  const netAmount = lineItems.reduce((sum, item) => sum + calculateLineItemTotal(item), 0);
  const taxAmount = lineItems.reduce((sum, item) => sum + calculateLineItemTax(item), 0);
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

        // Generate quotation number
        const { count } = await supabase
          .from('quotations')
          .select('*', { count: 'exact', head: true });

        const year = new Date().getFullYear();
        const nextNumber = (count || 0) + 1;
        setQuotationNumber(`AN-${year}-${String(nextNumber).padStart(4, '0')}`);

        // Set default valid_until (30 days from now)
        const defaultValidUntil = new Date();
        defaultValidUntil.setDate(defaultValidUntil.getDate() + 30);
        setValidUntil(defaultValidUntil.toISOString().split('T')[0]);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchProjects();
  }, [authLoading, isManagerOrAdmin, supabase]);

  useEffect(() => {
    if (!authLoading && !isManagerOrAdmin) {
      router.push('/dashboard/quotations');
    }
  }, [authLoading, isManagerOrAdmin, router]);

  const addLineItem = () => {
    setLineItems([...lineItems, createEmptyLineItem()]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItemForm, value: string) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

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

  const prepareLineItems = (): InvoiceLineItem[] => {
    return lineItems.map(item => ({
      name: item.name.trim(),
      description: item.description.trim() || undefined,
      quantity: parseFloat(item.quantity) || 1,
      unit_name: item.unit_name,
      unit_price: parseFloat(item.unit_price) || 0,
      tax_rate: parseInt(item.tax_rate) as 0 | 7 | 19,
    }));
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
      const quotationData = {
        quotation_number: quotationNumber,
        title: title.trim(),
        description: description.trim() || null,
        project_id: projectId,
        line_items: prepareLineItems(),
        net_amount: netAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: 'EUR',
        status: sendToLexoffice ? 'sent' : 'draft',
        valid_until: validUntil || null,
        send_to_lexoffice: sendToLexoffice,
      };

      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen des Angebots');
      }

      router.push(`/dashboard/quotations/${data.quotation.id}`);
    } catch (err: unknown) {
      console.error('Error creating quotation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Erstellen des Angebots';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setSendingToLexoffice(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link href="/dashboard/quotations" className="text-gray-500 hover:text-primary-600 transition-colors">
          Angebote
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Neues Angebot</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neues Angebot erstellen</h1>
          <p className="text-gray-600">Erstellen Sie ein neues Angebot fuer ein Projekt</p>
        </div>
        <Link
          href="/dashboard/quotations"
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
            {/* Quotation Number */}
            <div>
              <label htmlFor="quotationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Angebotsnummer
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="quotationNumber"
                  type="text"
                  value={quotationNumber}
                  onChange={(e) => setQuotationNumber(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Valid Until */}
            <div>
              <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-2">
                Gueltig bis
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
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
              placeholder="z.B. Website Redesign Angebot"
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
              placeholder="Allgemeine Beschreibung des Angebots..."
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Positionen *
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Position hinzufuegen
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">Position {index + 1}</span>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                        placeholder="Bezeichnung *"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Beschreibung (optional)"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Menge</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Einheit</label>
                      <div className="relative">
                        <select
                          value={item.unit_name}
                          onChange={(e) => updateLineItem(item.id, 'unit_name', e.target.value)}
                          className="w-full px-3 py-2 pr-8 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm appearance-none cursor-pointer"
                        >
                          {unitOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Einzelpreis (EUR) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(item.id, 'unit_price', e.target.value)}
                        placeholder="0,00"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm"
                      />
                    </div>

                    {/* Tax Rate */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">MwSt.</label>
                      <div className="relative">
                        <select
                          value={item.tax_rate}
                          onChange={(e) => updateLineItem(item.id, 'tax_rate', e.target.value as '0' | '7' | '19')}
                          className="w-full px-3 py-2 pr-8 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm appearance-none cursor-pointer"
                        >
                          <option value="0">0%</option>
                          <option value="7">7%</option>
                          <option value="19">19%</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Line Item Total */}
                  <div className="mt-3 pt-3 border-t border-gray-200 text-right">
                    <span className="text-sm text-gray-500">Summe: </span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(calculateLineItemTotal(item) + calculateLineItemTax(item))}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

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
