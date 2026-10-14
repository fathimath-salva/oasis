import React from 'react';
import {
  MapPin,
  Phone,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';
import { SALON_INFO } from '../constants/salonData';

interface FooterProps {
  onNavigate: (view: string, filter?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#26352A] text-[#F5F1E8] border-t border-[#D8C9A7]/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#D8C9A7]/20">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex flex-col items-start">
              <span className="text-2xl font-serif tracking-[0.2em] font-semibold text-[#FFFFFF]">
                THE OASIS
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#D8C9A7] font-medium uppercase mt-0.5">
                UNISEX SALON & SPA • PUTTUR
              </span>
            </div>
            <p className="text-xs text-[#E3E9DF]/80 leading-relaxed">
              A tranquil sanctuary in Puttur where expert hair craftsmanship, revitalizing skin
              therapies, and restorative spa rituals come together in an atmosphere of natural
              luxury.
            </p>
            <div className="pt-2">
              <a
                href={SALON_INFO.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#344839] text-[#D8C9A7] hover:bg-[#D8C9A7] hover:text-[#26352A] transition-colors text-xs font-medium"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>{SALON_INFO.instagram.handle}</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Col 2: Services Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#D8C9A7]">
              Service Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#E3E9DF]/80">
              <li>
                <button
                  onClick={() => onNavigate('services', 'Haircutting and hairstyling')}
                  className="hover:text-[#FFFFFF] transition-colors text-left"
                >
                  Haircutting & Styling
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'Keratin treatments')}
                  className="hover:text-[#FFFFFF] transition-colors text-left"
                >
                  Brazilian Keratin & Smoothening
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'Classic and premium facials')}
                  className="hover:text-[#FFFFFF] transition-colors text-left"
                >
                  Casmara & O3+ Luxury Facials
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'Hair spa and head massage')}
                  className="hover:text-[#FFFFFF] transition-colors text-left"
                >
                  Argan Oil Spa & Ayurvedic Champi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'Body spa and massage')}
                  className="hover:text-[#FFFFFF] transition-colors text-left"
                >
                  Swedish & Deep Tissue Body Spa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'Manicure and pedicure')}
                  className="hover:text-[#FFFFFF] transition-colors text-left"
                >
                  Paraffin Bubble Foot Spa Pedicure
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Hygiene Guarantee */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#D8C9A7]">
              Opening Hours
            </h4>
            <div className="space-y-1.5 text-xs text-[#E3E9DF]/80">
              <div className="flex justify-between py-1 border-b border-[#344839]">
                <span>Monday – Saturday</span>
                <span className="font-semibold text-white">09:00 AM – 08:30 PM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#344839]">
                <span>Sunday</span>
                <span className="font-semibold text-white">09:00 AM – 08:30 PM</span>
              </div>
            </div>
            <div className="pt-2 flex items-start space-x-2 text-xs text-[#A8B7A0]">
              <ShieldCheck className="w-4 h-4 text-[#D8C9A7] shrink-0 mt-0.5" />
              <span>Autoclaved metal tools, single-use disposable towels & sanitised stations.</span>
            </div>
          </div>

          {/* Col 4: Address & Phone Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#D8C9A7]">
              Visit Our Salon
            </h4>
            <div className="flex items-start space-x-2.5 text-xs text-[#E3E9DF]/90">
              <MapPin className="w-4 h-4 text-[#D8C9A7] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Providence Plaza, 2nd Floor</p>
                <p>Main Road, Yelmudi Bridge</p>
                <p>Puttur, D.K., Karnataka 574201</p>
                <a
                  href={SALON_INFO.googleMaps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[#D8C9A7] hover:text-white mt-1 text-[11px] underline underline-offset-2"
                >
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="pt-2 space-y-1.5">
              <div className="text-[11px] uppercase tracking-wider text-[#D8C9A7]">
                Appointments & Inquiries
              </div>
              <div className="flex flex-col space-y-1 text-xs">
                {SALON_INFO.phones.map((p) => (
                  <a
                    key={p.raw}
                    href={`tel:${p.raw}`}
                    className="flex items-center space-x-2 text-white hover:text-[#D8C9A7] transition-colors"
                  >
                    <Phone className="w-3 h-3 text-[#D8C9A7]" />
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
          <div className="flex items-center space-x-6 text-xs">
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
