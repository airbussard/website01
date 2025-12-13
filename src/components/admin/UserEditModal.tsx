'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Profile } from '@/types/dashboard';

interface UserEditModalProps {
  user: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function UserEditModal({ user, isOpen, onClose, onSave }: UserEditModalProps) {
  // Persönliche Daten
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [mobile, setMobile] = useState('');

  // Privatadresse
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Deutschland');

  // Firmenadresse
  const [companyStreet, setCompanyStreet] = useState('');
  const [companyPostalCode, setCompanyPostalCode] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyCountry, setCompanyCountry] = useState('Deutschland');

  // UI State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrivateAddress, setShowPrivateAddress] = useState(false);
  const [showCompanyAddress, setShowCompanyAddress] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setCompany(user.company || '');
      setPhone(user.phone || '');
      setMobile(user.mobile || '');
      setStreet(user.street || '');
      setPostalCode(user.postal_code || '');
      setCity(user.city || '');
      setCountry(user.country || 'Deutschland');
      setCompanyStreet(user.company_street || '');
      setCompanyPostalCode(user.company_postal_code || '');
      setCompanyCity(user.company_city || '');
      setCompanyCountry(user.company_country || 'Deutschland');
      setError(null);

      // Sektionen öffnen wenn Daten vorhanden
      setShowPrivateAddress(!!(user.street || user.city));
      setShowCompanyAddress(!!(user.company_street || user.company_city));
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName || null,
          last_name: lastName || null,
          company: company || null,
          phone: phone || null,
          mobile: mobile || null,
          street: street || null,
          postal_code: postalCode || null,
          city: city || null,
          country: country || null,
          company_street: companyStreet || null,
          company_postal_code: companyPostalCode || null,
          company_city: companyCity || null,
          company_country: companyCountry || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Speichern');
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white flex items-center justify-between border-b border-gray-200 px-6 py-4 z-10">
            <h2 className="text-lg font-semibold text-gray-900">
              Benutzer bearbeiten
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              {/* E-Mail (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Mustermann"
                  />
                </div>
              </div>

              {/* Firma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firma
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Musterfirma GmbH"
                />
              </div>

              {/* Telefon / Handy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="+49 123 456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Handy
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="+49 170 1234567"
                  />
                </div>
              </div>

              {/* Privatadresse (collapsible) */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowPrivateAddress(!showPrivateAddress)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">Privatadresse</span>
                  {showPrivateAddress ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {showPrivateAddress && (
                  <div className="p-4 space-y-3 bg-white">
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Strasse und Hausnummer"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="PLZ"
                      />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Ort"
                      />
                    </div>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Land"
                    />
                  </div>
                )}
              </div>

              {/* Firmenadresse (collapsible) */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowCompanyAddress(!showCompanyAddress)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">Firmenadresse</span>
                  {showCompanyAddress ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {showCompanyAddress && (
                  <div className="p-4 space-y-3 bg-white">
                    <input
                      type="text"
                      value={companyStreet}
                      onChange={(e) => setCompanyStreet(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Strasse und Hausnummer"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={companyPostalCode}
                        onChange={(e) => setCompanyPostalCode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="PLZ"
                      />
                      <input
                        type="text"
                        value={companyCity}
                        onChange={(e) => setCompanyCity(e.target.value)}
                        className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Ort"
                      />
                    </div>
                    <input
                      type="text"
                      value={companyCountry}
                      onChange={(e) => setCompanyCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Land"
                    />
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
