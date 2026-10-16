import type { UserRole } from '../types/salon';

export type SalonView =
  | 'home'
  | 'services'
  | 'about'
  | 'contact'
  | 'terms'
  | 'my-appointments'
  | 'my-account'
  | 'staff-dashboard'
  | 'admin-dashboard'
  | 'demo-admin'
  | 'demo-staff';

export interface VerifiedSession {
  isLoading: boolean;
  isAuthenticated: boolean;
  isRoleVerified: boolean;
  role: UserRole | null;
}

export type ViewAccess =
  | { status: 'allowed' }
  | { status: 'loading' }
  | { status: 'denied'; redirectTo: 'home'; reason: 'invalid_view' | 'sign_in_required' | 'profile_unverified' | 'role_mismatch'; message: string };

/** Only an actual denied navigation creates feedback; a fallback render must
 * never manufacture a banner from a stale protected view value. */
export function accessNoticeForDecision(decision: ViewAccess): string | null {
  return decision.status === 'denied' ? decision.message : null;
}

const PUBLIC_VIEWS = new Set<SalonView>(['home', 'services', 'about', 'contact', 'terms']);
const DEMO_VIEWS = new Set<SalonView>(['demo-admin', 'demo-staff']);
const REQUIRED_ROLE: Partial<Record<SalonView, UserRole>> = {
  'my-appointments': 'customer',
  'my-account': 'customer',
  'staff-dashboard': 'staff',
  'admin-dashboard': 'admin',
};

export function authorizeView(view: string, session: VerifiedSession): ViewAccess {
  if (!isSalonView(view)) {
    return { status: 'denied', redirectTo: 'home', reason: 'invalid_view', message: 'This page is not available.' };
  }
  // Demo pages only render isolated sample data and deliberately do not use
  // real staff/admin permissions.
  if (DEMO_VIEWS.has(view)) return { status: 'allowed' };
  if (PUBLIC_VIEWS.has(view)) return { status: 'allowed' };
  if (session.isLoading) return { status: 'loading' };
  if (!session.isAuthenticated) {
    return {
      status: 'denied',
      redirectTo: 'home',
      reason: 'sign_in_required',
      message: 'Sign in with an authorized account to open that page.',
    };
  }
  if (!session.isRoleVerified) {
    return { status: 'denied', redirectTo: 'home', reason: 'profile_unverified', message: 'Your account profile could not be verified, so this page remains unavailable.' };
  }
  if (session.role !== REQUIRED_ROLE[view]) {
    return { status: 'denied', redirectTo: 'home', reason: 'role_mismatch', message: 'Your verified account does not have permission to open that page.' };
  }
  return { status: 'allowed' };
}

export function getRoleLandingView(role: UserRole): SalonView {
  if (role === 'admin') return 'admin-dashboard';
  if (role === 'staff') return 'staff-dashboard';
  return 'my-appointments';
}

export function matchesLoginAudience(audience: UserRole, verifiedRole: UserRole): boolean {
  return audience === verifiedRole;
}

export function isSalonView(view: string): view is SalonView {
  return [
    'home', 'services', 'about', 'contact', 'terms', 'my-appointments',
    'my-account', 'staff-dashboard', 'admin-dashboard', 'demo-admin', 'demo-staff',
  ].includes(view);
}
