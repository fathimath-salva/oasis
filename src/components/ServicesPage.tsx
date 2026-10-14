import React, { useState, useMemo } from 'react';
import {
  Search,
  Info,
  X,
  HelpCircle,
} from 'lucide-react';
import { db } from '../lib/db';
import { useBooking } from '../context/BookingContext';
import { formatServicePrice } from '../lib/formatters';
import type { SalonService, ServiceCategory } from '../types/salon';
import { SERVICE_CATEGORIES } from '../constants/salonData';

// Stock images are illustrative previews, not photographs of this salon.
const SERVICE_IMAGES: Record<string, string> = {
  'Hair Cutting': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85',
  'Hair Wash': 'https://images.unsplash.com/photo-1560869713-da86a9ec9d13?auto=format&fit=crop&w=1200&q=85',
  'Blow Dry': 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=85',
  'Smoothening / Straightening': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85',
  'Keratin Treatment': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85',
  'Classic Facial': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85',
  'Premium Facial': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85',
  'Clean-Up': 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=85',
  'Bleach & Add-On': 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=85',
  'Hair Colour': 'https://images.unsplash.com/photo-1560869713-da86a9ec9d13?auto=format&fit=crop&w=1200&q=85',
  'Manicure': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85',
  'Pedicure': 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&q=85',
  'Hair Spa': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85',
  'Waxing': 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=85',
  'Brazilian Waxing': 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=85',
  'Threading': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85',
  'Body Spa & Massage': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=85',
};

interface ServicesPageProps {
  initialFilter?: string; // 'all' | 'men' | 'women' | 'spa' | specific category name
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ initialFilter = 'all' }) => {
  const { openBooking } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'all' | 'men' | 'women'>(() => {
    if (initialFilter === 'men') return 'men';
    if (initialFilter === 'women') return 'women';
    return 'all';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (initialFilter === 'spa') return 'spa';
    if (SERVICE_CATEGORIES.includes(initialFilter as ServiceCategory)) return initialFilter;
    return 'all';
  });

  const [selectedLength, setSelectedLength] = useState<string>('all');
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
      setSelectedCategory('spa');
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

  // Filter available categories based on active gender
  const availableCategories = useMemo(() => {
    const list = selectedGender === 'all'
      ? allServices
      : allServices.filter((s) => s.gender === selectedGender || s.gender === 'unisex');
    const set = new Set(list.map((s) => s.category));
    return SERVICE_CATEGORIES.filter((c) => set.has(c));
  }, [allServices, selectedGender]);

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
        const isSpaGroup = selectedCategory === 'spa' && ['Hair Spa', 'Body Spa & Massage'].includes(service.category);
        if (!isSpaGroup && service.category !== selectedCategory) {
          return false;
        }
      }

      // Hair length filter
      if (selectedLength !== 'all') {
        if (service.hairLength !== selectedLength) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = service.name.toLowerCase().includes(q);
        const matchesDesc = (service.description || '').toLowerCase().includes(q);
        const matchesCategory = service.category.toLowerCase().includes(q);
        const matchesNote = (service.sourceNote || '').toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesCategory || matchesNote;
      }

      return true;
    });
  }, [allServices, selectedGender, selectedCategory, selectedLength, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#76603F]">
          Hair, Beauty & Spa
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#26352A]">
          Services & Prices
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Browse hair, beauty and spa services. Price ranges and length options are shown where listed.
        </p>
      </div>

      {/* Control Bar: Search & Gender Tabs */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D8C9A7]/40 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Gender Filter Tabs */}
          <div className="flex items-center space-x-1.5 bg-[#F5F1E8] p-1.5 rounded-xl w-full md:w-auto">
            <button
              onClick={() => {
                setSelectedGender('all');
                setSelectedCategory('all');
              }}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedGender === 'all'
                  ? 'bg-[#26352A] text-white shadow-xs'
                  : 'text-[#26352A] hover:bg-[#E3E9DF]'
              }`}
            >
              All Services
            </button>
            <button
              onClick={() => {
                setSelectedGender('women');
                setSelectedCategory('all');
              }}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedGender === 'women'
                  ? 'bg-[#26352A] text-white shadow-xs'
                  : 'text-[#26352A] hover:bg-[#E3E9DF]'
              }`}
            >
              Women's Services
            </button>
            <button
              onClick={() => {
                setSelectedGender('men');
                setSelectedCategory('all');
              }}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedGender === 'men'
                  ? 'bg-[#26352A] text-white shadow-xs'
                  : 'text-[#26352A] hover:bg-[#E3E9DF]'
              }`}
            >
              Men's Catalogue (Oasis-men’s Catalog.pdf)
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, treatment, or fruit..."
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

        {/* Hair Length Filter (when viewing hair categories) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Hair Length Filter:
          </span>
          {[
            { id: 'all', label: 'All Lengths' },
            { id: 'short', label: 'Short' },
            { id: 'medium', label: 'Medium' },
            { id: 'long', label: 'Long' },
            { id: 'extra_long', label: 'Extra Long' },
          ].map((len) => (
            <button
              key={len.id}
              onClick={() => setSelectedLength(len.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedLength === len.id
                  ? 'bg-[#76603F] text-white font-semibold'
                  : 'bg-[#F5F1E8] text-gray-700 hover:bg-[#E3E9DF]'
              }`}
            >
              {len.label}
            </button>
          ))}
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
            All Groups ({filteredServices.length})
          </button>
          {availableCategories.map((cat) => {
            const count = allServices.filter((s) => {
              if (selectedGender !== 'all' && s.gender !== selectedGender && s.gender !== 'unisex') return false;
              return s.category === cat;
            }).length;
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
      <div className="max-w-4xl mx-auto divide-y divide-[#53583A]/20">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white/70 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group"
          >
            {/* Top row: Category, gender tag, hair length tag */}
            <div>
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#76603F]">
                  {service.category}
                </span>

                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      service.gender === 'men'
                        ? 'bg-[#DDE4D7] text-[#343923]'
                        : 'bg-[#EEE7DA] text-[#343923]'
                    }`}
                  >
                    {service.gender === 'men' ? "Men's" : "Women's"}
                  </span>
                  {service.hairLength && (
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E3E9DF] text-[#26352A]">
                      {service.hairLength.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-serif text-lg font-bold text-[#26352A] group-hover:text-[#76603F] transition-colors mt-1.5 leading-snug">
                {service.name}
              </h3>

            </div>

            {/* Price & CTA */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-400 flex items-center space-x-1">
                  <span>{service.category}</span>
                </span>
                <span className="text-lg font-bold text-[#26352A] block mt-0.5">
                  {service.priceConfirmed && !service.requiresConfirmation ? formatServicePrice(service) : 'Price to be confirmed'}
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setDetailService(service)}
                  className="p-2 rounded-xl text-gray-600 hover:bg-[#E3E9DF] transition-colors"
                  title="View details"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openBooking(service)}
                  disabled={!service.priceConfirmed || service.requiresConfirmation}
                  className="px-4 py-2 rounded-xl bg-[#26352A] text-white text-xs font-semibold hover:bg-[#19231C] active:scale-95 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!service.priceConfirmed || service.requiresConfirmation ? 'Ask the Salon' : 'Book Service'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#D8C9A7] p-8 space-y-3">
          <p className="font-serif text-xl font-bold text-[#26352A]">No services match your filter</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try switching catalogue tabs or clearing the search keywords.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGender('all');
              setSelectedCategory('all');
              setSelectedLength('all');
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
          <div className="relative w-full max-w-xl bg-[#F5F1E8] shadow-2xl overflow-hidden border border-[#D8C9A7]">
            <img src={detailService.imageUrl || SERVICE_IMAGES[detailService.category]} alt={`Illustrative ${detailService.category.toLowerCase()} treatment`} className="h-56 sm:h-64 w-full object-cover" />
            <p className="absolute top-3 left-3 bg-[#343923]/85 text-white text-[10px] px-3 py-1">Illustrative image</p>
            <div className="p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76603F]">
                  {detailService.category} • {detailService.gender.toUpperCase()}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#26352A] mt-1">
                  {detailService.name}
                </h3>
              </div>
              <button
                onClick={() => setDetailService(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">{detailService.description || `Ask our team about ${detailService.name.toLowerCase()}, what the appointment includes, and which option is right for you.`}</p>

            {detailService.sourceNote && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center space-x-1">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  <span>Catalogue Note</span>
                </span>
                <p className="text-[11px] italic">{detailService.sourceNote}</p>
              </div>
            )}

            <div className="p-4 bg-[#F5F1E8] rounded-xl flex items-center justify-between text-xs">
              {detailService.hairLength && (
                <div>
                  <span className="text-gray-500 block text-[11px]">Hair Length</span>
                  <span className="font-bold text-[#26352A] capitalize">
                    {detailService.hairLength.replace('_', ' ')}
                  </span>
                </div>
              )}
              <div className="text-right">
                <span className="text-gray-500 block text-[11px]">Official Price</span>
                <span className="font-bold text-lg text-[#26352A]">
                  {detailService.priceConfirmed && !detailService.requiresConfirmation ? formatServicePrice(detailService) : 'Price to be confirmed'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
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
                disabled={!detailService.priceConfirmed || detailService.requiresConfirmation}
                className="px-6 py-2 bg-[#26352A] text-white rounded-xl text-xs font-semibold hover:bg-[#19231C] disabled:opacity-50"
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
