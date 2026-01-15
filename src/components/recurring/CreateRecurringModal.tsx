'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  RefreshCw,
  FolderKanban,
  Calendar,
  Loader2,
  Plus,
  Trash2,
  Bell,
  Send,
  ChevronDown,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Select from '@/components/ui/Select';
import type { PMProject, RecurringInvoice, RecurringInterval, InvoiceLineItem } from '@/types/dashboard';

interface CreateRecurringModalProps {
  onClose: () => void;
  onCreated: (recurring: RecurringInvoice) => void;
}

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
  unit_name: 'Stueck',
  unit_price: '',
  tax_rate: '19',
});

const intervalOptions = [
  { value: 'monthly', label: 'Monatlich' },
  { value: 'quarterly', label: 'Vierteljaehrlich' },
  { value: 'yearly', label: 'Jaehrlich' },
];

const unitOptions = [
  { value: 'Stueck', label: 'Stueck' },
  { value: 'Stunde', label: 'Stunde' },
  { value: 'Tag', label: 'Tag' },
  { value: 'Monat', label: 'Monat' },
  { value: 'Pauschal', label: 'Pauschal' },
];

export default function CreateRecurringModal({
  onClose,
  onCreated,
}: CreateRecurringModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<PMProject[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [intervalType, setIntervalType] = useState<RecurringInterval>('monthly');
  const [intervalValue, setIntervalValue] = useState('1');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [autoSend, setAutoSend] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [lineItems, setLineItems] = useState<LineItemForm[]>([createEmptyLineItem()]);

  // Calculate totals
  const calculateLineItemTotal = (item: LineItemForm) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return quantity * unitPrice;
  };

  const netAmount = lineItems.reduce((sum, item) => sum + calculateLineItemTotal(item), 0);
  const primaryTaxRate = lineItems[0]?.tax_rate ? parseInt(lineItems[0].tax_rate) : 19;
  const taxAmount = netAmount * (primaryTaxRate / 100);
  const totalAmount = netAmount + taxAmount;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('pm_projects')
          .select('id, name')
          .order('name');

        if (error) throw error;
        if (data) setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };

    fetchProjects();
  }, [supabase]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Bitte geben Sie einen Titel ein');
      return;
    }

    if (!projectId) {
      setError('Bitte waehlen Sie ein Projekt aus');
      return;
    }

    for (const item of lineItems) {
      if (!item.name.trim()) {
        setError('Alle Positionen muessen einen Namen haben');
        return;
      }
      if (!item.unit_price || parseFloat(item.unit_price) <= 0) {
        setError('Alle Positionen muessen einen gueltigen Preis haben');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/recurring-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          project_id: projectId,
          line_items: prepareLineItems(),
          net_amount: netAmount,
          tax_rate: primaryTaxRate,
          interval_type: intervalType,
          interval_value: parseInt(intervalValue) || 1,
          start_date: startDate,
          end_date: hasEndDate && endDate ? endDate : null,
          next_invoice_date: startDate,
          auto_send: autoSend,
          send_notification: sendNotification,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen');
      }

      onCreated(data.recurring_invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <RefreshCw className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Wiederkehrende Rechnung erstellen
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="z.B. Monatliche Wartung"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschreibung
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Optionale Beschreibung..."
            />
          </div>

          {/* Interval Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervall
              </label>
              <Select
                value={intervalType}
                onChange={(val) => setIntervalType(val as RecurringInterval)}
                options={intervalOptions}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alle X Intervalle
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={intervalValue}
                onChange={(e) => setIntervalValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Startdatum *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Enddatum
                </label>
                <label className="flex items-center text-sm text-gray-500">
                  <input
                    type="checkbox"
                    checked={hasEndDate}
                    onChange={(e) => setHasEndDate(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Begrenzt
                </label>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!hasEndDate}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Positionen *
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center px-2 py-1 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Plus className="h-3 w-3 mr-1" />
                Hinzufuegen
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Position {index + 1}</span>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                      placeholder="Bezeichnung *"
                      className="col-span-2 w-full px-3 py-1.5 rounded border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                      placeholder="Menge"
                      className="w-full px-3 py-1.5 rounded border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    <div className="relative">
                      <select
                        value={item.unit_name}
                        onChange={(e) => updateLineItem(item.id, 'unit_name', e.target.value)}
                        className="w-full px-3 py-1.5 pr-8 rounded border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none cursor-pointer"
                      >
                        {unitOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(item.id, 'unit_price', e.target.value)}
                      placeholder="Preis EUR *"
                      className="w-full px-3 py-1.5 rounded border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    <div className="relative">
                      <select
                        value={item.tax_rate}
                        onChange={(e) => updateLineItem(item.id, 'tax_rate', e.target.value as '0' | '7' | '19')}
                        className="w-full px-3 py-1.5 pr-8 rounded border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none cursor-pointer"
                      >
                        <option value="0">0% MwSt.</option>
                        <option value="7">7% MwSt.</option>
                        <option value="19">19% MwSt.</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          {netAmount > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Netto:</span>
                <span className="text-gray-900">{formatCurrency(netAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">MwSt. ({primaryTaxRate}%):</span>
                <span className="text-gray-900">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-200 pt-1">
                <span className="text-gray-700">Gesamt:</span>
                <span className="text-primary-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoSend}
                onChange={(e) => setAutoSend(e.target.checked)}
                className="mr-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex items-center space-x-2">
                <Send className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">Automatisch an Lexoffice senden</span>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                className="mr-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">E-Mail-Benachrichtigung bei Generierung</span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !projectId}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Erstelle...
                </>
              ) : (
                'Erstellen'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
