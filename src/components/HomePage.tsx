import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { SALON_INFO } from '../constants/salonData';
import { getCataloguePriceLabel } from '../lib/formatters';
import { isFixedPriceService } from '../lib/serviceMapper';

const SERVICE_COLLECTIONS = [
  { title: "Men's Services", filter: 'men', description: 'Haircuts, colour and grooming services for men.', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=85', alt: 'Illustrative colour photograph of a barbershop' },
  { title: "Women's Services", filter: 'women', description: 'Hair, beauty and personal care services for women.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85', alt: 'Illustrative colour photograph of hair styling' },
  { title: 'Spa & Body Treatments', filter: 'spa', description: 'Explore the hair spa and body treatments in our catalogue.', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85', alt: 'Illustrative colour photograph of a spa treatment room' },
];

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
  const { openBooking, services, catalogueLoading, catalogueError } = useBooking();

  // Featured curated services selected by stable ID
  const featuredServices = [
    'w-cut-4',
    'm-spa-m1',
    'w-spa-4',
    'w-pf-6',
  ]
    .map((sourceKey) => {
      const svc = services.find((service) => service.sourceKey === sourceKey);
      if (!svc) return null;
      return { ...svc, imageUrl: svc.imageUrl || FEATURED_IMAGES[sourceKey] };
    })
    .filter((service) => service !== null);

  return (
    <div className="space-y-8 pb-14 sm:space-y-10">
      {/* 1. HERO SECTION */}
      <section className="bg-[#F5F1E8] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl space-y-5">
            <p className="text-xs font-medium tracking-wide text-[#53583A] sm:text-sm">Providence Plaza, Yelmudi Bridge, Puttur</p>
            <h1 className="font-serif text-4xl leading-tight text-[#343923] sm:text-5xl lg:text-6xl">Take a little time for yourself</h1>
            <p className="max-w-lg text-sm leading-7 text-[#53583A] sm:text-base">Haircuts, facials, hair spa and body treatments for men and women. Come in, relax and let us take care of you.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => openBooking()} className="bg-[#53583A] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#343923]">Book Appointment</button>
              <button onClick={() => onNavigate('services', 'all')} className="border border-[#53583A]/40 px-6 py-3 text-sm font-medium text-[#343923] transition-colors hover:bg-[#EEE7DA]">View Services</button>
            </div>
          </div>
          <figure className="relative min-w-0">
            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=85" alt="Illustrative salon interior with natural light" className="aspect-[4/3] w-full object-cover" />
            <figcaption className="absolute bottom-3 left-3 bg-[#F5F1E8]/90 px-3 py-1.5 text-[10px] text-[#343923]">Illustrative image</figcaption>
            <span className="absolute -right-2 -top-2 -z-0 h-20 w-20 border-r-4 border-t-4 border-[#C98C6B] sm:-right-4 sm:-top-4 sm:h-28 sm:w-28" aria-hidden="true" />
          </figure>
        </div>
        <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-3 border-t border-[#53583A]/20 pt-5 text-sm text-[#343923] sm:grid-cols-3 sm:gap-6">
          <p className="text-center sm:text-left">Services for men and women</p>
          <p className="text-center sm:text-left">Providence Plaza, Puttur</p>
          <a className="text-center underline underline-offset-4 hover:text-[#53583A] sm:text-left" href={`tel:${SALON_INFO.phones[0].raw}`}>Call 9151550077</a>
        </div>
      </section>
      {/* 2. SERVICE COLLECTIONS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#53583A]">Our services</p>
          <h2 className="mt-2 font-serif text-3xl text-[#343923] sm:text-4xl">Choose what feels right for you</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_COLLECTIONS.map((collection, index) => <article key={collection.filter} className={`overflow-hidden border border-[#53583A]/15 bg-white ${index === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
            <div className="relative"><img src={collection.image} alt={collection.alt} className="h-48 w-full object-cover" /><span className="absolute left-3 top-3 bg-[#F5F1E8]/90 px-2.5 py-1 text-[10px] text-[#343923]">Illustrative image</span></div>
            <div className="p-5"><h3 className="font-serif text-2xl text-[#343923]">{collection.title}</h3><p className="mt-2 text-sm leading-6 text-[#53583A]">{collection.description}</p><button onClick={() => onNavigate('services', collection.filter)} className="mt-4 text-sm font-medium text-[#53583A] underline underline-offset-4">Explore services <ArrowRight className="ml-1 inline h-4 w-4" /></button></div>
          </article>)}
        </div>
      </section>
      {/* 3. FEATURED SERVICES */}
      <section className="bg-[#DDE4D7]/50 py-16 border-y border-[#A8B7A0]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#53583A]">Explore the catalogue</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#343923]">Popular Services</h2>
            </div>
            <button
              onClick={() => onNavigate('services', 'all')}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-[#343923] hover:text-[#53583A] transition-colors"
            >
              <span>View all services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {catalogueError && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert">{catalogueError}</p>}
          {catalogueLoading && <p className="mb-5 text-sm text-[#53583A]" role="status">Loading the live service catalogue…</p>}
          {!catalogueLoading && !catalogueError && featuredServices.length === 0 && <p className="mb-5 rounded-xl bg-white p-4 text-sm text-[#53583A]" role="status">No featured services are available yet. Browse the service catalogue or contact the salon.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white border-b border-[#53583A]/20 transition-colors flex flex-col justify-between group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.imageUrl}
                    alt={`Illustrative colour photo for ${service.category.toLowerCase()}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#F5F1E8]/90 text-[#343923] text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
                    {service.gender === 'unisex' ? 'Unisex' : `${service.gender}'s`}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#343923] leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                    <p className="mt-2 text-[10px] text-[#53583A]">Illustrative image</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-medium text-[#343923]">
                        {getCataloguePriceLabel(service)}
                      </span>
                    </div>

                    <button
                      onClick={() => openBooking(service)}
                      disabled={!isFixedPriceService(service)}
                      className="px-3.5 py-2 bg-[#53583A] text-white text-xs font-medium hover:bg-[#343923] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isFixedPriceService(service) ? 'Book Now' : 'Not bookable yet'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE OASIS STORY */}
      <section className="bg-[#EEE7DA] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#53583A]">Our Story</p>
            <h2 className="mt-2 font-serif text-3xl text-[#343923] sm:text-4xl">The OASIS Story</h2>
            <p className="mt-4 text-sm leading-7 text-[#53583A]">Welcome to THE OASIS UNISEX SALON & SPA - a place to take a little time for yourself. Explore hair, beauty and spa services in a comfortable setting, with a focus on personal care and helping you feel your best. We look forward to welcoming you.</p>
            <button onClick={() => onNavigate('about')} className="mt-5 text-sm font-medium text-[#343923] underline underline-offset-4">Our Story</button>
          </div>
          <figure className="relative">
            <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85" alt="Illustrative spa treatment room" className="aspect-[4/3] w-full object-cover" />
            <figcaption className="absolute bottom-3 left-3 bg-[#F5F1E8]/90 px-3 py-1.5 text-[10px] text-[#343923]">Illustrative image</figcaption>
          </figure>
        </div>
      </section>
      {/* 7. SALON LOCATION & CONTACT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 border-y border-[#53583A]/20 py-8 md:grid-cols-3 md:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#53583A]">Visit us</p>
            <h2 className="mt-2 font-serif text-3xl text-[#343923]">Find THE OASIS</h2>
            <p className="mt-4 text-sm leading-6 text-[#53583A]">2nd Floor, Providence Plaza<br />Main Road, Yelmudi Bridge<br />Puttur, D.K., Karnataka, India</p>
            <p className="mt-3 text-sm leading-6 text-[#53583A]">Call, message, or get directions to plan your visit.</p>
          </div>
          <figure className="relative">
            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80" alt="Illustrative colour photo of a salon interior" className="aspect-[16/10] w-full object-cover" />
            <figcaption className="absolute bottom-2 left-2 bg-[#F5F1E8]/90 px-2 py-1 text-[10px] text-[#343923]">Illustrative image</figcaption>
          </figure>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {SALON_INFO.phones.map((phone) => <a key={phone.raw} href={`tel:${phone.raw}`} className="border border-[#53583A]/35 px-4 py-2.5 text-sm text-[#343923] hover:bg-[#EEE7DA]">Call {phone.display}</a>)}
            <a href={SALON_INFO.googleMaps.url} target="_blank" rel="noopener noreferrer" className="bg-[#53583A] px-4 py-2.5 text-sm text-white hover:bg-[#343923]">Get Directions</a>
            <button onClick={() => onNavigate('contact')} className="border border-[#53583A]/35 px-4 py-2.5 text-sm text-[#343923] hover:bg-[#EEE7DA]">Contact details</button>
          </div>
        </div>
      </section>
    </div>
  );
};
