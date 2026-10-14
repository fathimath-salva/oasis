import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu, Phone, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { SALON_INFO } from '../constants/salonData';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, filter?: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

const serviceLinks = [
  { label: "Men's Services", filter: 'men' },
  { label: "Women's Services", filter: 'women' },
  { label: 'Spa & Body Treatments', filter: 'spa' },
  { label: 'All Services', filter: 'all' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, role, isRoleVerified, logout } = useAuth();
  const { openBooking } = useBooking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesMenuRef = useRef<HTMLDivElement>(null);
  const desktopAccountRef = useRef<HTMLDivElement>(null);
  const mobileAccountRef = useRef<HTMLDivElement>(null);
  const [desktopAccountOpen, setDesktopAccountOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);

  useEffect(() => {
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [currentView]);

  useEffect(() => {
    const closeOutside = (event: MouseEvent | TouchEvent) => {
      if (event.target instanceof Node && !servicesMenuRef.current?.contains(event.target)) {
        setServicesOpen(false);
        setMobileServicesOpen(false);
      }
      if (event.target instanceof Node && !desktopAccountRef.current?.contains(event.target)) setDesktopAccountOpen(false);
      if (event.target instanceof Node && !mobileAccountRef.current?.contains(event.target)) setMobileAccountOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setServicesOpen(false);
        setMobileServicesOpen(false);
        setDesktopAccountOpen(false);
        setMobileAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("touchstart", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("touchstart", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const navigate = (view: string, filter = 'all') => {
    onNavigate(view, filter);
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
    setServicesOpen(false);
    setDesktopAccountOpen(false);
    setMobileAccountOpen(false);
  };

  return (
    <>
      <div className="bg-[#343923] text-[#F5F1E8] px-4 sm:px-6 lg:px-8 py-2 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <span>Providence Plaza, Yelmudi Bridge, Puttur</span>
          <div className="flex items-center gap-4">
            {SALON_INFO.phones.map((phone) => (
              <a key={phone.raw} href={`tel:${phone.raw}`} className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-white">
                <Phone className="w-3 h-3" />{phone.display}
              </a>
            ))}
          </div>
        </div>
      </div>

      <header ref={servicesMenuRef} className="sticky top-0 z-50 border-b border-[#53583A]/15 bg-[#F5F1E8]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-[72px] flex items-center justify-between gap-3">
            <button onClick={() => navigate('home')} className="min-w-0 shrink-0 text-left leading-none" aria-label="THE OASIS UNISEX SALON & SPA home">
              <span className="block whitespace-nowrap font-serif text-[21px] sm:text-2xl tracking-[0.12em] text-[#343923]">THE OASIS</span>
              <span className="mt-1 block whitespace-nowrap text-[8px] sm:text-[9px] tracking-[0.16em] text-[#53583A]">UNISEX SALON & SPA | PUTTUR</span>
            </button>
            <nav aria-label="Main navigation" className="hidden lg:flex items-center justify-center gap-1 xl:gap-3 min-w-0">
              <button onClick={() => navigate('home')} className={`px-2 py-2 text-sm whitespace-nowrap ${currentView === 'home' ? 'text-[#343923] font-semibold' : 'text-[#53583A] hover:text-[#343923]'}`}>Home</button>
              <div className="relative">
                <button type="button" aria-expanded={servicesOpen} aria-controls="desktop-services-menu" onClick={() => setServicesOpen((open) => !open)} className="flex items-center gap-1 px-2 py-2 text-sm whitespace-nowrap text-[#53583A] hover:text-[#343923]">Services <ChevronDown className="w-3.5 h-3.5" /></button>
                {servicesOpen && <div id="desktop-services-menu" className="absolute left-0 top-full z-50 mt-2 min-w-52 border border-[#53583A]/15 bg-[#F5F1E8] py-2 shadow-lg" role="menu">
                  {serviceLinks.map((item) => <button role="menuitem" key={item.filter} onClick={() => navigate("services", item.filter)} className="block w-full whitespace-nowrap px-4 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">{item.label}</button>)}
                </div>}
              </div>
              <button onClick={() => navigate('about')} className={`px-2 py-2 text-sm whitespace-nowrap ${currentView === 'about' ? 'text-[#343923] font-semibold' : 'text-[#53583A] hover:text-[#343923]'}`}>Our Story</button>
              <button onClick={() => navigate('contact')} className={`px-2 py-2 text-sm whitespace-nowrap ${currentView === 'contact' ? 'text-[#343923] font-semibold' : 'text-[#53583A] hover:text-[#343923]'}`}>Contact</button>
            </nav>

            <div className="hidden lg:flex shrink-0 items-center gap-2">
              <div ref={desktopAccountRef} className="relative">
                <button type="button" aria-label="Account menu" aria-expanded={desktopAccountOpen} onClick={() => setDesktopAccountOpen((open) => !open)} className="flex cursor-pointer list-none items-center gap-1.5 px-2 py-2 text-sm text-[#53583A] hover:text-[#343923]">
                  <UserRound className="h-4 w-4" /><span>Account</span><ChevronDown className="h-3.5 w-3.5" />
                </button>
                {desktopAccountOpen && <div className="absolute right-0 top-full z-50 mt-2 min-w-52 border border-[#53583A]/15 bg-[#F5F1E8] p-2 shadow-lg">
                  {!user && <>
                    <button onClick={() => { setDesktopAccountOpen(false); onOpenAuth('login'); }} className="block w-full px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">Sign In</button>
                    <button onClick={() => { setDesktopAccountOpen(false); onOpenAuth('register'); }} className="block w-full px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">Create Account</button>
                  </>}
                  {user && role === 'customer' && <>
                    <button onClick={() => navigate('my-appointments')} className="block w-full whitespace-nowrap px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">My Bookings</button>
                    <button onClick={() => navigate('my-account')} className="block w-full whitespace-nowrap px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">My Account</button>
                  </>}
                  {user && isRoleVerified && role === 'staff' && <button onClick={() => navigate('staff-dashboard')} className="block w-full whitespace-nowrap px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">Staff Dashboard</button>}
                  {user && isRoleVerified && role === 'admin' && <button onClick={() => navigate('admin-dashboard')} className="block w-full whitespace-nowrap px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">Admin Dashboard</button>}
                  {user && <button onClick={() => { logout(); navigate('home'); }} className="mt-1 flex w-full items-center gap-2 border-t border-[#53583A]/15 px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]"><LogOut className="h-3.5 w-3.5" />Sign Out</button>}
                </div>}
              </div>
              <button onClick={() => openBooking()} className="whitespace-nowrap bg-[#53583A] px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#343923]">Book Appointment</button>
            </div>

            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <button onClick={() => openBooking()} aria-label="Book Appointment" className="whitespace-nowrap bg-[#53583A] px-3 py-2 text-xs sm:text-sm text-white hover:bg-[#343923]">Book</button>
              <button onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen} className="p-2 text-[#343923] hover:bg-[#DDE4D7]">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && <div className="border-t border-[#53583A]/15 bg-[#F5F1E8] px-4 py-4 lg:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto grid max-w-7xl grid-cols-2 gap-1">
            <button onClick={() => navigate('home')} className="px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">Home</button>
            <div className="relative">
              <button type="button" aria-expanded={mobileServicesOpen} aria-controls="mobile-services-menu" onClick={() => setMobileServicesOpen((open) => !open)} className="flex w-full items-center justify-between px-3 py-2 text-sm text-[#343923] hover:bg-[#DDE4D7]">Services <ChevronDown className="h-3.5 w-3.5" /></button>
              {mobileServicesOpen && <div id="mobile-services-menu" className="col-span-2 pl-3" role="menu">
                {serviceLinks.map((item) => <button role="menuitem" key={item.filter} onClick={() => navigate("services", item.filter)} className="block w-full px-3 py-2 text-left text-sm text-[#53583A] hover:bg-[#DDE4D7]">{item.label}</button>)}
              </div>}
            </div>
            <button onClick={() => navigate('about')} className="px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">Our Story</button>
            <button onClick={() => navigate('contact')} className="px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">Contact</button>
          </nav>
          <div ref={mobileAccountRef} className="mx-auto mt-3 max-w-7xl border-t border-[#53583A]/15 pt-3">
            <button type="button" aria-expanded={mobileAccountOpen} onClick={() => setMobileAccountOpen((open) => !open)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#343923]"><UserRound className="h-4 w-4" />Account <ChevronDown className="h-3.5 w-3.5" /></button>
            {mobileAccountOpen && <div className="grid grid-cols-2 gap-1 px-3 pb-2">
              {!user && <>
                <button onClick={() => { setMobileAccountOpen(false); onOpenAuth('login'); setMobileMenuOpen(false); }} className="px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">Sign In</button>
                <button onClick={() => { setMobileAccountOpen(false); onOpenAuth('register'); setMobileMenuOpen(false); }} className="px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">Create Account</button>
              </>}
              {user && role === 'customer' && <>
                <button onClick={() => navigate('my-appointments')} className="px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">My Bookings</button>
                <button onClick={() => navigate('my-account')} className="px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">My Account</button>
              </>}
              {user && isRoleVerified && role === 'staff' && <button onClick={() => navigate('staff-dashboard')} className="px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">Staff Dashboard</button>}
              {user && isRoleVerified && role === 'admin' && <button onClick={() => navigate('admin-dashboard')} className="px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">Admin Dashboard</button>}
              {user && <button onClick={() => { logout(); navigate('home'); }} className="px-3 py-2 text-left text-sm text-[#343923] hover:bg-[#DDE4D7]">Sign Out</button>}
            </div>}
          </div>
        </div>}      </header>
    </>
  );
};
