'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Building2,
  Phone,
  Smartphone,
  MapPin,
  Save,
  Loader2,
  Camera,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/dashboard';

const roleLabels: Record<UserRole, string> = {
  user: 'Kunde',
  manager: 'Manager',
  admin: 'Administrator',
};

const roleColors: Record<UserRole, string> = {
  user: 'bg-blue-100 text-blue-600',
  manager: 'bg-purple-100 text-purple-600',
  admin: 'bg-red-100 text-red-600',
};

export default function ProfilePage() {
  const { user, profile, role, refreshProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Persoenliche Daten
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

  // Initialize form values when profile loads
  if (profile && !initialized) {
    setFirstName(profile.first_name || '');
    setLastName(profile.last_name || '');
    setCompany(profile.company || '');
    setPhone(profile.phone || '');
    setMobile(profile.mobile || '');
    setStreet(profile.street || '');
    setPostalCode(profile.postal_code || '');
    setCity(profile.city || '');
    setCountry(profile.country || 'Deutschland');
    setCompanyStreet(profile.company_street || '');
    setCompanyPostalCode(profile.company_postal_code || '');
    setCompanyCity(profile.company_city || '');
    setCompanyCountry(profile.company_country || 'Deutschland');
    setInitialized(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Fehler beim Speichern des Profils');
    } finally {
      setLoading(false);
    }
  };

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || profile?.full_name;
  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mein Profil</h1>
        <p className="text-gray-600">
          Verwalten Sie Ihre persoenlichen Informationen
        </p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Header with Avatar */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={fullName || ''}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-white/30"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white/30">
                  {initials}
                </div>
              )}
              <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">{fullName || 'Unbekannt'}</h2>
              <p className="text-white/80">{user?.email}</p>
              <div className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium ${roleColors[role]} bg-white`}>
                <Shield className="h-3.5 w-3.5 mr-1" />
                {roleLabels[role]}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              Profil erfolgreich aktualisiert
            </div>
          )}

          {/* Persoenliche Daten */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Persoenliche Daten
            </h3>

            {/* Vorname / Nachname */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Vorname
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Max"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nachname
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Mustermann"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Die E-Mail-Adresse kann in den Einstellungen geaendert werden
              </p>
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Unternehmen
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Musterfirma GmbH"
                />
              </div>
            </div>

            {/* Telefon / Handy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon (Festnetz)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  Handynummer
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="+49 170 1234567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Privatadresse */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Privatadresse
            </h3>

            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                Strasse und Hausnummer
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="street"
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Musterstrasse 123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  PLZ
                </label>
                <input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="12345"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Ort
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Musterstadt"
                />
              </div>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Land
              </label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Deutschland"
              />
            </div>
          </div>

          {/* Firmenadresse */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Firmenadresse
            </h3>

            <div>
              <label htmlFor="companyStreet" className="block text-sm font-medium text-gray-700 mb-2">
                Strasse und Hausnummer
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="companyStreet"
                  type="text"
                  value={companyStreet}
                  onChange={(e) => setCompanyStreet(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Firmenstrasse 456"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="companyPostalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  PLZ
                </label>
                <input
                  id="companyPostalCode"
                  type="text"
                  value={companyPostalCode}
                  onChange={(e) => setCompanyPostalCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="54321"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="companyCity" className="block text-sm font-medium text-gray-700 mb-2">
                  Ort
                </label>
                <input
                  id="companyCity"
                  type="text"
                  value={companyCity}
                  onChange={(e) => setCompanyCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Firmenstadt"
                />
              </div>
            </div>

            <div>
              <label htmlFor="companyCountry" className="block text-sm font-medium text-gray-700 mb-2">
                Land
              </label>
              <input
                id="companyCountry"
                type="text"
                value={companyCountry}
                onChange={(e) => setCompanyCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Deutschland"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Aenderungen speichern
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontoinformationen</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Konto erstellt</span>
            <span className="text-gray-900">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('de-DE')
                : '-'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Letzte Aktualisierung</span>
            <span className="text-gray-900">
              {profile?.updated_at
                ? new Date(profile.updated_at).toLocaleDateString('de-DE')
                : '-'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Benutzer-ID</span>
            <span className="text-gray-400 font-mono text-xs">{user?.id?.slice(0, 8)}...</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
