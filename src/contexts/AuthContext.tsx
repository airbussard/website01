'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { Profile, UserRole, AuthUser } from '@/types/dashboard';

// =====================================================
// TYPES
// =====================================================
interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isManager: boolean;
  isManagerOrAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName?: string, website?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// =====================================================
// CONTEXT
// =====================================================
const AuthContext = createContext<AuthContextValue | null>(null);

// =====================================================
// AUTH PROVIDER
// =====================================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const loading = status === 'loading' || profileLoading;

  // Profil laden via API
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
      if (!response.ok) {
        console.log('[AuthContext] Profil nicht gefunden');
        return null;
      }
      const data = await response.json();
      return data as Profile;
    } catch (err) {
      console.error('[AuthContext] Fehler beim Laden des Profils:', err);
      return null;
    }
  }, []);

  // Profil neu laden
  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      setProfileLoading(true);
      const newProfile = await fetchProfile(session.user.id);
      setProfile(newProfile);
      setProfileLoading(false);
    }
  }, [session?.user?.id, fetchProfile]);

  // Profil laden wenn Session sich aendert
  useEffect(() => {
    if (session?.user?.id) {
      setProfileLoading(true);
      fetchProfile(session.user.id).then((newProfile) => {
        setProfile(newProfile);
        setProfileLoading(false);
      });
    } else {
      setProfile(null);
    }
  }, [session?.user?.id, fetchProfile]);

  // Sign In mit NextAuth Credentials
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = result.error === 'CredentialsSignin'
          ? 'Ungueltige E-Mail oder Passwort'
          : result.error;
        setError(errorMessage);
        return { error: errorMessage };
      }

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen';
      setError(message);
      return { error: message };
    }
  }, []);

  // Sign Up - via API-Route
  const signUp = useCallback(async (email: string, password: string, fullName?: string, website?: string) => {
    try {
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, website }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registrierung fehlgeschlagen');
        return { error: data.error || 'Registrierung fehlgeschlagen' };
      }

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registrierung fehlgeschlagen';
      setError(message);
      return { error: message };
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    try {
      await nextAuthSignOut({ redirect: false });
      setProfile(null);
    } catch (err) {
      console.error('[AuthContext] Logout Fehler:', err);
    }
  }, []);

  // Computed values - nutze session.user.role falls vorhanden
  const role: UserRole = (session?.user as { role?: UserRole })?.role ?? profile?.role ?? 'user';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isManagerOrAdmin = isAdmin || isManager;

  const authUser: AuthUser | null = session?.user ? {
    id: session.user.id,
    email: session.user.email ?? '',
    profile,
  } : null;

  const value: AuthContextValue = {
    user: authUser,
    session,
    profile,
    role,
    loading,
    error,
    isAdmin,
    isManager,
    isManagerOrAdmin,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// =====================================================
// PERMISSION HELPERS
// =====================================================
export function canManageProject(role: UserRole): boolean {
  return role === 'manager' || role === 'admin';
}

export function canManageTasks(role: UserRole): boolean {
  return role === 'manager' || role === 'admin';
}

export function canViewAllProjects(role: UserRole): boolean {
  return role === 'manager' || role === 'admin';
}

export function canManageUsers(role: UserRole): boolean {
  return role === 'admin';
}

export function canDeleteProject(role: UserRole): boolean {
  return role === 'admin';
}

export function canUploadInvoices(role: UserRole): boolean {
  return role === 'manager' || role === 'admin';
}

export function canViewInternalComments(role: UserRole): boolean {
  return role === 'manager' || role === 'admin';
}
