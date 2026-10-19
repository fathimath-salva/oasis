import React from 'react';
import {
  MapPin,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';
import { SALON_INFO } from '../constants/salonData';

interface FooterProps {
  onNavigate: (view: string, filter?: string) => void;
  onOpenTeamLogin: (role: 'admin' | 'staff') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTeamLogin }) => {
  return (
    <footer className="oasis-footer bg-[#151412] text-[#F5F1E8] border-t border-[#C6AA76]/25 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#A8B7A0]/20">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <img src="/images/oasis-logo.jpg" alt="THE OASIS — UNISEX SALON & SPA" width="1450" height="660" className="h-16 w-auto max-w-[230px] object-contain" loading="lazy" />
            <p className="text-xs text-[#DDE4D7]/80 leading-relaxed">Hair, beauty and spa services in a comfortable setting in Puttur.</p>
            <div className="pt-2">
              <a
                href={SALON_INFO.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#344839] text-[#A8B7A0] hover:bg-[#A8B7A0] hover:text-[#343923] transition-colors text-xs font-medium"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>{SALON_INFO.instagram.handle}</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Col 2: Services Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#A8B7A0]">
              Services
            </h4>
            <ul className="space-y-2 text-xs text-[#DDE4D7]/80">
              <li>
                <button
                  onClick={() => onNavigate('services', 'Hair Cutting')}
                  className="hover:text-[#FFFFFF] transition-colors text-left"
                >
                  Haircuts & Styling
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'Keratin Treatment')}
                  className="hover:text-[#FFFFFF] transition-colors text-left"
                >
                  Keratin & Smoothing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'Premium Facial')}
                  className="hover:text-[#FFFFFF] transition-colors text-left"
                >
                  Facials
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'Hair Spa')}
                  className="hover:text-[#FFFFFF] transition-colors text-left"
                >
                  Hair Spa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'Body Spa & Massage')}
                  className="hover:text-[#FFFFFF] transition-colors text-left"
                >
                  Body Spa & Massage
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'Pedicure')}
                  className="hover:text-[#FFFFFF] transition-colors text-left"
                >
                  Manicure & Pedicure
                </button>
              </li>
            </ul>
          </div>

          {/* Team Access and sample-only previews */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#A8B7A0]">Team Access</h4>
            <button type="button" onClick={() => onOpenTeamLogin('admin')} className="block text-left text-xs text-[#DDE4D7]/90 hover:text-white transition-colors">Admin Login</button>
            <button type="button" onClick={() => onOpenTeamLogin('staff')} className="block text-left text-xs text-[#DDE4D7]/90 hover:text-white transition-colors">Staff Login</button>
            <div className="border-t border-[#A8B7A0]/20 pt-3">
              <p className="mb-2 text-[10px] uppercase tracking-wider text-[#A8B7A0]">Sample-only previews</p>
              <button type="button" onClick={() => onNavigate('demo-admin')} className="mb-2 block text-left text-xs text-[#DDE4D7]/90 hover:text-white transition-colors">Preview Admin Dashboard</button>
              <button type="button" onClick={() => onNavigate('demo-staff')} className="block text-left text-xs text-[#DDE4D7]/90 hover:text-white transition-colors">Preview Staff Dashboard</button>
              <p className="mt-2 text-[10px] leading-4 text-[#DDE4D7]/60">Demo dashboards use fictional sample data and do not grant staff access.</p>
            </div>
          </div>

          {/* Col 4: Address & Phone Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#A8B7A0]">
              Visit Our Salon
            </h4>
            <div className="flex items-start space-x-2.5 text-xs text-[#DDE4D7]/90">
              <MapPin className="w-4 h-4 text-[#A8B7A0] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Providence Plaza, 2nd Floor</p>
                <p>Main Road, Yelmudi Bridge</p>
                <p>Puttur, D.K., Karnataka 574201</p>
                <a
                  href={SALON_INFO.googleMaps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[#A8B7A0] hover:text-white mt-1 text-[11px] underline underline-offset-2"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="pt-2 space-y-1.5">
              <div className="text-[11px] uppercase tracking-wider text-[#A8B7A0]">
                Appointments & Inquiries
              </div>
              <div className="flex flex-col space-y-1 text-xs">
                {SALON_INFO.phones.map((p) => (
                  <a
                    key={p.raw}
                    href={`tel:${p.raw}`}
                    className="flex items-center space-x-2 text-white hover:text-[#A8B7A0] transition-colors"
                  >
                    <Phone className="w-3 h-3 text-[#A8B7A0]" />
                    <span>{p.display}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A8B7A0] gap-4">
          <p>© {new Date().getFullYear()} THE OASIS UNISEX SALON & SPA. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs sm:justify-start sm:gap-x-6">
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy & Booking Terms
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-white transition-colors"
            >
              About Us
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-white transition-colors"
            >
              Location & Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
