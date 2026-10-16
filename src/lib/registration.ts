import type { ProfileRecord } from './repository';
import type { UserProfile, UserRole } from '../types/salon';

/** Public signup metadata is intentionally limited to customer profile details.
 * The database auth trigger remains the authority that assigns `customer`. */
export function publicRegistrationMetadata(fullName: string, phone: string) {
  return { full_name: fullName.trim(), phone: phone.trim() };
}

export function authEmailRedirectUrl(origin: string): string {
  return new URL('/', origin).toString();
}

export function authPasswordRedirectUrl(
  currentOrigin: string,
  options: { isDevelopment?: boolean; configuredOrigin?: string } = {},
): string {
  const { isDevelopment = false, configuredOrigin } = options;
  // Development links must return to the Vite origin currently being tested.
  // Production may use an explicitly configured site origin; otherwise use
  // the HTTPS origin actually serving the app (for example the assigned Vercel URL).
  const target = isDevelopment ? currentOrigin : configuredOrigin?.trim() || currentOrigin;
  const parsed = new URL(target);
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  if (isDevelopment) {
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Password recovery configuration is invalid for the local origin.');
    }
  } else if (parsed.protocol !== 'https:' || isLocal) {
    throw new Error('Password recovery configuration requires the deployed HTTPS site origin.');
  }
  return new URL('/reset-password', parsed.origin).toString();
}

/** Detect only whether the Supabase SDK may still have a recovery callback to
 * consume. This is presentation state only; it never verifies or authorizes a
 * recovery session. The SDK remains responsible for validating/exchanging it. */
export function hasRecoveryCallback(url: string): boolean {
  const parsed = new URL(url);
  const query = parsed.searchParams;
  const fragment = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  if (query.has('error') || query.has('error_code') || fragment.has('error') || fragment.has('error_code')) return false;
  return query.has('code') || query.has('access_token') || fragment.has('access_token');
}

export function shouldFinishRecoveryVerification(
  event: string,
  recoveryCallbackPending: boolean,
  sessionExists: boolean,
): boolean {
  if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') return true;
  if (event === 'INITIAL_SESSION') return !recoveryCallbackPending || !sessionExists;
  return false;
}

export function validateNewPassword(password: string, confirmation: string): string | null {
  if (password.length < 8) return 'Choose a password with at least 8 characters.';
  if (password !== confirmation) return 'The passwords do not match.';
  return null;
}

export function canUpdatePasswordFromRecovery(recoveryEventVerified: boolean, sessionExists: boolean): boolean {
  return recoveryEventVerified && sessionExists;
}

/** Avoid reloading a profile for TOKEN_REFRESHED events after the current
 * Supabase session has already been verified. Sign-out and identity changes
 * always pass through to the auth-state handler. */
export function shouldReloadProfileForSession(userId: string | null, verifiedUserId: string | null): boolean {
  return userId === null || userId !== verifiedUserId;
}

const isUserRole = (role: unknown): role is UserRole =>
  role === 'customer' || role === 'staff' || role === 'admin';

/** A profile is trusted only when it belongs to the authenticated Supabase user
 * and carries one of the database's supported roles. */
export function verifiedProfileForUser(userId: string, profile: ProfileRecord | null): UserProfile | null {
  if (!profile || profile.id !== userId || !isUserRole(profile.role)) return null;
  return {
    id: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    createdAt: profile.createdAt,
  };
}
