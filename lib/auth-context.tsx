'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  xp: number;
  level: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, semester?: number) => Promise<any>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session beim Start laden
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Auth State Changes abonnieren
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Nur loggen wenn es kein "not found" Fehler ist (z.B. beim Logout)
        if (error.code !== 'PGRST116') {
          console.error('Fehler beim Laden des Profils:', error);
        }
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unerwarteter Fehler beim Laden des Profils:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id);
    }
  }

  async function signUp(email: string, password: string, username: string, semester?: number) {
    // User registrieren - Profil wird automatisch durch Database Trigger erstellt
    const siteUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          current_semester: semester || 1,
        },
        emailRedirectTo: `${siteUrl}/verify-email`,
      }
    });

    if (error) throw error;

    // Profil direkt nach Registrierung mit Username aktualisieren
    // (Falls der DB-Trigger die Metadaten nicht korrekt lesen kann)
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: data.user.id,
          username: username,
          email: email,
          display_name: username,
          current_semester: semester || 1,
          xp: 0,
          level: 1,
          anonymous_in_leaderboard: false,
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Fehler beim Erstellen des Profils:', profileError);
      }
    }

    return data;
  }

  async function signIn(emailOrUsername: string, password: string, rememberMe: boolean = false) {
    let email = emailOrUsername;

    // Prüfen, ob es ein Username ist (kein @-Zeichen)
    if (!emailOrUsername.includes('@')) {
      // Username zu E-Mail konvertieren (case-insensitive Suche)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email')
        .ilike('username', emailOrUsername)
        .single();

      if (error || !data) {
        throw new Error('Benutzername nicht gefunden');
      }

      email = data.email;
    }

    // Login mit E-Mail
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Setze die Session-Persistenz basierend auf rememberMe
    if (rememberMe) {
      // Session für 30 Tage speichern
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }
      // Speichere Präferenz für 30 Tage
      localStorage.setItem('rememberMe', 'true');
    } else {
      // Nur für aktuelle Browser-Session
      localStorage.setItem('rememberMe', 'false');
    }
  }

  async function signOut() {
    try {
      // Zuerst Profile und User State clearen
      setProfile(null);
      setUser(null);

      // Dann Logout durchführen
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Lösche rememberMe Präferenz
      localStorage.removeItem('rememberMe');
    } catch (err) {
      console.error('Fehler beim Logout:', err);
      throw err;
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}