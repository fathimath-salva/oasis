import React from 'react';
import { useBooking } from '../context/BookingContext';

export const AboutPage: React.FC = () => {
  const { openBooking } = useBooking();

  return (
    <main className="bg-[#F5F1E8]">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <p className="eyebrow">Our Story · Puttur</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-[#292622] sm:text-5xl">The OASIS Story</h1>
            <p className="mt-4 text-sm leading-7 text-[#53583A]">Welcome to THE OASIS UNISEX SALON & SPA - a place to take a little time for yourself. Explore hair, beauty and spa services in a comfortable setting, with a focus on personal care and helping you feel your best. We look forward to welcoming you.</p>
            <button onClick={() => openBooking()} className="button-gold mt-7">Book Appointment</button>
          </div>
          <figure className="relative">
            <img src="/images/women-beauty.jpg" alt="Women’s beauty portrait from the OASIS catalogue" className="aspect-[4/3] w-full object-cover" loading="lazy" />
          </figure>
        </div>
      </section>
    </main>
  );
};
