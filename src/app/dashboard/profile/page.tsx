'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Building2,
  Phone,
  Save,
  Loader2,
  Camera,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
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
  const { user, profile, role, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [company, setCompany] = useState(profile?.company || '');
  const [phone, setPhone] = useState(profile?.phone || '');

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
          full_name: fullName,
          company: company || null,
          phone: phone || null,
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

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mein Profil</h1>
        <p className="text-gray-600">
          Verwalten Sie Ihre persönlichen Informationen
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
                  alt={profile.full_name || ''}
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
              <h2 className="text-xl font-bold">{profile?.full_name || 'Unbekannt'}</h2>
              <p className="text-white/80">{user?.email}</p>
              <div className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium ${roleColors[role]} bg-white`}>
                <Shield className="h-3.5 w-3.5 mr-1" />
                {roleLabels[role]}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Vollständiger Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Ihr vollständiger Name"
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
              Die E-Mail-Adresse kann nicht geändert werden
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
                placeholder="Ihr Unternehmen"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
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
                  Änderungen speichern
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
