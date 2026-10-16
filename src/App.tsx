import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider, useBooking } from './context/BookingContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ServicesPage } from './components/ServicesPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { TermsPolicyPage } from './components/TermsPolicyPage';
import { MyAppointmentsPage } from './components/MyAppointmentsPage';
import { AdminDashboard } from './components/AdminDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { MyAccountPage } from './components/MyAccountPage';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { DemoAdminDashboard, DemoStaffDashboard } from './components/DemoInteractiveDashboards';
import { accessNoticeForDecision, authorizeView, getRoleLandingView } from './lib/accessControl';
import { isLoginRoute, parseAppLocation, pathForAuthRoute, pathForView, type AuthRoute } from './lib/appRoutes';

const MainApp: React.FC = () => {
  const { user, role, isRoleVerified, isLoading: authLoading, authError } = useAuth();
  const { openBooking } = useBooking();

  const [initialLocation] = useState(() => parseAppLocation(window.location.pathname));
  const [currentView, setCurrentView] = useState<string>(initialLocation.view);
  const [authRoute, setAuthRoute] = useState<AuthRoute | null>(initialLocation.authRoute);
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [authModalOpen, setAuthModalOpen] = useState(isLoginRoute(initialLocation.authRoute));
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authAudience, setAuthAudience] = useState<'customer' | 'admin' | 'staff'>(() => initialLocation.authRoute === 'admin-login' ? 'admin' : initialLocation.authRoute === 'staff-login' ? 'staff' : 'customer');
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  const accessNoticeTimer = useRef<number | null>(null);
  const session = { isLoading: authLoading, isAuthenticated: Boolean(user), isRoleVerified, role: isRoleVerified ? role : null };
  const access = authorizeView(currentView, session);
  const visibleView = access.status === 'allowed' ? currentView : 'home';

  const updateLocation = (path: string, replace = false) => {
    if (replace) window.history.replaceState(null, '', path);
    else window.history.pushState(null, '', path);
  };

  const openAuthRoute = (route: AuthRoute) => {
    updateLocation(pathForAuthRoute(route));
    setAuthRoute(route);
    setCurrentView('home');
    setAuthModalOpen(isLoginRoute(route));
    setAuthAudience(route === 'admin-login' ? 'admin' : route === 'staff-login' ? 'staff' : 'customer');
    setAuthInitialMode('login');
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    if (authRoute && isLoginRoute(authRoute)) {
      setAuthRoute(null);
      updateLocation('/', true);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const location = parseAppLocation(window.location.pathname);
      setCurrentView(location.view);
      setAuthRoute(location.authRoute);
      setAuthModalOpen(isLoginRoute(location.authRoute));
      setAuthAudience(location.authRoute === 'admin-login' ? 'admin' : location.authRoute === 'staff-login' ? 'staff' : 'customer');
      setAuthInitialMode('login');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => () => {
    if (accessNoticeTimer.current !== null) window.clearTimeout(accessNoticeTimer.current);
  }, []);

  // A previously allowed protected page can become unauthorized after a
  // session/profile change. Move the actual route state to Home as well as
  // rendering the public fallback, so a stale protected view cannot linger.
  useEffect(() => {
    if (access.status !== 'denied' || currentView === 'home' || currentView.startsWith('demo-')) return;
    if (accessNoticeTimer.current !== null) window.clearTimeout(accessNoticeTimer.current);
    setAccessDeniedMessage(accessNoticeForDecision(access));
    console.warn('[access-control] route revoked', {
      view: currentView,
      reason: access.reason,
      profileState: authLoading ? 'loading' : isRoleVerified ? 'verified' : 'unverified',
      verifiedRole: isRoleVerified ? role : null,
      authenticated: Boolean(user),
    });
    accessNoticeTimer.current = window.setTimeout(() => setAccessDeniedMessage(null), 8000);
    setCurrentView('home');
    setServiceFilter('all');
    setAuthRoute(null);
    setAuthModalOpen(false);
    updateLocation('/', true);
  }, [access.status, currentView, access, authLoading, isRoleVerified, role, user]);

  // Scroll to top on navigation
  const handleNavigate = (view: string, filter = 'all') => {
    const decision = authorizeView(view, session);
    if (decision.status === 'denied') {
      if (accessNoticeTimer.current !== null) window.clearTimeout(accessNoticeTimer.current);
      const notice = accessNoticeForDecision(decision);
      setAccessDeniedMessage(notice);
      if (decision.status === 'denied') {
        console.warn('[access-control] navigation denied', {
          view,
          reason: decision.reason,
          profileState: authLoading ? 'loading' : isRoleVerified ? 'verified' : 'unverified',
          verifiedRole: isRoleVerified ? role : null,
          authenticated: Boolean(user),
        });
        accessNoticeTimer.current = window.setTimeout(() => setAccessDeniedMessage(null), 8000);
      }
      setCurrentView(decision.redirectTo);
      setServiceFilter('all');
      setAuthRoute(null);
      setAuthModalOpen(false);
      updateLocation(pathForView(decision.redirectTo), true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (accessNoticeTimer.current !== null) window.clearTimeout(accessNoticeTimer.current);
    setAccessDeniedMessage(null);
    if (decision.status === 'loading') {
      updateLocation(pathForView(view));
      setCurrentView(view);
      setAuthRoute(null);
      setServiceFilter(filter);
      return;
    }
    updateLocation(pathForView(view));
    setCurrentView(view);
    setAuthRoute(null);
    setAuthModalOpen(false);
    setServiceFilter(filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'demo-admin' || currentView === 'demo-staff') {
    return (
      <div className="min-h-screen bg-[#F5F1E8] text-[#26352A]">
        <header className="border-b border-[#53583A]/15 bg-[#F5F1E8]/95 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="font-serif text-xl tracking-[0.12em] text-[#343923]">THE OASIS</p>
              <p className="text-[9px] tracking-[0.16em] text-[#53583A]">UNISEX SALON & SPA | PUTTUR</p>
            </div>
            <button type="button" onClick={() => handleNavigate('home')} className="shrink-0 rounded-lg border border-[#53583A]/30 px-3 py-2 text-xs font-semibold text-[#343923] hover:bg-[#EEE7DA]">
              Back to Website
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {currentView === 'demo-admin' ? <DemoAdminDashboard /> : <DemoStaffDashboard />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#26352A]">
      {/* Public navigation and account actions */}
      <Navbar
        currentView={visibleView}
        onNavigate={handleNavigate}
        onOpenAuth={(mode) => { setAuthAudience('customer'); setAuthInitialMode(mode); setAuthModalOpen(true); }}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {authLoading && <p className="mx-auto max-w-7xl px-4 pt-3 text-sm text-[#53583A]" role="status">Checking your account…</p>}
        {authError && <p className="mx-auto max-w-7xl px-4 pt-3 text-sm text-red-800" role="alert">{authError}</p>}
        {accessDeniedMessage && visibleView === 'home' && <p className="mx-auto max-w-7xl px-4 pt-3 text-sm text-red-800" role="status">Access denied. {accessDeniedMessage} You have been returned to the public home page.</p>}
        {authRoute === 'forgot-password' && <ForgotPasswordPage onBackToSignIn={() => { setAuthRoute(null); updateLocation('/', true); setAuthModalOpen(true); setAuthAudience('customer'); setAuthInitialMode('login'); }} />}

        {authRoute === 'reset-password' && <ResetPasswordPage onRequestNewReset={() => {
          setAuthRoute('forgot-password');
          updateLocation(pathForAuthRoute('forgot-password'), true);
          setAuthModalOpen(false);
        }} onReturnToSignIn={(verifiedRole) => {
          const teamRoute = verifiedRole === 'admin' ? 'admin-login' : verifiedRole === 'staff' ? 'staff-login' : null;
          setAuthRoute(teamRoute);
          updateLocation(teamRoute ? pathForAuthRoute(teamRoute) : '/', true);
          setAuthModalOpen(true);
          setAuthAudience(verifiedRole === 'admin' || verifiedRole === 'staff' ? verifiedRole : 'customer');
          setAuthInitialMode('login');
        }} />}

        {!authRoute && visibleView === 'home' && <HomePage onNavigate={handleNavigate} />}

        {!authRoute && visibleView === 'services' && <ServicesPage initialFilter={serviceFilter} />}

        {!authRoute && visibleView === 'about' && <AboutPage />}

        {!authRoute && visibleView === 'contact' && <ContactPage />}

        {!authRoute && visibleView === 'terms' && <TermsPolicyPage />}

        {!authRoute && visibleView === 'my-appointments' && user && isRoleVerified && role === 'customer' && (
          <MyAppointmentsPage onOpenBooking={() => openBooking()} />
        )}

        {!authRoute && visibleView === 'my-account' && user && isRoleVerified && role === 'customer' && <MyAccountPage />}

        {!authRoute && visibleView === 'admin-dashboard' && user && isRoleVerified && role === 'admin' && <AdminDashboard />}

        {!authRoute && visibleView === 'staff-dashboard' && user && isRoleVerified && role === 'staff' && <StaffDashboard />}
      </main>

      {/* Interactive Booking Modal (accessible globally from any page) */}
      <BookingModal />

      {/* Login & Registration Modal */}
      <AuthModal
        key={`${authModalOpen}-${authInitialMode}-${authAudience}`}
        isOpen={authModalOpen || isLoginRoute(authRoute)}
        initialMode={authInitialMode}
        loginAudience={authAudience}
        onClose={closeAuthModal}
        onForgotPassword={() => openAuthRoute('forgot-password')}
        onSuccess={(authenticatedRole) => {
          if (accessNoticeTimer.current !== null) window.clearTimeout(accessNoticeTimer.current);
          setAccessDeniedMessage(null);
          const landingView = getRoleLandingView(authenticatedRole);
          setCurrentView(landingView);
          setAuthRoute(null);
          setAuthModalOpen(false);
          updateLocation(pathForView(landingView), true);
          setServiceFilter('all');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Luxury Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenTeamLogin={(teamRole) => {
          openAuthRoute(teamRole === 'admin' ? 'admin-login' : 'staff-login');
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <MainApp />
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
