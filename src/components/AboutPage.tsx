import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Award,
  HeartHandshake,
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export const AboutPage: React.FC = () => {
  const { openBooking } = useBooking();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#26352A] text-white p-8 sm:p-16 flex flex-col justify-center items-center text-center space-y-4 shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 text-[#D8C9A7] text-xs uppercase tracking-widest font-semibold border border-[#D8C9A7]/30">
          Our Heritage & Ethos
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl">
          Crafting Natural Luxury in the Heart of Puttur
        </h1>
        <p className="max-w-2xl text-xs sm:text-sm md:text-base text-[#E3E9DF]/80 leading-relaxed font-light">
          THE OASIS was born from a singular vision: to create a tranquil sanctuary in Dakshina
          Kannada where world-class hair artistry, clinical skin wellness, and deep holistic
          relaxation unite seamlessly.
        </p>
      </div>

      {/* Story & Philosophy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-5">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#76603F]">
            The Oasis Story
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#26352A]">
            More than a Salon — A Restorative Escape
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Perched on the 2nd Floor of Providence Plaza overlooking the bustling Yelmudi Bridge,
            THE OASIS provides a peaceful contrast to the pace of daily life. Our interior palette of
            muted sage green, warm ivory, and natural champagne gold reflects our commitment to
            natural elegance and unhurried pampering.
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Whether you are visiting for a precision fade, an intricate bridal glow facial, or a
            rejuvenating warm oil head champi, our certified stylists and aestheticians take time to
            understand your hair texture, skin tone, and wellness objectives.
          </p>

          <div className="pt-2">
            <button
              onClick={() => openBooking()}
              className="px-6 py-3 rounded-full bg-[#26352A] text-white font-semibold text-xs tracking-wide hover:bg-[#19231C] active:scale-95 transition-all shadow-md inline-flex items-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D8C9A7]" />
              <span>Book Your Visit Today</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <img
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
            alt="Styling in progress"
            className="rounded-2xl shadow-md w-full h-64 object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
            alt="Spa ambience"
            className="rounded-2xl shadow-md w-full h-64 object-cover mt-6"
          />
        </div>
      </div>

      {/* Core Standards */}
      <div className="bg-[#E3E9DF]/60 rounded-3xl p-8 sm:p-12 border border-[#D8C9A7]/40 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#76603F]">
            Guaranteed Standards
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#26352A]">
            The 4 Pillars of The Oasis
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 space-y-3">
            <ShieldCheck className="w-8 h-8 text-[#26352A]" />
            <h3 className="font-serif text-base font-bold text-[#26352A]">1. Clinical Hygiene</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Medical-grade autoclave sterilisation for every metallic instrument, fresh disposable
              capes, and rigorous workstation disinfections.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 space-y-3">
            <Award className="w-8 h-8 text-[#26352A]" />
            <h3 className="font-serif text-base font-bold text-[#26352A]">2. Certified Stylists</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Our specialists undergo regular training in modern European cutting, balayage
              techniques, and clinical skin peels.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 space-y-3">
            <Sparkles className="w-8 h-8 text-[#26352A]" />
            <h3 className="font-serif text-base font-bold text-[#26352A]">3. Genuine Formulations</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We exclusively use authentic global formulations from L’Oréal Professionnel, Casmara
              Spain, and organic essential oils.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 space-y-3">
            <HeartHandshake className="w-8 h-8 text-[#26352A]" />
            <h3 className="font-serif text-base font-bold text-[#26352A]">4. Honest Pricing</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Transparent rate card in Indian Rupees without surprise add-on taxes or aggressive
              product pushing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
