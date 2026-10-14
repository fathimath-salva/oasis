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
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#343923] text-[#F5F1E8] border-t border-[#A8B7A0]/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-12 border-b border-[#A8B7A0]/20">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex flex-col items-start">
              <span className="text-2xl font-serif tracking-[0.2em] font-semibold text-[#FFFFFF]">
                THE OASIS
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#A8B7A0] font-medium uppercase mt-0.5">
                UNISEX SALON & SPA â€¢ PUTTUR
              </span>
            </div>
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
          <p>Â© {new Date().getFullYear()} THE OASIS UNISEX SALON & SPA. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-xs">
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy & Booking Terms
            </button>
            <span>â€¢</span>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-white transition-colors"
            >
              About Us
            </button>
            <span>â€¢</span>
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
