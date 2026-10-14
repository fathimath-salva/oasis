import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { GALLERY_ITEMS } from '../constants/salonData';
import { useBooking } from '../context/BookingContext';

export const GalleryPage: React.FC = () => {
  const { openBooking } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Ambience', 'Hair', 'Facials & Skin', 'Spa & Wellness'];

  const filteredItems =
    selectedCategory === 'All'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#53583A]">
          Treatment Inspiration
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#343923]">
          Hair, Beauty & Spa Inspiration
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          These illustrative stock images show examples of hair, beauty and spa treatments. They are not photographs of this salon.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-[#343923] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-[#A8B7A0]/40 hover:bg-[#DDE4D7]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl overflow-hidden shadow-sm bg-white border border-[#A8B7A0]/40 flex flex-col justify-between"
          >
            <div className="relative h-72 overflow-hidden bg-gray-100">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 bg-[#343923]/85 text-[#A8B7A0] text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full backdrop-blur-xs">
                Illustrative | {item.category}
              </div>
            </div>

            <div className="p-5 space-y-1.5">
              <h3 className="font-serif text-lg font-bold text-[#343923] group-hover:text-[#53583A] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="bg-[#343923] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-4xl mx-auto shadow-xl">
        <Sparkles className="w-8 h-8 text-[#A8B7A0] mx-auto" />
        <h2 className="font-serif text-2xl sm:text-3xl font-bold">
          Ready to Experience The Oasis?
        </h2>
        <p className="text-xs sm:text-sm text-[#DDE4D7]/80 max-w-lg mx-auto">
          Visit us at Providence Plaza, Yelmudi Bridge, Puttur, or book your appointment online in
          less than 2 minutes.
        </p>
        <button
          onClick={() => openBooking()}
          className="px-8 py-3.5 bg-[#A8B7A0] text-[#343923] rounded-full font-semibold text-xs sm:text-sm tracking-wide hover:bg-white active:scale-95 transition-all shadow-md inline-flex items-center space-x-2"
        >
          <span>Reserve an Appointment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
