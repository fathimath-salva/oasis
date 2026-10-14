import React from 'react';
import { useBooking } from '../context/BookingContext';

export const AboutPage: React.FC = () => {
  const { openBooking } = useBooking();

  return (
    <main className="bg-[#F5F1E8]">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#53583A]">Our Story</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-[#343923] sm:text-5xl">The OASIS Story</h1>
            <p className="mt-4 text-sm leading-7 text-[#53583A]">Welcome to THE OASIS UNISEX SALON & SPA - a place to take a little time for yourself. Explore hair, beauty and spa services in a comfortable setting, with a focus on personal care and helping you feel your best. We look forward to welcoming you.</p>
            <button onClick={() => openBooking()} className="mt-7 bg-[#53583A] px-6 py-3 text-sm font-medium text-white hover:bg-[#343923]">Book Appointment</button>
          </div>
          <figure className="relative">
            <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85" alt="Illustrative hair styling photograph" className="aspect-[4/3] w-full object-cover" />
            <figcaption className="absolute bottom-3 left-3 bg-[#F5F1E8]/90 px-3 py-1.5 text-[10px] text-[#343923]">Illustrative image</figcaption>
          </figure>
        </div>
      </section>
    </main>
  );
};
