import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'traveler' | 'staff' | 'admin';
export type VerificationStatus = 'unverified' | 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  verified: boolean;
  verificationStatus: VerificationStatus;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, name: string, interests?: string[]) => Promise<void>;
  logout: () => Promise<void>;
  oauthLogin: (provider: 'google' | 'github') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadUser(session: Session): Promise<User | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, role, verification_status')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error || !profile) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: profile.display_name,
    role: profile.role as UserRole,
    avatar: profile.avatar_url,
    verified: profile.verification_status === 'approved',
    verificationStatus: profile.verification_status as VerificationStatus,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      if (!data.session) {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!session) {
      setUser(null);
      return;
    }

    setIsLoading(true);
    loadUser(session).then((nextUser) => {
      if (isMounted) {
        setUser(nextUser);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw error ?? new Error('Login failed');
    }
    setSession(data.session);
    return loadUser(data.session);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, interests?: string[]) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });

    if (error) {
      throw error;
    }

    if (data.session) {
      setSession(data.session);

      if (interests?.length) {
        await supabase.from('profiles').update({ interests }).eq('id', data.session.user.id);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, []);

  const oauthLogin = useCallback(async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        oauthLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
