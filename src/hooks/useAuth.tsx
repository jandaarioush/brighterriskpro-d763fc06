import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { error };
    }

    // Check if user profile exists
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('status_pagamento, created_at')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        // User doesn't have a profile yet - should wait for webhook
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'Conta não encontrada. Por favor, complete sua compra ou aguarde a confirmação do pagamento.' 
          } 
        };
      }

      // Block access if payment was revoked (refund/cancellation)
      if (profile.status_pagamento === 'revoked') {
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'Detectamos um reembolso ou cancelamento da sua assinatura. Se isso foi um engano, entre em contato com o suporte.' 
          } 
        };
      }

      // User has a profile and not revoked - allow access
      // (Existing users maintain access regardless of pending/approved status)
    }

    navigate('/dashboard');
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (!error) {
      navigate('/dashboard');
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, loading }}>
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
