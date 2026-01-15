'use client';

import { motion } from 'framer-motion';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import type { InvoiceLineItem } from '@/types/dashboard';

export interface LineItemForm {
  id: string;
  name: string;
  description: string;
  quantity: string;
  unit_name: string;
  unit_price: string;
  tax_rate: '0' | '7' | '19';
}

export const createEmptyLineItem = (): LineItemForm => ({
  id: Math.random().toString(36).substring(7),
  name: '',
  description: '',
  quantity: '1',
  unit_name: 'Stueck',
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

interface LineItemsEditorProps {
  items: LineItemForm[];
  onChange: (items: LineItemForm[]) => void;
  readOnly?: boolean;
}

export function calculateLineItemTotal(item: LineItemForm): number {
  const quantity = parseFloat(item.quantity) || 0;
  const unitPrice = parseFloat(item.unit_price) || 0;
  return quantity * unitPrice;
}

export function calculateLineItemTax(item: LineItemForm): number {
  const total = calculateLineItemTotal(item);
  const taxRate = parseInt(item.tax_rate) || 0;
  return total * (taxRate / 100);
}

export function calculateTotals(items: LineItemForm[]) {
  const netAmount = items.reduce((sum, item) => sum + calculateLineItemTotal(item), 0);
  const taxAmount = items.reduce((sum, item) => sum + calculateLineItemTax(item), 0);
  const totalAmount = netAmount + taxAmount;
  return { netAmount, taxAmount, totalAmount };
}

export function prepareLineItemsForApi(items: LineItemForm[]): InvoiceLineItem[] {
  return items.map(item => ({
    name: item.name.trim(),
    description: item.description.trim() || undefined,
    quantity: parseFloat(item.quantity) || 1,
    unit_name: item.unit_name,
    unit_price: parseFloat(item.unit_price) || 0,
    tax_rate: parseInt(item.tax_rate) as 0 | 7 | 19,
  }));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export default function LineItemsEditor({ items, onChange, readOnly = false }: LineItemsEditorProps) {
  const addLineItem = () => {
    onChange([...items, createEmptyLineItem()]);
  };

  const removeLineItem = (id: string) => {
    if (items.length <= 1) return;
    onChange(items.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItemForm, value: string) => {
    onChange(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Positionen *
        </label>
        {!readOnly && (
          <button
            type="button"
            onClick={addLineItem}
            className="inline-flex items-center px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Position hinzufuegen
          </button>
        )}
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Position {index + 1}</span>
              {!readOnly && items.length > 1 && (
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
                  disabled={readOnly}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  placeholder="Beschreibung (optional)"
                  disabled={readOnly}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={readOnly}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Einheit</label>
                <div className="relative">
                  <select
                    value={item.unit_name}
                    onChange={(e) => updateLineItem(item.id, 'unit_name', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-3 py-2 pr-8 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={readOnly}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Tax Rate */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">MwSt.</label>
                <div className="relative">
                  <select
                    value={item.tax_rate}
                    onChange={(e) => updateLineItem(item.id, 'tax_rate', e.target.value as '0' | '7' | '19')}
                    disabled={readOnly}
                    className="w-full px-3 py-2 pr-8 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
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
  );
}
