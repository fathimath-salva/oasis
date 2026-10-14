import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { UserProfile, UserRole } from '../types/salon';
import { getSupabaseClient, isSupabaseConfigured, supabaseConfigurationError } from '../lib/supabase';
import { salonRepository } from '../lib/repository';

interface AuthResult {
  error?: string;
  needsEmailConfirmation?: boolean;
  role?: UserRole;
}
type ProfileState = 'loading' | 'signed_out' | 'loaded' | 'missing' | 'error';
interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isRoleVerified: boolean;
  isLoading: boolean;
  profileState: ProfileState;
  authError: string | null;
  authConfigured: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (fullName: string, email: string, phone: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'fullName' | 'phone'>>) => Promise<AuthResult>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'An unexpected authentication error occurred.';
const toUserProfile = (profile: Awaited<ReturnType<typeof salonRepository.getProfile>>): UserProfile | null => {
  if (!profile) return null;
  return { id: profile.id, fullName: profile.fullName, email: profile.email, phone: profile.phone, role: profile.role, createdAt: profile.createdAt };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileState, setProfileState] = useState<ProfileState>(isSupabaseConfigured ? 'loading' : 'error');
  const [authError, setAuthError] = useState<string | null>(supabaseConfigurationError);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const sessionRevision = useRef(0);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    const client = getSupabaseClient();

    const loadForUser = async (userId: string, revision: number) => {
      setIsLoading(true);
      setProfileState('loading');
      setAuthError(null);
      try {
        const profile = toUserProfile(await salonRepository.getProfile(userId));
        if (!active || revision !== sessionRevision.current) return;
        if (!profile) {
          setUser(null);
          setProfileState('missing');
          setAuthError('Your signed-in account has no profile. Contact the salon administrator.');
          return;
        }
        setUser(profile);
        setProfileState('loaded');
      } catch (error) {
        if (!active || revision !== sessionRevision.current) return;
        setUser(null);
        setProfileState('error');
        setAuthError(`Could not load your profile: ${errorMessage(error)}`);
      } finally {
        if (active && revision === sessionRevision.current) setIsLoading(false);
      }
    };

    const acceptSession = (userId: string | null) => {
      const revision = ++sessionRevision.current;
      setAuthError(null);
      if (!userId) {
        setUser(null);
        setProfileState('signed_out');
        setIsLoading(false);
        return;
      }
      // Defer repository access out of Supabase's synchronous auth callback.
      window.setTimeout(() => { if (active) void loadForUser(userId, revision); }, 0);
    };

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      acceptSession(session?.user.id ?? null);
    });
    const bootstrapRevision = sessionRevision.current;
    void client.auth.getSession().then(({ data, error }) => {
      if (!active || sessionRevision.current !== bootstrapRevision) return;
      if (error) {
        setAuthError(`Could not restore your session: ${error.message}`);
        setProfileState('error');
        setIsLoading(false);
        return;
      }
      acceptSession(data.session?.user.id ?? null);
    }).catch((error: unknown) => {
      if (!active || sessionRevision.current !== bootstrapRevision) return;
      setAuthError(`Could not restore your session: ${errorMessage(error)}`);
      setProfileState('error');
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: supabaseConfigurationError ?? 'Supabase is unavailable.' };
    setIsLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (!data.user) throw new Error('Supabase did not return a signed-in user.');
      const profile = toUserProfile(await salonRepository.getProfile(data.user.id));
      if (!profile) {
        setUser(null);
        setProfileState('missing');
        const message = 'Your account profile is missing. Contact the salon administrator.';
        setAuthError(message);
        setIsLoading(false);
        return { error: message };
      }
      setUser(profile);
      setProfileState('loaded');
      setIsLoading(false);
      return { role: profile.role };
    } catch (error) {
      const message = errorMessage(error);
      setAuthError(message);
      setProfileState('error');
      setIsLoading(false);
      return { error: message };
    }
  };

  const register = async (fullName: string, email: string, phone: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: supabaseConfigurationError ?? 'Supabase is unavailable.' };
    setIsLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await getSupabaseClient().auth.signUp({
        email: email.trim(), password,
        options: { data: { full_name: fullName.trim(), phone: phone.trim() } },
      });
      if (error) throw error;
      if (!data.session) {
        setUser(null);
        setProfileState('signed_out');
        setIsLoading(false);
        return { needsEmailConfirmation: true };
      }
      if (!data.user) throw new Error('Account creation returned no user. Please sign in again.');
      const profile = toUserProfile(await salonRepository.getProfile(data.user.id));
      if (!profile) {
        setProfileState('missing');
        const message = 'Your account was created, but its profile is not available yet. Please sign in again or contact the salon.';
        setAuthError(message);
        setIsLoading(false);
        return { error: message };
      }
      setUser(profile);
      setProfileState('loaded');
      setIsLoading(false);
      return { role: profile.role };
    } catch (error) {
      const message = errorMessage(error);
      setAuthError(message);
      setProfileState('error');
      setIsLoading(false);
      return { error: message };
    }
  };

  const logout = async (): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: supabaseConfigurationError ?? 'Supabase is unavailable.' };
    try {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfileState('signed_out');
      setAuthError(null);
      return {};
    } catch (error) {
      const message = errorMessage(error);
      setAuthError(`Could not sign out: ${message}`);
      return { error: message };
    }
  };

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'fullName' | 'phone'>>): Promise<AuthResult> => {
    if (!user) return { error: 'Sign in before updating your profile.' };
    setAuthError(null);
    try {
      const profile = await salonRepository.updateOwnProfile(user.id, updates);
      setUser(toUserProfile(profile));
      setProfileState('loaded');
      return { role: profile.role };
    } catch (error) {
      const message = errorMessage(error);
      setAuthError(`Could not save your profile: ${message}`);
      return { error: message };
    }
  };

  return <AuthContext.Provider value={{
    user, role: user?.role ?? 'customer', isAuthenticated: Boolean(user),
    isRoleVerified: profileState === 'loaded', isLoading, profileState, authError,
    authConfigured: isSupabaseConfigured, login, register, logout, updateProfile,
  }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
