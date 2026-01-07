'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
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

// Singleton Supabase Client - EINE Instanz fuer die gesamte App
const supabase = createClient();

// Timeout fuer Auth-Aufrufe
const AUTH_TIMEOUT = 10000;

// Promise mit Timeout wrappen
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Auth timeout')), ms)
  );
  return Promise.race([promise, timeoutPromise]);
}

// =====================================================
// AUTH PROVIDER
// =====================================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Profil laden
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('[AuthContext] Profil nicht gefunden:', error.code);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('[AuthContext] Fehler beim Laden des Profils:', err);
      return null;
    }
  }, []);

  // Profil neu laden
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const newProfile = await fetchProfile(user.id);
      setProfile(newProfile);
    }
  }, [user?.id, fetchProfile]);

  // Auth-State initialisieren - NUR EINMAL
  useEffect(() => {
    // Verhindere doppelte Initialisierung
    if (initialized) return;

    let isMounted = true;

    const initAuth = async () => {
      try {
        const sessionResult = await withTimeout<{ data: { session: Session | null }; error: Error | null }>(
          supabase.auth.getSession(),
          AUTH_TIMEOUT
        );
        const currentSession = sessionResult.data.session;
        const sessionError = sessionResult.error;

        if (!isMounted) return;

        if (sessionError) {
          console.error('[AuthContext] Session error:', sessionError);
          setError('Fehler bei der Authentifizierung');
          setLoading(false);
          setInitialized(true);
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          try {
            const userProfile = await withTimeout(
              fetchProfile(currentSession.user.id),
              AUTH_TIMEOUT
            );
            if (isMounted) {
              setProfile(userProfile);
            }
          } catch (profileErr) {
            console.warn('[AuthContext] Profil konnte nicht geladen werden:', profileErr);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Initialisierungsfehler:', err);
        if (isMounted) {
          setError('Verbindungsproblem - bitte Seite neu laden');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initAuth();

    // Auth-State Listener - wird nur einmal registriert
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          try {
            const userProfile = await withTimeout(
              fetchProfile(newSession.user.id),
              AUTH_TIMEOUT
            );
            if (isMounted) {
              setProfile(userProfile);
            }
          } catch (err) {
            console.warn('[AuthContext] Profil-Laden fehlgeschlagen:', err);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initialized, fetchProfile]);

  // Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen';
      setError(message);
      return { error: message };
    }
  }, []);

  // Sign Up - via API-Route (DB-Trigger ist deaktiviert)
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
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error('[AuthContext] Logout Fehler:', err);
    }
  }, []);

  // Computed values
  const role: UserRole = profile?.role ?? 'user';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isManagerOrAdmin = isAdmin || isManager;

  const authUser: AuthUser | null = user ? {
    id: user.id,
    email: user.email ?? '',
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
