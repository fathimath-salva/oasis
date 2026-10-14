import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';
import { useBooking } from '../context/BookingContext';
import { SALON_INFO, INITIAL_SERVICES, REVIEWS, GALLERY_ITEMS } from '../constants/salonData';
import { formatINR, formatDuration } from '../lib/formatters';

interface HomePageProps {
  onNavigate: (view: string, filter?: string) => void;
}

const FEATURED_IMAGES: Record<string, string> = {
  'w-cut-4': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  'm-spa-m1': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
  'w-spa-4': 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
  'w-pf-6': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { openBooking } = useBooking();

  // Featured 4 curated services — selected by stable ID
  const featuredServices = [
    'w-cut-4',    // Women's Advance Hair Cut (with Wash / Blow-Dry)
    'm-spa-m1',   // Men's Swedish Massage
    'w-spa-4',    // Women's Keratin Spa
    'w-pf-6',     // Women's Korean Glass Facial
  ]
    .map((id) => {
      const svc = INITIAL_SERVICES.find((s) => s.id === id);
      if (!svc) return null;
      return { ...svc, imageUrl: svc.imageUrl || FEATURED_IMAGES[id] };
    })
    .filter(Boolean) as typeof INITIAL_SERVICES;

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#26352A] text-[#F5F1E8] px-4 sm:px-6 lg:px-8 py-24">
        {/* Ambient background image with luxury dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1800&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#19231C] via-[#26352A]/85 to-[#26352A]/60" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Location badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#E3E9DF]/10 border border-[#D8C9A7]/30 text-xs sm:text-sm text-[#D8C9A7] backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5 text-[#D8C9A7]" />
            <span>Providence Plaza, Yelmudi Bridge, Puttur, Karnataka</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            A Sanctuary of <span className="italic text-[#D8C9A7] font-normal">Natural Luxury</span>{' '}
            in Puttur
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#E3E9DF]/80 font-light leading-relaxed">
            Experience bespoke haircuts, organic botanical hair spas, European gold facials, and
            rejuvenating body therapies tailored for discerning men and women.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openBooking()}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#D8C9A7] text-[#26352A] font-semibold text-sm sm:text-base tracking-wide hover:bg-[#FFFFFF] active:scale-95 transition-all shadow-xl flex items-center justify-center space-x-2 group"
            >
              <Sparkles className="w-4 h-4 text-[#26352A] group-hover:rotate-12 transition-transform" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={() => onNavigate('services', 'all')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base tracking-wide border border-[#D8C9A7]/30 backdrop-blur-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Micro trust highlights */}
          <div className="pt-8 border-t border-[#D8C9A7]/20 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[#E3E9DF]/80">
            <div className="flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#D8C9A7]" />
              <span>Hospital-Grade Sanitisation</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#D8C9A7]" />
              <span>Premium Global Brands</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4 text-[#D8C9A7]" />
              <span>Open Daily: 9 AM - 8:30 PM</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-4 h-4 text-[#D8C9A7] fill-current" />
              <span>4.9★ Rated in Puttur</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MEN'S AND WOMEN'S SERVICE CATEGORY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#76603F]">
            Tailored Excellence
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#26352A]">
            Curated Services for Men & Women
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Distinctive service menus designed specifically for modern grooming, therapeutic skin
            restoration, and holistic wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Men's Card */}
          <div
            onClick={() => onNavigate('services', 'men')}
            className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer h-96 bg-[#26352A] flex flex-col justify-end p-8"
          >
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80"
              alt="Illustrative image for men's salon services"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#19231C] via-[#19231C]/60 to-transparent" />
            <div className="relative z-10 space-y-2 text-white">
              <span className="text-[10px] tracking-[0.2em] font-semibold text-[#D8C9A7] uppercase">
                Grooming & Hair
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">Men's Catalogue</h3>
              <p className="text-xs text-[#E3E9DF]/80 line-clamp-2">
                Precision fades, beard sculpts, detox facials, grey blending, and head champi.
              </p>
              <div className="pt-2 flex items-center space-x-1 text-xs font-semibold text-[#D8C9A7] group-hover:text-white transition-colors">
                <span>View Men's Menu</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Women's Card */}
          <div
            onClick={() => onNavigate('services', 'women')}
            className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer h-96 bg-[#26352A] flex flex-col justify-end p-8"
          >
            <img
              src="https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80"
              alt="Illustrative image for women's hair and beauty services"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#19231C] via-[#19231C]/60 to-transparent" />
            <div className="relative z-10 space-y-2 text-white">
              <span className="text-[10px] tracking-[0.2em] font-semibold text-[#D8C9A7] uppercase">
                Couture & Aesthetics
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">Women's Catalogue</h3>
              <p className="text-xs text-[#E3E9DF]/80 line-clamp-2">
                Layered haircuts, balayage, keratin smoothing, bridal radiance facials, and waxing.
              </p>
              <div className="pt-2 flex items-center space-x-1 text-xs font-semibold text-[#D8C9A7] group-hover:text-white transition-colors">
                <span>View Women's Menu</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Spa & Body Card */}
          <div
            onClick={() => onNavigate('services', 'spa')}
            className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer h-96 bg-[#26352A] flex flex-col justify-end p-8"
          >
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
              alt="Spa and Body Treatments Puttur"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#19231C] via-[#19231C]/60 to-transparent" />
            <div className="relative z-10 space-y-2 text-white">
              <span className="text-[10px] tracking-[0.2em] font-semibold text-[#D8C9A7] uppercase">
                Holistic Relaxation
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">Spa & Body Wellness</h3>
              <p className="text-xs text-[#E3E9DF]/80 line-clamp-2">
                Swedish massage, deep tissue therapy, heated paraffin pedicures, and body polishing.
              </p>
              <div className="pt-2 flex items-center space-x-1 text-xs font-semibold text-[#D8C9A7] group-hover:text-white transition-colors">
                <span>View Spa Menu</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES */}
      <section className="bg-[#E3E9DF]/50 py-16 border-y border-[#D8C9A7]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#76603F]">
                Client Favorites
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#26352A]">
                Signature Rituals
              </h2>
            </div>
            <button
              onClick={() => onNavigate('services', 'all')}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-[#26352A] hover:text-[#76603F] transition-colors"
            >
              <span>View All 20+ Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#D8C9A7]/40 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#26352A]/85 backdrop-blur-xs text-[#D8C9A7] text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">
                    {service.gender === 'unisex' ? 'Unisex' : `${service.gender}'s`}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#26352A] leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-400 block">
                        {formatDuration(service.durationMinutes)}
                      </span>
                      <span className="text-base font-bold text-[#26352A]">
                        {formatINR(service.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => openBooking(service)}
                      className="px-3.5 py-2 rounded-xl bg-[#26352A] text-white text-xs font-semibold hover:bg-[#19231C] active:scale-95 transition-all shadow-xs"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#76603F]">
                The Oasis Standard
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#26352A] mt-1">
                Refined Craftsmanship, Elevated Hygiene
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Conveniently located on the 2nd Floor of Providence Plaza by Yelmudi Bridge, THE OASIS
              was established to offer Puttur a truly elevated salon & spa experience without
              compromising on product integrity, privacy, or comfort.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-[#26352A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#26352A]">Authentic Salon Formulations</h4>
                  <p className="text-xs text-gray-500">
                    We use only verified professional brands like L’Oréal Professionnel, Casmara Spain,
                    and cold-pressed botanical oils.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-[#26352A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#26352A]">Hospital-Grade Hygiene</h4>
                  <p className="text-xs text-gray-500">
                    All metal scissors, razors, and nail nippers are sterilised after every service.
                    Freshly laundered or single-use disposable towels are standard.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-[#26352A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#26352A]">Transparent, Honest Pricing</h4>
                  <p className="text-xs text-gray-500">
                    No hidden add-on costs or aggressive upselling. All service prices and durations
                    are clearly communicated upfront.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="px-6 py-3 rounded-full border border-[#26352A] text-[#26352A] font-semibold text-xs hover:bg-[#26352A] hover:text-white transition-all"
              >
                Read Our Story & Standards
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"
                alt="The Oasis Unisex Salon Ambience"
                className="w-full h-[450px] object-cover"
              />
            </div>
            {/* Overlay trust floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-[#D8C9A7]/40 max-w-xs hidden sm:block">
              <div className="flex items-center space-x-2 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs font-bold text-[#26352A] mt-1">
                Puttur’s Premier Unisex Salon
              </p>
              <p className="text-[11px] text-gray-500">
                Ranked #1 for tranquil ambience and styling excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GENUINE CUSTOMER REVIEWS */}
      <section className="bg-[#26352A] text-[#F5F1E8] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D8C9A7]">
              Client Testimonials
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              What Our Guests in Puttur Say
            </h2>
            <p className="text-xs sm:text-sm text-[#E3E9DF]/80 max-w-lg mx-auto">
              Real feedback from guests who trust us with their hair, skin, and wellness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-[#19231C]/80 rounded-2xl p-6 border border-[#D8C9A7]/20 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[#E3E9DF] italic leading-relaxed">
                    "{review.text}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#344839] flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{review.author}</h4>
                    <span className="text-[10px] text-[#A8B7A0]">{review.location}</span>
                  </div>
                  <span className="text-[10px] bg-[#344839] text-[#D8C9A7] px-2 py-0.5 rounded">
                    {review.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#76603F]">
              Visual Tour
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#26352A]">
              Inside The Oasis
            </h2>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-[#26352A] hover:text-[#76603F] transition-colors"
          >
            <span>Explore Full Gallery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GALLERY_ITEMS.slice(0, 6).map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('gallery')}
              className="group relative rounded-xl overflow-hidden cursor-pointer h-56 bg-gray-100"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <span className="text-[10px] uppercase tracking-wider text-[#D8C9A7] font-semibold">
                  {item.category}
                </span>
                <p className="text-xs font-bold text-white">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SALON LOCATION & CONTACT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#D8C9A7]/50 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#76603F]">
                Visit Us in Puttur
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#26352A] mt-1">
                Easy to Reach at Providence Plaza
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Located on the 2nd floor with convenient elevator access, ample parking, and tranquil
              interiors overlooking the Yelmudi area.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#76603F] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#26352A]">2nd Floor, Providence Plaza</p>
                  <p className="text-gray-500">Main Road, Yelmudi Bridge, Puttur, D.K., Karnataka</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-[#76603F] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#26352A]">Operating Schedule</p>
                  <p className="text-gray-500">Open 7 Days a Week: 09:00 AM – 08:30 PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-[#76603F] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#26352A]">Phone Bookings & Enquiries</p>
                  <div className="flex items-center space-x-3 mt-1">
                    {SALON_INFO.phones.map((p) => (
                      <a
                        key={p.raw}
                        href={`tel:${p.raw}`}
                        className="text-[#26352A] font-semibold hover:text-[#76603F] underline"
                      >
                        {p.display}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={SALON_INFO.googleMaps.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-[#26352A] text-white text-xs font-semibold hover:bg-[#19231C] inline-flex items-center space-x-2 shadow-sm"
              >
                <span>Get Google Maps Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={SALON_INFO.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full border border-[#26352A]/40 text-[#26352A] text-xs font-semibold hover:bg-[#E3E9DF] inline-flex items-center space-x-2"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>{SALON_INFO.instagram.handle}</span>
              </a>
            </div>
          </div>

          {/* Embedded Google Map iframe */}
          <div className="rounded-2xl overflow-hidden h-[340px] border border-[#D8C9A7] shadow-inner bg-gray-100">
            <iframe
              title="The Oasis Salon Location"
              src={SALON_INFO.googleMaps.embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
