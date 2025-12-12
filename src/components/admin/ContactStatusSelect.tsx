'use client';

import { useState } from 'react';
import type { ContactRequestStatus } from '@/types/contact';

interface ContactStatusSelectProps {
  requestId: string;
  currentStatus: ContactRequestStatus;
  onStatusChange?: (newStatus: ContactRequestStatus) => void;
}

const STATUS_OPTIONS: { value: ContactRequestStatus; label: string; color: string }[] = [
  { value: 'neu', label: 'Neu', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_bearbeitung', label: 'In Bearbeitung', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'erledigt', label: 'Erledigt', color: 'bg-green-100 text-green-800' },
];

export default function ContactStatusSelect({
  requestId,
  currentStatus,
  onStatusChange,
}: ContactStatusSelectProps) {
  const [status, setStatus] = useState<ContactRequestStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ContactRequestStatus;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/anfragen/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }
    } catch (err) {
      console.error('Status-Update fehlgeschlagen:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentOption = STATUS_OPTIONS.find(opt => opt.value === status);

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${currentOption?.color || ''} ${loading ? 'opacity-50' : ''}`}
    >
      {STATUS_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
