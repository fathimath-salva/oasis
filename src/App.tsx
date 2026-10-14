import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider, useBooking } from './context/BookingContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ServicesPage } from './components/ServicesPage';
import { GalleryPage } from './components/GalleryPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { TermsPolicyPage } from './components/TermsPolicyPage';
import { MyAppointmentsPage } from './components/MyAppointmentsPage';
import { AdminDashboard } from './components/AdminDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';

const MainApp: React.FC = () => {
  const { role } = useAuth();
  const { openBooking } = useBooking();

  const [currentView, setCurrentView] = useState<string>('home');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authFromBooking, setAuthFromBooking] = useState(false);

  // Scroll to top on navigation
  const handleNavigate = (view: string, filter = 'all') => {
    setCurrentView(view);
    setServiceFilter(filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#26352A]">
      {/* Navbar with demo role switcher & navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentView === 'home' && <HomePage onNavigate={handleNavigate} />}

        {currentView === 'services' && <ServicesPage initialFilter={serviceFilter} />}

        {currentView === 'gallery' && <GalleryPage />}

        {currentView === 'about' && <AboutPage />}

        {currentView === 'contact' && <ContactPage />}

        {currentView === 'terms' && <TermsPolicyPage />}

        {currentView === 'my-appointments' && (
          <MyAppointmentsPage onOpenBooking={() => openBooking()} />
        )}

        {currentView === 'admin-dashboard' && <AdminDashboard />}

        {currentView === 'staff-dashboard' && <StaffDashboard />}
      </main>

      {/* Interactive Booking Modal (accessible globally from any page) */}
      <BookingModal
        onRequireSignIn={() => {
          setAuthFromBooking(true);
          setAuthModalOpen(true);
        }}
        onNavigateToAppointments={() => {
          handleNavigate('my-appointments');
        }}
      />

      {/* Login & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          if (authFromBooking) setAuthFromBooking(false);
          else if (role === 'admin') handleNavigate('admin-dashboard');
          else if (role === 'staff') handleNavigate('staff-dashboard');
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
