import React, { useState, useMemo } from 'react';
import {
  Search,
  Clock,
  Info,
  X,
  AlertCircle,
} from 'lucide-react';
import { db } from '../lib/db';
import { useBooking } from '../context/BookingContext';
import { formatINR, formatDuration } from '../lib/formatters';
import type { SalonService, ServiceCategory } from '../types/salon';
import { SERVICE_CATEGORIES } from '../constants/salonData';

interface ServicesPageProps {
  initialFilter?: string; // 'all' | 'men' | 'women' | 'spa' | specific category name
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ initialFilter = 'all' }) => {
  const { openBooking } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>(() => {
    if (initialFilter === 'men') return 'men';
    if (initialFilter === 'women') return 'women';
    return 'all';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (initialFilter === 'spa') return 'Body spa and massage';
    if (SERVICE_CATEGORIES.includes(initialFilter as ServiceCategory)) return initialFilter;
    return 'all';
  });

  const [detailService, setDetailService] = useState<SalonService | null>(null);

  // Sync if prop changes
  React.useEffect(() => {
    if (initialFilter === 'men') {
      setSelectedGender('men');
      setSelectedCategory('all');
    } else if (initialFilter === 'women') {
      setSelectedGender('women');
      setSelectedCategory('all');
    } else if (initialFilter === 'spa') {
      setSelectedCategory('Body spa and massage');
      setSelectedGender('all');
    } else if (SERVICE_CATEGORIES.includes(initialFilter as ServiceCategory)) {
      setSelectedCategory(initialFilter);
      setSelectedGender('all');
    } else if (initialFilter === 'all') {
      setSelectedGender('all');
      setSelectedCategory('all');
    }
  }, [initialFilter]);

  const allServices = useMemo(() => db.getServices().filter((s) => s.isActive), []);

  const filteredServices = useMemo(() => {
    return allServices.filter((service) => {
      // Gender filter
      if (selectedGender !== 'all') {
        if (service.gender !== selectedGender && service.gender !== 'unisex') {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (service.category !== selectedCategory) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = service.name.toLowerCase().includes(q);
        const matchesDesc = service.description.toLowerCase().includes(q);
        const matchesCategory = service.category.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesCategory;
      }

      return true;
    });
  }, [allServices, selectedGender, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#76603F]">
          The Oasis Salon Catalogue
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#26352A]">
          Services & Rituals Menu
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Explore our complete collection of haircuts, hair botox, European facials, bridal
          makeovers, waxing, and deep relaxation body massages.
        </p>
      </div>

      {/* Control Bar: Search & Gender Tabs */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#D8C9A7]/40 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Gender Filter Tabs */}
          <div className="flex items-center space-x-1.5 bg-[#F5F1E8] p-1.5 rounded-xl w-full md:w-auto">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'men', label: "Men's Catalogue" },
              { id: 'women', label: "Women's Catalogue" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedGender(tab.id)}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  selectedGender === tab.id
                    ? 'bg-[#26352A] text-white shadow-xs'
                    : 'text-[#26352A] hover:bg-[#E3E9DF]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by service name, treatment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D8C9A7] bg-white focus:outline-none focus:ring-2 focus:ring-[#26352A]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="pt-2 border-t border-gray-100 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#26352A] text-white'
                : 'bg-[#E3E9DF]/70 text-[#26352A] hover:bg-[#E3E9DF]'
            }`}
          >
            All Categories ({allServices.length})
          </button>
          {SERVICE_CATEGORIES.map((cat) => {
            const count = allServices.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#26352A] text-white'
                    : 'bg-[#E3E9DF]/70 text-[#26352A] hover:bg-[#E3E9DF]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl overflow-hidden shadow-xs border border-[#D8C9A7]/40 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            {/* Image banner */}
            <div className="relative h-48 overflow-hidden bg-gray-100">
              <img
                src={
                  service.imageUrl ||
                  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'
                }
                alt={service.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                <span className="bg-[#26352A]/90 backdrop-blur-xs text-[#D8C9A7] text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">
                  {service.gender === 'unisex' ? 'Unisex' : `${service.gender}'s`}
                </span>
                {!service.priceConfirmed && (
                  <span className="bg-amber-100/95 text-amber-900 border border-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full">
                    Awaiting Salon Confirmation
                  </span>
                )}
              </div>
            </div>

            {/* Service info */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#76603F] block mb-1">
                  {service.category}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#26352A] group-hover:text-[#76603F] transition-colors leading-snug">
                  {service.name}
                </h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Price, duration & CTA */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-[#A8B7A0]" />
                    <span>{formatDuration(service.durationMinutes)}</span>
                  </div>
                  <div className="flex items-baseline space-x-1 mt-0.5">
                    <span className="text-lg font-bold text-[#26352A]">
                      {formatINR(service.price)}
                    </span>
                    {!service.priceConfirmed && (
                      <span className="text-[10px] text-amber-700 italic font-medium">est.</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setDetailService(service)}
                    className="p-2 rounded-xl text-[#26352A] hover:bg-[#E3E9DF] transition-colors text-xs"
                    title="View treatment details"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openBooking(service)}
                    className="px-4 py-2 rounded-xl bg-[#26352A] text-white text-xs font-semibold hover:bg-[#19231C] active:scale-95 transition-all shadow-xs"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#D8C9A7] p-8 space-y-3">
          <p className="font-serif text-xl font-bold text-[#26352A]">No services found</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            We couldn’t find any services matching your search or filter. Try clearing the filter
            or searching for another term.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGender('all');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#26352A] text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* SERVICE DETAILS MODAL */}
      {detailService && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#D8C9A7]">
            <div className="relative h-48 bg-gray-100">
              <img
                src={detailService.imageUrl}
                alt={detailService.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setDetailService(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76603F]">
                  {detailService.category} • {detailService.gender.toUpperCase()}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#26352A] mt-1">
                  {detailService.name}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {detailService.description}
              </p>

              <div className="p-3.5 bg-[#F5F1E8] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px]">Treatment Duration</span>
                  <span className="font-bold text-[#26352A]">
                    {formatDuration(detailService.durationMinutes)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[11px]">Price in INR</span>
                  <span className="font-bold text-lg text-[#26352A]">
                    {formatINR(detailService.price)}
                  </span>
                </div>
              </div>

              {!detailService.priceConfirmed && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    This service price is awaiting administrator review and will be confirmed
                    directly at the salon reception.
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setDetailService(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const s = detailService;
                    setDetailService(null);
                    openBooking(s);
                  }}
                  className="px-6 py-2 bg-[#26352A] text-white rounded-xl text-xs font-semibold hover:bg-[#19231C]"
                >
                  Book This Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
