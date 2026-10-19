export type AuthRoute = 'admin-login' | 'staff-login' | 'forgot-password' | 'reset-password';

export interface AppLocation {
  view: string;
  authRoute: AuthRoute | null;
}

const VIEW_BY_PATH: Record<string, string> = {
  '/': 'home', '/services': 'services', '/our-story': 'about', '/contact': 'contact',
  '/terms': 'terms', '/my-bookings': 'my-appointments', '/my-account': 'my-account',
  '/admin': 'admin-dashboard', '/staff': 'staff-dashboard',
  '/demo/admin': 'demo-admin', '/demo/staff': 'demo-staff',
};

const AUTH_ROUTES = new Set<AuthRoute>(['admin-login', 'staff-login', 'forgot-password', 'reset-password']);

export function parseAppLocation(pathname: string): AppLocation {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
  const route = normalized.slice(1);
  if (AUTH_ROUTES.has(route as AuthRoute)) return { view: 'home', authRoute: route as AuthRoute };
  return { view: VIEW_BY_PATH[normalized] ?? 'home', authRoute: null };
}

export function pathForView(view: string): string {
  return Object.entries(VIEW_BY_PATH).find(([, mappedView]) => mappedView === view)?.[0] ?? '/';
}

export function pathForAuthRoute(route: AuthRoute): string {
  return `/${route}`;
}

export function isLoginRoute(route: AuthRoute | null): route is 'admin-login' | 'staff-login' {
  return route === 'admin-login' || route === 'staff-login';
}
