'use client';

import { useState, useEffect } from 'react';
import { X, Send, Loader2, UserPlus, FolderKanban } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Select from '@/components/ui/Select';
import MultiSelect from '@/components/ui/MultiSelect';

interface Project {
  id: string;
  name: string;
}

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Projekt-Zuweisung
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const supabase = createClient();

  // Projekte laden wenn Modal geoeffnet wird
  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('pm_projects')
        .select('id, name')
        .in('status', ['planned', 'active', 'on_hold'])
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Fehler beim Laden der Projekte:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setRole('user');
    setSelectedProjectIds([]);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          role,
          project_ids: selectedProjectIds.length > 0 ? selectedProjectIds : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Senden der Einladung');
      }

      setSuccess(true);

      // Nach 2 Sekunden schließen und Liste aktualisieren
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Benutzer einladen
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Success State */}
          {success ? (
            <div className="px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Einladung gesendet!
              </h3>
              <p className="text-sm text-gray-600">
                Eine Einladungs-E-Mail wurde an <strong>{email}</strong> gesendet.
              </p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <p className="text-sm text-gray-600">
                  Der Benutzer erhält eine E-Mail mit einem Link zur Registrierung.
                </p>

                {/* E-Mail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="name@firma.de"
                  />
                </div>

                {/* Vorname / Nachname */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vorname
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Max"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nachname
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mustermann"
                    />
                  </div>
                </div>

                {/* Rolle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rolle
                  </label>
                  <Select
                    value={role}
                    onChange={(val) => setRole(val as 'user' | 'admin')}
                    options={[
                      { value: 'user', label: 'Benutzer' },
                      { value: 'admin', label: 'Administrator' },
                    ]}
                  />
                </div>

                {/* Projektzuweisung */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Projektzuweisung (optional)
                  </label>
                  <MultiSelect
                    value={selectedProjectIds}
                    onChange={setSelectedProjectIds}
                    options={projects.map((p) => ({ value: p.id, label: p.name }))}
                    placeholder="Keine Projekte ausgewaehlt"
                    selectedText={(count) => `${count} Projekt${count > 1 ? 'e' : ''} ausgewaehlt`}
                    loading={loadingProjects}
                    icon={<FolderKanban className="h-5 w-5" />}
                    emptyMessage="Keine Projekte vorhanden"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Der Benutzer erhaelt Zugriff auf die ausgewaehlten Projekte.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={sending || !email}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Einladung senden
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
