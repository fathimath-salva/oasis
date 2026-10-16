import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  HelpCircle,
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { getCataloguePriceLabel } from '../lib/formatters';
import type { SalonService, ServiceCategory } from '../types/salon';
import { SERVICE_CATEGORIES } from '../constants/salonData';
import { isFixedPriceService } from '../lib/serviceMapper';

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
  const { openBooking, services: allServices, catalogueLoading, catalogueError } = useBooking();
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

  const serviceGroups = useMemo(() => {
    const genders = selectedGender === 'all' ? ['men', 'women', 'unisex'] as const : [selectedGender];
    return genders.map((gender) => ({
      gender,
      categories: SERVICE_CATEGORIES.map((category) => ({
        category,
        services: filteredServices.filter((service) => service.category === category && (selectedGender === 'all' ? service.gender === gender : service.gender === gender || service.gender === 'unisex')),
      })).filter((group) => group.services.length > 0),
    })).filter((group) => group.categories.length > 0);
  }, [filteredServices, selectedGender]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#53583A]">
          Hair, Beauty & Spa
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#343923]">
          Services & Prices
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Browse hair, beauty and spa services. Price ranges and length options are shown where listed.
        </p>
      </div>

      {catalogueLoading && <p className="mx-auto max-w-4xl text-sm text-[#53583A]" role="status">Loading the live service catalogue…</p>}
      {catalogueError && <p className="mx-auto max-w-4xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert">{catalogueError}</p>}

      {/* Control Bar: Search & Gender Tabs */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#A8B7A0]/40 space-y-4">
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
                  ? 'bg-[#343923] text-white shadow-xs'
                  : 'text-[#343923] hover:bg-[#DDE4D7]'
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
                  ? 'bg-[#343923] text-white shadow-xs'
                  : 'text-[#343923] hover:bg-[#DDE4D7]'
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
                  ? 'bg-[#343923] text-white shadow-xs'
                  : 'text-[#343923] hover:bg-[#DDE4D7]'
              }`}
            >
              Men's Services
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
              className="w-full pl-9 pr-4 py-2 text-base sm:text-sm rounded-xl border border-[#A8B7A0] bg-white focus:outline-none focus:ring-2 focus:ring-[#343923]/20"
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
        {selectedGender !== 'men' && allServices.some((service) => service.gender !== 'men' && service.hairLength) && <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
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
                  ? 'bg-[#53583A] text-white font-semibold'
                  : 'bg-[#F5F1E8] text-gray-700 hover:bg-[#DDE4D7]'
              }`}
            >
              {len.label}
            </button>
          ))}
        </div>}

        {/* Category Pills Slider */}
        <div className="pt-2 border-t border-gray-100 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
              className={`min-h-10 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#343923] text-white'
                : 'bg-[#DDE4D7]/70 text-[#343923] hover:bg-[#DDE4D7]'
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
              className={`min-h-10 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#343923] text-white'
                    : 'bg-[#DDE4D7]/70 text-[#343923] hover:bg-[#DDE4D7]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalogues stay grouped by gender and category so prices remain distinct. */}
      <div className="mx-auto max-w-4xl space-y-10">
        {serviceGroups.map((group) => (
          <section key={group.gender} aria-label={`${group.gender} services`}>
            {selectedGender === 'all' && <h2 className="mb-6 border-b border-[#53583A]/25 pb-3 font-serif text-2xl capitalize text-[#343923]">{group.gender === 'unisex' ? 'Unisex Services' : `${group.gender}'s Services`}</h2>}
            <div className="space-y-8">
              {group.categories.map(({ category, services }) => (
                <section key={category} aria-label={category}>
                  <h3 className="border-b border-[#53583A]/20 pb-2 font-serif text-xl text-[#343923]">{category}</h3>
                  <div className="divide-y divide-[#53583A]/10">
                    {services.map((service) => (
                      <button key={service.id} type="button" onClick={() => setDetailService(service)} aria-label={`View details for ${service.name}`} className="flex w-full items-center justify-between gap-4 py-3 text-left hover:bg-[#EEE7DA]/70">
                        <span className="text-sm text-[#343923] sm:text-base">{service.name}{service.hairLength && <span className="ml-2 text-xs text-[#53583A]">({service.hairLength.replace('_', ' ')})</span>}</span>
                        <span className="shrink-0 text-sm font-medium text-[#343923] sm:text-base">{getCataloguePriceLabel(service)}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#A8B7A0] p-8 space-y-3">
          <p className="font-serif text-xl font-bold text-[#343923]">No services match your filter</p>
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
            className="px-4 py-2 rounded-xl bg-[#343923] text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* SERVICE DETAILS MODAL */}
      {detailService && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-4">
          <div className="relative my-0 sm:my-4 max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto bg-[#F5F1E8] shadow-2xl border border-[#A8B7A0]">
            <img src={detailService.imageUrl || SERVICE_IMAGES[detailService.category]} alt={`Illustrative ${detailService.category.toLowerCase()} treatment`} className="h-56 sm:h-64 w-full object-cover" />
            <p className="absolute top-3 left-3 bg-[#343923]/85 text-white text-[10px] px-3 py-1">Illustrative image</p>
            <div className="p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#53583A]">
                  {detailService.category} · {detailService.gender.toUpperCase()}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#343923] mt-1">
                  {detailService.name}
                </h3>
              </div>
              <button
                onClick={() => setDetailService(null)}
                className="min-h-11 min-w-11 text-gray-400 hover:text-gray-600 p-1"
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
              {detailService.gender !== 'men' && detailService.hairLength && (
                <div>
                  <span className="text-gray-500 block text-[11px]">Hair Length</span>
                  <span className="font-bold text-[#343923] capitalize">
                    {detailService.hairLength.replace('_', ' ')}
                  </span>
                </div>
              )}
              <div className="text-right">
                <span className="text-gray-500 block text-[11px]">Official Price</span>
                <span className="font-bold text-lg text-[#343923]">
                  {getCataloguePriceLabel(detailService)}
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
                disabled={!isFixedPriceService(detailService)}
                className="px-6 py-2 bg-[#343923] text-white rounded-xl text-xs font-semibold hover:bg-[#19231C] disabled:opacity-50"
              >
                {isFixedPriceService(detailService) ? 'Book This Service' : 'Price confirmation required'}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
