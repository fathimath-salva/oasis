import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { UserProfile, UserRole } from '../types/salon';
import { getSupabaseClient, isSupabaseConfigured, supabaseConfigurationError } from '../lib/supabase';
import { salonRepository } from '../lib/repository';
import { authEmailRedirectUrl, authPasswordRedirectUrl, canUpdatePasswordFromRecovery, hasRecoveryCallback, publicRegistrationMetadata, shouldFinishRecoveryVerification, shouldReloadProfileForSession, verifiedProfileForUser } from '../lib/registration';
import { authFailureMessage, classifyAuthFailure, confirmationResendMessage, type AuthFailureKind } from '../lib/authErrors';
import { AuthRequestTimeoutError, loginTimeoutMessage, withAuthRequestTimeout, withLoadingState } from '../lib/authRequests';

interface AuthResult {
  error?: string;
  errorKind?: AuthFailureKind;
  message?: string;
  needsEmailConfirmation?: boolean;
  passwordUpdated?: boolean;
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
  recoverySessionActive: boolean;
  recoverySessionReady: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (fullName: string, email: string, phone: string, password: string) => Promise<AuthResult>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  updatePasswordFromRecovery: (password: string) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'fullName' | 'phone'>>) => Promise<AuthResult>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const safeAuthErrorMessage = (error: unknown, operation: 'signin' | 'registration' | 'resend' | 'profile' | 'signout'): string =>
  authFailureMessage(classifyAuthFailure(error), operation);
const logProfileFailure = (reason: 'missing' | 'query_error' | 'session_mismatch', source: 'session' | 'signin' | 'registration' | 'password_recovery') => {
  // Log only an enum-like failure classification; never include provider error
  // objects, user identifiers, email addresses, or session material.
  console.warn('[auth-profile] verification failed', { reason, source });
};
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileState, setProfileState] = useState<ProfileState>(isSupabaseConfigured ? 'loading' : 'error');
  const [authError, setAuthError] = useState<string | null>(supabaseConfigurationError);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [recoverySessionActive, setRecoverySessionActive] = useState(false);
  const [recoverySessionReady, setRecoverySessionReady] = useState(
    !isSupabaseConfigured || !hasRecoveryCallback(window.location.href),
  );
  const sessionRevision = useRef(0);
  const verifiedSessionUserId = useRef<string | null>(null);
  const loginAttemptRevision = useRef(0);
  const loginInProgress = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setRecoverySessionReady(true);
      return;
    }
    let active = true;
    const client = getSupabaseClient();
    const recoveryCallbackPending = hasRecoveryCallback(window.location.href);
    const recoveryVerificationTimer = recoveryCallbackPending
      ? window.setTimeout(() => {
          if (!active) return;
          console.warn('[auth-recovery] verification timed out');
          setRecoverySessionActive(false);
          setRecoverySessionReady(true);
        }, 12000)
      : null;

    const finishRecoveryVerification = () => {
      if (recoveryVerificationTimer !== null) window.clearTimeout(recoveryVerificationTimer);
      setRecoverySessionReady(true);
    };

    const loadForUser = async (userId: string, revision: number) => {
      if (!active || revision !== sessionRevision.current) return;
      setIsLoading(true);
      setProfileState('loading');
      setAuthError(null);
      try {
        const profile = verifiedProfileForUser(userId, await salonRepository.getProfile(userId));
        if (!active || revision !== sessionRevision.current) return;
        if (!profile) {
          logProfileFailure('missing', 'session');
          verifiedSessionUserId.current = null;
          setUser(null);
          setProfileState('missing');
          setAuthError('Your signed-in account has no profile. Contact the salon administrator.');
          return;
        }
        verifiedSessionUserId.current = userId;
        setUser(profile);
        setProfileState('loaded');
      } catch (error) {
        if (!active || revision !== sessionRevision.current) return;
        verifiedSessionUserId.current = null;
        setUser(null);
        setProfileState('error');
        const kind = classifyAuthFailure(error);
        logProfileFailure('query_error', 'session');
        setAuthError(kind === 'network' || kind === 'configuration'
          ? authFailureMessage(kind, 'signin')
          : 'The salon database did not return a verifiable profile. Check your connection and try again; if the problem continues, contact the salon administrator.');
      } finally {
        if (active && revision === sessionRevision.current) setIsLoading(false);
      }
    };

    const acceptSession = (userId: string | null) => {
      if (!shouldReloadProfileForSession(userId, verifiedSessionUserId.current)) return;
      const revision = ++sessionRevision.current;
      setAuthError(null);
      if (!userId) {
        verifiedSessionUserId.current = null;
        setUser(null);
        setProfileState('signed_out');
        setIsLoading(false);
        return;
      }
      verifiedSessionUserId.current = null;
      // Defer repository access out of Supabase's synchronous auth callback.
      window.setTimeout(() => { if (active) void loadForUser(userId, revision); }, 0);
    };

    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      // The explicit login flow verifies its own session and profile. Ignore
      // duplicate SDK events while that attempt is in flight; otherwise a
      // token event can race its profile check and replace its loading state.
      if (loginInProgress.current && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) return;
      if (event === 'PASSWORD_RECOVERY' && session) {
        finishRecoveryVerification();
        setRecoverySessionActive(true);
      } else if (event === 'INITIAL_SESSION') {
        // INITIAL_SESSION means the SDK has completed URL callback processing.
        // A missing session (for example an expired/reused link) is not valid,
        // but it must end the verification spinner.
        if (shouldFinishRecoveryVerification(event, recoveryCallbackPending, Boolean(session))) finishRecoveryVerification();
      } else if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setRecoverySessionActive(false);
        finishRecoveryVerification();
      }
      acceptSession(session?.user.id ?? null);
    });
    const bootstrapRevision = sessionRevision.current;
    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      // With a callback session, wait for the SDK's PASSWORD_RECOVERY event;
      // getSession alone never authorizes the password form.
      if (error || !recoveryCallbackPending || !data.session) finishRecoveryVerification();
      if (sessionRevision.current !== bootstrapRevision) return;
      if (error) {
        setAuthError(safeAuthErrorMessage(error, 'signin'));
        setProfileState('error');
        setIsLoading(false);
        setRecoverySessionReady(true);
        return;
      }
      acceptSession(data.session?.user.id ?? null);
    }).catch((error: unknown) => {
      if (!active) return;
      finishRecoveryVerification();
      if (sessionRevision.current !== bootstrapRevision) return;
      setAuthError(safeAuthErrorMessage(error, 'signin'));
      setProfileState('error');
      setIsLoading(false);
    });

    return () => {
      active = false;
      if (recoveryVerificationTimer !== null) window.clearTimeout(recoveryVerificationTimer);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: supabaseConfigurationError ?? 'Supabase is unavailable.', errorKind: 'unknown' };
    const attempt = ++loginAttemptRevision.current;
    const loginRevision = ++sessionRevision.current;
    const isCurrentAttempt = () => attempt === loginAttemptRevision.current && loginRevision === sessionRevision.current;
    let phase: 'signin' | 'session' | 'profile' = 'signin';
    let credentialsAccepted = false;
    loginInProgress.current = true;
    verifiedSessionUserId.current = null;
    return withLoadingState(setIsLoading, async () => {
      setAuthError(null);
      try {
        const client = getSupabaseClient();
        const { data, error } = await withAuthRequestTimeout(
          () => client.auth.signInWithPassword({ email: email.trim(), password }), 'signin',
        );
        if (!isCurrentAttempt()) return { error: 'Your sign-in attempt was superseded. Please try again.' };
        if (error) throw error;
        if (!data.session || !data.user) throw new Error('Supabase did not return a complete signed-in session.');
        credentialsAccepted = true;

        phase = 'session';
        const { data: currentSessionData, error: currentSessionError } = await withAuthRequestTimeout(
          () => client.auth.getSession(), 'session',
        );
        if (!isCurrentAttempt()) return { error: 'Your sign-in attempt was superseded. Please try again.' };
        if (currentSessionError) throw currentSessionError;
        if (currentSessionData.session?.user.id !== data.user.id) {
          logProfileFailure('session_mismatch', 'signin');
          throw new Error('The current Supabase session did not match the signed-in account.');
        }

        phase = 'profile';
        const profileRecord = await withAuthRequestTimeout(
          () => salonRepository.getProfile(data.user.id), 'profile',
        );
        if (!isCurrentAttempt()) return { error: 'Your sign-in attempt was superseded. Please try again.' };
        const profile = verifiedProfileForUser(data.user.id, profileRecord);
        if (!profile) {
          logProfileFailure('missing', 'signin');
          setUser(null);
          setProfileState('missing');
          const message = 'We could not verify the profile for this account. Please contact the salon administrator.';
          setAuthError(message);
          void client.auth.signOut({ scope: 'local' }).catch(() => undefined);
          return { error: message };
        }
        verifiedSessionUserId.current = data.user.id;
        setUser(profile);
        setProfileState('loaded');
        return { role: profile.role };
      } catch (error) {
        if (!isCurrentAttempt()) return { error: 'Your sign-in attempt was superseded. Please try again.' };
        const errorKind = classifyAuthFailure(error);
        const message = error instanceof AuthRequestTimeoutError
          ? loginTimeoutMessage(phase)
          : phase === 'signin'
            ? authFailureMessage(errorKind, 'signin')
            : phase === 'session'
              ? errorKind === 'network' || errorKind === 'configuration'
                ? 'We could not confirm your sign-in session with Supabase. Check your connection and try again.'
                : 'We could not confirm your sign-in session. Please try again.'
              : errorKind === 'network' || errorKind === 'configuration'
                ? 'We could not reach the salon profile service. Check your connection and try again.'
                : 'Your credentials were accepted, but the salon database did not return a verifiable profile. Check your connection and try again; if the problem continues, contact the salon administrator.';
        if (phase === 'profile') logProfileFailure('query_error', 'signin');
        setUser(null);
        verifiedSessionUserId.current = null;
        setProfileState(errorKind === 'invalid_credentials' || errorKind === 'email_unconfirmed' ? 'signed_out' : 'error');
        setAuthError(message);
        if (credentialsAccepted) {
          // A profile/session failure must not leave a partially authenticated
          // browser session that a later auth event could treat as verified.
          void getSupabaseClient().auth.signOut({ scope: 'local' }).catch(() => undefined);
        }
        return { error: message, errorKind };
      } finally {
        if (attempt === loginAttemptRevision.current) loginInProgress.current = false;
      }
    }, () => attempt === loginAttemptRevision.current);
  };

  const register = async (fullName: string, email: string, phone: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: supabaseConfigurationError ?? 'Supabase is unavailable.' };
    setIsLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await getSupabaseClient().auth.signUp({
        email: email.trim(), password,
        options: {
          data: publicRegistrationMetadata(fullName, phone),
          emailRedirectTo: authEmailRedirectUrl(window.location.origin),
        },
      });
      if (error) throw error;
      if (!data.session) {
        setUser(null);
        setProfileState('signed_out');
        setIsLoading(false);
        return { needsEmailConfirmation: true, message: 'If this address can be registered, check your email for a confirmation link. If you already have an account, sign in instead.' };
      }
      if (!data.user) throw new Error('Account creation returned no user. Please sign in again.');
      const registrationRevision = ++sessionRevision.current;
      verifiedSessionUserId.current = null;
      let registrationProfile;
      try {
        registrationProfile = await salonRepository.getProfile(data.user.id);
      } catch (error) {
        logProfileFailure('query_error', 'registration');
        throw error;
      }
      const profile = verifiedProfileForUser(data.user.id, registrationProfile);
      if (registrationRevision !== sessionRevision.current) {
        return { error: 'Your registration state changed before your profile was verified. Please sign in again.' };
      }
      if (!profile) {
        logProfileFailure('missing', 'registration');
        setProfileState('missing');
        const message = 'Your account was created, but its profile is not available yet. Please sign in again or contact the salon.';
        setAuthError(message);
        setIsLoading(false);
        return { error: message };
      }
      verifiedSessionUserId.current = data.user.id;
      setUser(profile);
      setProfileState('loaded');
      setIsLoading(false);
      return { role: profile.role };
    } catch (error) {
      const errorKind = classifyAuthFailure(error);
      const message = authFailureMessage(errorKind, 'registration');
      setAuthError(message);
      setProfileState('error');
      setIsLoading(false);
      return { error: message, errorKind };
    }
  };

  const resendConfirmation = async (email: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { error: supabaseConfigurationError ?? 'Supabase is unavailable.' };
    }
    try {
      const { error } = await getSupabaseClient().auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: authEmailRedirectUrl(window.location.origin) },
      });
      if (!error) return { message: confirmationResendMessage };
      const kind = classifyAuthFailure(error);
      if (kind === 'network' || kind === 'rate_limited' || kind === 'configuration') {
        return { error: authFailureMessage(kind, 'resend'), errorKind: kind };
      }
      // Avoid revealing whether an email is registered or already confirmed.
      return { message: confirmationResendMessage };
    } catch (error) {
      const kind = classifyAuthFailure(error);
      if (kind === 'network' || kind === 'rate_limited' || kind === 'configuration') {
        return { error: authFailureMessage(kind, 'resend'), errorKind: kind };
      }
      return { message: confirmationResendMessage };
    }
  };

  const requestPasswordReset = async (email: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: supabaseConfigurationError ?? 'Supabase is unavailable.' };
    try {
      const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: authPasswordRedirectUrl(window.location.origin, {
          isDevelopment: import.meta.env.DEV,
          configuredOrigin: import.meta.env.VITE_APP_URL,
        }),
      });
      if (error) {
        const kind = classifyAuthFailure(error);
        return { error: kind === 'rate_limited'
          ? authFailureMessage(kind, 'password_reset')
          : kind === 'network' || kind === 'configuration'
            ? authFailureMessage(kind, 'password_reset')
            : 'We could not process that request right now. Please wait and try again.' };
      }
      // Keep this response neutral so it does not disclose whether an account exists.
      return { message: 'If an account matches that email, password reset instructions will be sent. Check your inbox and spam folder.' };
    } catch (error) {
      const kind = classifyAuthFailure(error);
      return { error: kind === 'network' || kind === 'configuration' || kind === 'rate_limited'
        ? authFailureMessage(kind, 'password_reset')
        : 'We could not process that request right now. Please wait and try again.' };
    }
  };

  const updatePasswordFromRecovery = async (password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: supabaseConfigurationError ?? 'Supabase is unavailable.' };
    if (!recoverySessionActive) return { error: 'This recovery link is missing, expired, or not verified. Request a new password reset link.' };
    try {
      const client = getSupabaseClient();
      const { data, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      if (!canUpdatePasswordFromRecovery(recoverySessionActive, Boolean(data.session))) return { error: 'Your password recovery session has expired. Request a new reset link.' };
      let verifiedRole: UserRole | undefined;
      try {
        const profile = verifiedProfileForUser(data.session!.user.id, await salonRepository.getProfile(data.session!.user.id));
        verifiedRole = profile?.role;
      } catch {
        // Password recovery stays available if profile reads are temporarily
        // unavailable; without a verified role the UI returns to customer sign-in.
        logProfileFailure('query_error', 'password_recovery');
      }
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
      setRecoverySessionActive(false);
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) {
        return { error: 'Your password was updated, but we could not end the recovery session. Please sign out, then sign in with your new password.', passwordUpdated: true, role: verifiedRole };
      }
      setUser(null);
      verifiedSessionUserId.current = null;
      sessionRevision.current += 1;
      setProfileState('signed_out');
      setIsLoading(false);
      return { message: 'Your password has been updated. Please sign in with your new password.', passwordUpdated: true, role: verifiedRole };
    } catch (error) {
      const kind = classifyAuthFailure(error);
      return { error: kind === 'network' || kind === 'configuration' || kind === 'rate_limited'
        ? authFailureMessage(kind, 'password_reset')
        : 'We could not update your password. The recovery link may have expired; request a new one and try again.' };
    }
  };

  const logout = async (): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: supabaseConfigurationError ?? 'Supabase is unavailable.' };
    try {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) throw error;
      setUser(null);
      verifiedSessionUserId.current = null;
      sessionRevision.current += 1;
      setProfileState('signed_out');
      setAuthError(null);
      return {};
    } catch (error) {
      const message = safeAuthErrorMessage(error, 'signout');
      setAuthError(`Could not sign out: ${message}`);
      return { error: message };
    }
  };

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'fullName' | 'phone'>>): Promise<AuthResult> => {
    if (!user) return { error: 'Sign in before updating your profile.' };
    setAuthError(null);
    try {
      const profile = await salonRepository.updateOwnProfile(user.id, updates);
      setUser(verifiedProfileForUser(user.id, profile));
      setProfileState('loaded');
      return { role: profile.role };
    } catch (error) {
      const message = safeAuthErrorMessage(error, 'profile');
      setAuthError(`Could not save your profile: ${message}`);
      return { error: message };
    }
  };

  return <AuthContext.Provider value={{
    user, role: user?.role ?? 'customer', isAuthenticated: Boolean(user),
    isRoleVerified: profileState === 'loaded', isLoading, profileState, authError,
    authConfigured: isSupabaseConfigured, recoverySessionActive, recoverySessionReady,
    login, register, resendConfirmation, requestPasswordReset, updatePasswordFromRecovery, logout, updateProfile,
  }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
