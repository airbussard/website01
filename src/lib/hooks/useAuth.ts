'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { Profile, UserRole, AuthUser } from '@/types/dashboard';

interface UseAuthReturn {
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
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create singleton outside component to ensure stable reference
const supabase = createClient();

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profil laden oder erstellen
  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profil existiert nicht - erstelle es
        if (error.code === 'PGRST116') {
          console.log('[Auth] Profil nicht gefunden, erstelle neues Profil...');
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userEmail || '',
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) {
            console.error('Fehler beim Erstellen des Profils:', insertError);
            return null;
          }

          return newProfile as Profile;
        }

        console.error('Fehler beim Laden des Profils:', error);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Fehler beim Laden des Profils:', err);
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

  // Auth-State initialisieren
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);

        // Session abrufen
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Profil laden wenn eingeloggt
        if (currentSession?.user) {
          const userProfile = await fetchProfile(currentSession.user.id, currentSession.user.email);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Auth Initialisierungsfehler:', err);
        setError('Fehler bei der Authentifizierung');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Auth-State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        const userProfile = await fetchProfile(newSession.user.id, newSession.user.email);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[Auth] signIn called with email:', email);
    try {
      setError(null);
      console.log('[Auth] Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[Auth] signIn response:', { data: !!data, error: error?.message });

      if (error) {
        console.error('[Auth] signIn error:', error);
        setError(error.message);
        return { error: error.message };
      }

      console.log('[Auth] signIn successful, user:', data?.user?.email);
      return { error: null };
    } catch (err) {
      console.error('[Auth] signIn caught exception:', err);
      const message = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen';
      setError(message);
      return { error: message };
    }
  }, []);

  // Sign Up
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'user', // Standard-Rolle für neue User
          },
        },
      });

      if (error) {
        setError(error.message);
        return { error: error.message };
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
      console.error('Logout Fehler:', err);
    }
  }, []);

  // Rolle ermitteln
  const role: UserRole = profile?.role ?? 'user';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isManagerOrAdmin = isAdmin || isManager;

  // AuthUser zusammenbauen
  const authUser: AuthUser | null = user ? {
    id: user.id,
    email: user.email ?? '',
    profile,
  } : null;

  return {
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
