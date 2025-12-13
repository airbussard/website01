'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Lock,
  Bell,
  Mail,
  Save,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const supabase = createClient();

  // Tab state
  const [activeTab, setActiveTab] = useState<'password' | 'email' | 'notifications'>('password');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Notification settings state
  const [notifyProjectUpdates, setNotifyProjectUpdates] = useState(true);
  const [notifyTaskAssignments, setNotifyTaskAssignments] = useState(true);
  const [notifyInvoices, setNotifyInvoices] = useState(true);
  const [notifyComments, setNotifyComments] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (newPassword.length < 8) {
      setPasswordError('Das neue Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Error updating password:', err);
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Ändern des Passworts';
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEmail) return;

    // Simple validation
    if (newEmail === user.email) {
      setEmailError('Die neue E-Mail-Adresse ist identisch mit der aktuellen');
      return;
    }

    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      setEmailSuccess(true);
      setNewEmail('');
    } catch (err: unknown) {
      console.error('Error changing email:', err);
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Ändern der E-Mail';
      setEmailError(errorMessage);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    if (!user || !profile) return;

    setNotificationLoading(true);
    setNotificationSuccess(false);

    try {
      const settings = {
        notifications: {
          project_updates: notifyProjectUpdates,
          task_assignments: notifyTaskAssignments,
          invoices: notifyInvoices,
          comments: notifyComments,
        },
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setNotificationSuccess(true);
      setTimeout(() => setNotificationSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving notifications:', err);
    } finally {
      setNotificationLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const tabs = [
    { id: 'password', label: 'Passwort', icon: Lock },
    { id: 'email', label: 'E-Mail', icon: Mail },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-gray-600">
          Verwalten Sie Ihre Kontoeinstellungen und Benachrichtigungen
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'password' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Passwort ändern</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Passwort erfolgreich geändert
                  </div>
                )}

                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Aktuelles Passwort
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      placeholder="Aktuelles Passwort eingeben"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Neues Passwort
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      placeholder="Neues Passwort eingeben"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Mindestens 8 Zeichen</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Passwort bestätigen
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      placeholder="Neues Passwort wiederholen"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={passwordLoading || !newPassword || !confirmPassword}
                    className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Ändere Passwort...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Passwort ändern
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'email' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">E-Mail-Adresse ändern</h3>
              <p className="text-sm text-gray-500 mb-6">
                Nach der Änderung erhalten Sie eine Bestätigungs-E-Mail an die neue Adresse.
              </p>

              {emailError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {emailError}
                </div>
              )}

              {emailSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center mb-4">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Bestätigungs-E-Mail wurde an die neue Adresse gesendet
                </div>
              )}

              <form onSubmit={handleEmailChange} className="space-y-4">
                {/* Current Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aktuelle E-Mail-Adresse
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                {/* New Email */}
                <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Neue E-Mail-Adresse
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      placeholder="neue@email.de"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={emailLoading || !newEmail}
                    className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {emailLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Sende Bestätigung...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        E-Mail ändern
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">E-Mail-Benachrichtigungen</h3>
              <p className="text-sm text-gray-500 mb-6">
                Wählen Sie aus, für welche Ereignisse Sie E-Mail-Benachrichtigungen erhalten möchten.
              </p>

              {notificationSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center mb-6">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Einstellungen gespeichert
                </div>
              )}

              <div className="space-y-4">
                {/* Project Updates */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Projekt-Updates</p>
                    <p className="text-sm text-gray-500">Benachrichtigung bei Statusänderungen von Projekten</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyProjectUpdates}
                    onChange={(e) => setNotifyProjectUpdates(e.target.checked)}
                    className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>

                {/* Task Assignments */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Aufgaben-Zuweisungen</p>
                    <p className="text-sm text-gray-500">Benachrichtigung wenn Ihnen eine Aufgabe zugewiesen wird</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyTaskAssignments}
                    onChange={(e) => setNotifyTaskAssignments(e.target.checked)}
                    className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>

                {/* Invoices */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Rechnungen</p>
                    <p className="text-sm text-gray-500">Benachrichtigung bei neuen Rechnungen</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyInvoices}
                    onChange={(e) => setNotifyInvoices(e.target.checked)}
                    className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>

                {/* Comments */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Kommentare</p>
                    <p className="text-sm text-gray-500">Benachrichtigung bei neuen Kommentaren zu Ihren Aufgaben</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyComments}
                    onChange={(e) => setNotifyComments(e.target.checked)}
                    className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>
              </div>

              {/* Save Button */}
              <div className="pt-6">
                <button
                  onClick={handleNotificationSave}
                  disabled={notificationLoading}
                  className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {notificationLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Einstellungen speichern
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
