import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserProfile, UserRole } from '../types/salon';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthResult {
  error?: string;
  needsEmailConfirmation?: boolean;
  role?: UserRole;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isRoleVerified: boolean;
  authConfigured: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (fullName: string, email: string, phone: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'fullName' | 'email' | 'phone'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
};

const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  const profile = data as ProfileRow;
  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    createdAt: profile.created_at,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isRoleVerified, setIsRoleVerified] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    const loadProfile = async (userId: string) => {
      const profile = await fetchUserProfile(userId);
      if (!active) return;
      if (!profile) {
        setUser(null);
        setIsRoleVerified(false);
        return;
      }
      setUser(profile);
      setIsRoleVerified(true);
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) void loadProfile(data.session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setIsRoleVerified(false);
      } else {
        void loadProfile(session.user.id);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: 'Sign-in is unavailable because Supabase is not configured for this site.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    const profile = data.user ? await fetchUserProfile(data.user.id) : null;
    if (!profile) return { error: 'Your account profile is missing. Please contact the salon administrator.' };
    setUser(profile);
    setIsRoleVerified(true);
    return { role: profile.role };
  };

  const register = async (fullName: string, email: string, phone: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: 'Account creation is unavailable because Supabase is not configured for this site.' };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim(), phone: phone.trim() } },
    });
    if (error) return { error: error.message };
    if (!data.session) return { needsEmailConfirmation: true };
    if (!data.user) return { error: 'Your account was created, but no user profile was returned. Please sign in.' };
    const profile = await fetchUserProfile(data.user.id);
    if (!profile) return { error: 'Your profile could not be created. Please contact the salon administrator.' };
    setUser(profile);
    setIsRoleVerified(true);
    return { role: profile.role };
  };

  const logout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setUser(null);
    setIsRoleVerified(false);
  };

  const updateProfile = (updates: Partial<Pick<UserProfile, 'fullName' | 'email' | 'phone'>>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role ?? 'customer',
      isAuthenticated: Boolean(user),
      isRoleVerified,
      authConfigured: isSupabaseConfigured,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
