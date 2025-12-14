'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, ChevronDown, ChevronUp, Building2, Plus, Trash2 } from 'lucide-react';
import type { Profile, Organization, OrganizationMemberRole } from '@/types/dashboard';

interface UserOrganization {
  membership_id: string;
  role: OrganizationMemberRole;
  joined_at: string;
  organization: {
    id: string;
    name: string;
    slug: string | null;
  };
}

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
  const [showOrganizations, setShowOrganizations] = useState(false);

  // Organizations State
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedOrgRole, setSelectedOrgRole] = useState<'member' | 'admin'>('member');

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

      // Organisationen laden
      fetchUserOrganizations(user.id);
      fetchAllOrganizations();
    }
  }, [user]);

  const fetchUserOrganizations = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/organizations`);
      const data = await res.json();
      if (res.ok) {
        setUserOrganizations(data.organizations || []);
        setShowOrganizations(data.organizations?.length > 0);
      }
    } catch (err) {
      console.error('Error fetching user organizations:', err);
    }
  };

  const fetchAllOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations');
      const data = await res.json();
      if (res.ok) {
        setAllOrganizations(data.organizations || []);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const handleAddOrganization = async () => {
    if (!selectedOrgId || !user) return;

    setLoadingOrgs(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: selectedOrgId,
          role: selectedOrgRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserOrganizations(prev => [...prev, data.membership]);
        setSelectedOrgId('');
        setSelectedOrgRole('member');
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Hinzufuegen');
      }
    } catch (err) {
      setError('Fehler beim Hinzufuegen zur Organisation');
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleRemoveOrganization = async (orgId: string) => {
    if (!user) return;

    setLoadingOrgs(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/organizations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organization_id: orgId }),
      });

      if (res.ok) {
        setUserOrganizations(prev => prev.filter(o => o.organization.id !== orgId));
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Entfernen');
      }
    } catch (err) {
      setError('Fehler beim Entfernen aus Organisation');
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleRoleChange = async (orgId: string, newRole: 'member' | 'admin') => {
    if (!user) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}/organizations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organization_id: orgId, role: newRole }),
      });

      if (res.ok) {
        setUserOrganizations(prev =>
          prev.map(o =>
            o.organization.id === orgId ? { ...o, role: newRole } : o
          )
        );
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Aendern der Rolle');
      }
    } catch (err) {
      setError('Fehler beim Aendern der Rolle');
    }
  };

  // Organisationen die noch nicht zugeordnet sind
  const availableOrganizations = allOrganizations.filter(
    org => !userOrganizations.some(uo => uo.organization.id === org.id)
  );

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

              {/* Organisationen (collapsible) */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowOrganizations(!showOrganizations)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Organisationen ({userOrganizations.length})
                    </span>
                  </div>
                  {showOrganizations ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {showOrganizations && (
                  <div className="p-4 space-y-3 bg-white">
                    {/* Bestehende Organisationen */}
                    {userOrganizations.length > 0 ? (
                      <div className="space-y-2">
                        {userOrganizations.map((uo) => (
                          <div
                            key={uo.membership_id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {uo.organization.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {uo.role === 'owner' ? (
                                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                                  Owner
                                </span>
                              ) : (
                                <select
                                  value={uo.role}
                                  onChange={(e) =>
                                    handleRoleChange(uo.organization.id, e.target.value as 'member' | 'admin')
                                  }
                                  className="text-xs px-2 py-1 border border-gray-200 rounded bg-white"
                                >
                                  <option value="member">Mitglied</option>
                                  <option value="admin">Admin</option>
                                </select>
                              )}
                              {uo.role !== 'owner' && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOrganization(uo.organization.id)}
                                  disabled={loadingOrgs}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                  title="Entfernen"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">
                        Noch keiner Organisation zugeordnet
                      </p>
                    )}

                    {/* Neue Organisation hinzufuegen */}
                    {availableOrganizations.length > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          Organisation hinzufuegen
                        </p>
                        <div className="flex gap-2">
                          <select
                            value={selectedOrgId}
                            onChange={(e) => setSelectedOrgId(e.target.value)}
                            className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Organisation waehlen...</option>
                            {availableOrganizations.map((org) => (
                              <option key={org.id} value={org.id}>
                                {org.name}
                              </option>
                            ))}
                          </select>
                          <select
                            value={selectedOrgRole}
                            onChange={(e) => setSelectedOrgRole(e.target.value as 'member' | 'admin')}
                            className="text-sm px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="member">Mitglied</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            type="button"
                            onClick={handleAddOrganization}
                            disabled={!selectedOrgId || loadingOrgs}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingOrgs ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
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
