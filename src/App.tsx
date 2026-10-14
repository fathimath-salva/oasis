import React, { useState } from 'react';
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

const MainApp: React.FC = () => {
  const { user, role, isRoleVerified, isLoading: authLoading, authError } = useAuth();
  const { openBooking } = useBooking();

  const [currentView, setCurrentView] = useState<string>('home');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authFromBooking, setAuthFromBooking] = useState(false);

  // Scroll to top on navigation
  const handleNavigate = (view: string, filter = 'all') => {
    setCurrentView(view);
    setServiceFilter(filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#26352A]">
      {/* Public navigation and account actions */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={(mode) => { setAuthInitialMode(mode); setAuthModalOpen(true); }}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {authLoading && <p className="mx-auto max-w-7xl px-4 pt-3 text-sm text-[#53583A]" role="status">Checking your account…</p>}
        {authError && <p className="mx-auto max-w-7xl px-4 pt-3 text-sm text-red-800" role="alert">{authError}</p>}
        {currentView === 'home' && <HomePage onNavigate={handleNavigate} />}

        {currentView === 'services' && <ServicesPage initialFilter={serviceFilter} />}

        {currentView === 'about' && <AboutPage />}

        {currentView === 'contact' && <ContactPage />}

        {currentView === 'terms' && <TermsPolicyPage />}

        {currentView === 'my-appointments' && user && isRoleVerified && role === 'customer' && (
          <MyAppointmentsPage onOpenBooking={() => openBooking()} />
        )}

        {currentView === 'my-account' && user && isRoleVerified && role === 'customer' && <MyAccountPage />}

        {currentView === 'admin-dashboard' && user && isRoleVerified && role === 'admin' && <AdminDashboard />}

        {currentView === 'staff-dashboard' && user && isRoleVerified && role === 'staff' && <StaffDashboard />}
      </main>

      {/* Interactive Booking Modal (accessible globally from any page) */}
      <BookingModal
        onRequireSignIn={() => {
          setAuthFromBooking(true);
          setAuthInitialMode('login');
          setAuthModalOpen(true);
        }}
        onNavigateToAppointments={() => {
          handleNavigate('my-appointments');
        }}
      />

      {/* Login & Registration Modal */}
      <AuthModal
        key={`${authModalOpen}-${authInitialMode}`}
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(authenticatedRole) => {
          if (authFromBooking) setAuthFromBooking(false);
          else if (authenticatedRole === 'admin') handleNavigate('admin-dashboard');
          else if (authenticatedRole === 'staff') handleNavigate('staff-dashboard');
          else handleNavigate('my-appointments');
        }}
      />

      {/* Global Luxury Footer */}
      <Footer onNavigate={handleNavigate} />
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
