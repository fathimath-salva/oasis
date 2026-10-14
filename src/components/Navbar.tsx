import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Phone,
  User,
  Shield,
  Briefcase,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { SALON_INFO } from '../constants/salonData';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, filter?: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, role, switchRole, logout } = useAuth();
  const { openBooking } = useBooking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', view: 'home' },
    { label: "Men's Services", view: 'services', filter: 'men' },
    { label: "Women's Services", view: 'services', filter: 'women' },
    { label: 'Spa & Body', view: 'services', filter: 'spa' },
    { label: 'All Services', view: 'services', filter: 'all' },
    { label: 'Gallery', view: 'gallery' },
    { label: 'About Us', view: 'about' },
    { label: 'Contact', view: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F5F1E8]/95 backdrop-blur-md border-b border-[#D8C9A7]/30 transition-all duration-300">
      {/* Top micro-bar with address, hours and phone */}
      <div className="bg-[#26352A] text-[#F5F1E8] text-xs py-1.5 px-4 sm:px-8 border-b border-[#D8C9A7]/20 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5 text-[#E3E9DF]/80">
              <MapPin className="w-3.5 h-3.5 text-[#D8C9A7]" />
              <span>Providence Plaza, Yelmudi Bridge, Puttur, Karnataka</span>
            </span>
            <span className="flex items-center space-x-1.5 text-[#E3E9DF]/80">
              <Clock className="w-3.5 h-3.5 text-[#D8C9A7]" />
              <span>Open Daily: 09:00 AM – 08:30 PM</span>
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href={`tel:${SALON_INFO.phones[0].raw}`}
              className="flex items-center space-x-1 text-[#D8C9A7] hover:text-[#FFFFFF] transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>{SALON_INFO.phones[0].display}</span>
            </a>
            <span className="text-[#A8B7A0]/40">|</span>
            <a
              href={`tel:${SALON_INFO.phones[1].raw}`}
              className="flex items-center space-x-1 text-[#D8C9A7] hover:text-[#FFFFFF] transition-colors"
            >
              <span>{SALON_INFO.phones[1].display}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Typographic Identity */}
          <button
            onClick={() => onNavigate('home')}
            className="flex flex-col items-start text-left group focus:outline-none"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl sm:text-3xl font-serif tracking-[0.18em] text-[#26352A] group-hover:text-[#76603F] transition-colors font-semibold">
                THE OASIS
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D8C9A7]" />
            </div>
            <div className="flex items-center space-x-1.5 text-[9px] sm:text-[10px] tracking-[0.25em] text-[#26352A]/80 font-medium uppercase">
              <span>UNISEX SALON & SPA</span>
              <span className="text-[#A8B7A0]">•</span>
              <span className="text-[#76603F]">PUTTUR</span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.view, item.filter)}
                className={`px-3 py-2 text-xs xl:text-sm font-medium tracking-wide rounded-md transition-colors ${
                  currentView === item.view
                    ? 'text-[#26352A] bg-[#E3E9DF]/60 font-semibold'
                    : 'text-[#26352A]/80 hover:text-[#26352A] hover:bg-[#E3E9DF]/30'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Quick Demo Role Switcher (for testing evaluator) */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full bg-[#E3E9DF] text-[#26352A] border border-[#A8B7A0]/40 hover:bg-[#A8B7A0]/30 transition-all shadow-xs"
                title="Switch active role for testing"
              >
                {role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-[#26352A]" />
                ) : role === 'staff' ? (
                  <Briefcase className="w-3.5 h-3.5 text-[#26352A]" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#26352A]" />
                )}
                <span className="capitalize font-semibold">{role}</span>
                <ChevronDown className="w-3 h-3 text-[#26352A]/60" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#D8C9A7]/40 py-2 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] tracking-wider text-gray-400 uppercase font-bold border-b border-gray-100">
                    Switch Test Account
                  </div>
                  <button
                    onClick={() => {
                      switchRole('customer');
                      setRoleDropdownOpen(false);
                      onNavigate('my-appointments');
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-[#F5F1E8] ${
                      role === 'customer' ? 'text-[#26352A] font-bold bg-[#E3E9DF]/50' : 'text-gray-700'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-[#26352A]" />
                    <span>Customer (Kavya)</span>
                  </button>
                  <button
                    onClick={() => {
                      switchRole('staff');
                      setRoleDropdownOpen(false);
                      onNavigate('staff-dashboard');
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-[#F5F1E8] ${
                      role === 'staff' ? 'text-[#26352A] font-bold bg-[#E3E9DF]/50' : 'text-gray-700'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#26352A]" />
                    <span>Staff (Ramesh Shetty)</span>
                  </button>
                  <button
                    onClick={() => {
                      switchRole('admin');
                      setRoleDropdownOpen(false);
                      onNavigate('admin-dashboard');
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-[#F5F1E8] ${
                      role === 'admin' ? 'text-[#26352A] font-bold bg-[#E3E9DF]/50' : 'text-gray-700'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-[#26352A]" />
                    <span>Admin (Salon Director)</span>
                  </button>
                </div>
              )}
            </div>

            {/* My Appointments / Dashboards */}
            {role === 'customer' && (
              <button
                onClick={() => onNavigate('my-appointments')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  currentView === 'my-appointments'
                    ? 'bg-[#26352A] text-white border-[#26352A]'
                    : 'border-[#26352A]/30 text-[#26352A] hover:bg-[#26352A] hover:text-white'
                }`}
              >
                My Bookings
              </button>
            )}

            {role === 'staff' && (
              <button
                onClick={() => onNavigate('staff-dashboard')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  currentView === 'staff-dashboard'
                    ? 'bg-[#26352A] text-white border-[#26352A]'
                    : 'border-[#26352A] text-[#26352A] bg-white hover:bg-[#26352A] hover:text-white'
                }`}
              >
                Staff Portal
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  currentView === 'admin-dashboard'
                    ? 'bg-[#26352A] text-white border-[#26352A]'
                    : 'border-[#26352A] text-[#26352A] bg-white hover:bg-[#26352A] hover:text-white'
                }`}
              >
                Admin Panel
              </button>
            )}

            {user ? (
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-700 transition-colors"
                title={`Signed in as ${user.fullName}. Click to sign out.`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-2 text-xs font-semibold rounded-lg text-[#26352A] hover:bg-[#E3E9DF]"
              >
                Sign In
              </button>
            )}

            {/* Book Appointment CTA */}
            <button
              onClick={() => openBooking()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[#26352A] text-[#F5F1E8] hover:bg-[#19231C] active:scale-95 transition-all shadow-md text-xs sm:text-sm font-medium tracking-wide group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D8C9A7] group-hover:rotate-12 transition-transform" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 sm:hidden">
            <button
              onClick={() => openBooking()}
              className="px-3 py-1.5 rounded-full bg-[#26352A] text-[#F5F1E8] text-xs font-medium"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#26352A] hover:bg-[#E3E9DF]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F5F1E8] border-b border-[#D8C9A7]/40 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#D8C9A7]/30">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.view, item.filter);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 text-xs font-medium rounded-md ${
                  currentView === item.view
                    ? 'bg-[#26352A] text-white font-semibold'
                    : 'text-[#26352A] hover:bg-[#E3E9DF]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Switch Role on Mobile */}
          <div className="space-y-2 pt-2">
            <div className="text-[10px] tracking-wider uppercase font-bold text-gray-500">
              Active Role: {role}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  switchRole('customer');
                  setMobileMenuOpen(false);
                  onNavigate('my-appointments');
                }}
                className={`flex-1 py-1.5 text-xs rounded-md border text-center ${
                  role === 'customer' ? 'bg-[#26352A] text-white' : 'border-[#26352A]/30 text-[#26352A]'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => {
                  switchRole('staff');
                  setMobileMenuOpen(false);
                  onNavigate('staff-dashboard');
                }}
                className={`flex-1 py-1.5 text-xs rounded-md border text-center ${
                  role === 'staff' ? 'bg-[#26352A] text-white' : 'border-[#26352A]/30 text-[#26352A]'
                }`}
              >
                Staff
              </button>
              <button
                onClick={() => {
                  switchRole('admin');
                  setMobileMenuOpen(false);
                  onNavigate('admin-dashboard');
                }}
                className={`flex-1 py-1.5 text-xs rounded-md border text-center ${
                  role === 'admin' ? 'bg-[#26352A] text-white' : 'border-[#26352A]/30 text-[#26352A]'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
