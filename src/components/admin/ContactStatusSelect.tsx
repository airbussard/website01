'use client';

import { useState } from 'react';
import Select from '@/components/ui/Select';
import type { ContactRequestStatus } from '@/types/contact';

interface ContactStatusSelectProps {
  requestId: string;
  currentStatus: ContactRequestStatus;
  onStatusChange?: (newStatus: ContactRequestStatus) => void;
}

const STATUS_OPTIONS = [
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

  const handleChange = async (newStatus: string) => {
    const newStatusTyped = newStatus as ContactRequestStatus;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/anfragen/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatusTyped }),
      });

      if (res.ok) {
        setStatus(newStatusTyped);
        onStatusChange?.(newStatusTyped);
      }
    } catch (err) {
      console.error('Status-Update fehlgeschlagen:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      value={status}
      onChange={handleChange}
      options={STATUS_OPTIONS}
      variant="badge"
      disabled={loading}
      className={loading ? 'opacity-50' : ''}
    />
  );
}
