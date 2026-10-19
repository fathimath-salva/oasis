import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { SalonService } from '../types/salon';
import { salonRepository } from '../lib/repository';
import { isFixedPriceService, toSalonService } from '../lib/serviceMapper';
import { useAuth } from './AuthContext';

interface CustomerContact {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
}

interface BookingContextType {
  isOpen: boolean;
  step: number;
  services: SalonService[];
  catalogueLoading: boolean;
  catalogueError: string | null;
  selectedServices: SalonService[];
  selectedDate: string;
  selectedSlot: string;
  contact: CustomerContact;
  error: string | null;
  availabilityLoading: boolean;
  availabilityError: string | null;

  // Computed
  totalPrice: number;
  totalDuration: number;
  availableSlots: string[];

  // Actions
  openBooking: (initialService?: SalonService) => void;
  closeBooking: () => void;
  setStep: (step: number) => void;
  toggleService: (service: SalonService) => void;
  removeService: (serviceId: string) => void;
  clearServices: () => void;
  setSelectedDate: (date: string) => void;
  setSelectedSlot: (slot: string) => void;
  setContact: (updates: Partial<CustomerContact>) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<SalonService[]>([]);
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [catalogueError, setCatalogueError] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<SalonService[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Default to tomorrow's date
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(tomorrowStr);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [contact, setContactState] = useState<CustomerContact>({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setCatalogueLoading(true);
    setCatalogueError(null);
    void salonRepository.getServices().then((records) => {
      if (active) setServices(records.map(toSalonService));
    }).catch((loadError: unknown) => {
      if (!active) return;
      setServices([]);
      setCatalogueError(loadError instanceof Error ? loadError.message : 'Could not load the live service catalogue.');
    }).finally(() => {
      if (active) setCatalogueLoading(false);
    });
    return () => { active = false; };
  }, []);

  // Sync user info if user logs in
  React.useEffect(() => {
    if (user) {
      setContactState((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName,
        phone: prev.phone || user.phone,
        email: prev.email || user.email,
      }));
    }
  }, [user]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [selectedServices]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot('');
  };

  useEffect(() => {
    let active = true;
    const selectedServiceIds = selectedServices.map((service) => service.id).sort();
    setAvailableSlots([]);
    setSelectedSlot('');
    setAvailabilityError(null);
    if (!selectedDate || selectedServiceIds.length === 0) {
      setAvailabilityLoading(false);
      return () => { active = false; };
    }
    if (selectedServices.some((service) => !isFixedPriceService(service))) {
      setAvailabilityLoading(false);
      setAvailabilityError('Choose only active, fixed-price services with confirmed prices to check availability.');
      return () => { active = false; };
    }
    setAvailabilityLoading(true);
    void salonRepository.getAvailableSlots({
      date: selectedDate,
      serviceIds: selectedServiceIds,
    }).then((slots) => {
      if (active) setAvailableSlots(slots.map((slot) => slot.slice(0, 5)));
    }).catch((loadError: unknown) => {
      if (!active) return;
      setAvailableSlots([]);
      setAvailabilityError(loadError instanceof Error ? loadError.message : 'Could not load live availability.');
    }).finally(() => {
      if (active) setAvailabilityLoading(false);
    });
    return () => { active = false; };
  }, [selectedDate, selectedServices]);

  const openBooking = (initialService?: SalonService) => {
    if (initialService) {
      const liveService = services.find((service) => service.id === initialService.id);
      if (!liveService || !isFixedPriceService(liveService)) {
        setSelectedServices([]);
        setStep(1);
        setError('This service is unavailable for booking. Choose an active service with a confirmed fixed price.');
      } else {
        setSelectedServices([liveService]);
        setStep(2); // Jump straight to date & staff selection
        setError(null);
      }
    } else {
      setStep(1);
      setError(null);
    }
    setIsOpen(true);
  };

  const closeBooking = () => {
    setIsOpen(false);
  };

  const toggleService = (service: SalonService) => {
    const liveService = services.find((item) => item.id === service.id);
    if (!liveService || !isFixedPriceService(liveService)) return;
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, liveService];
      }
    });
  };

  const removeService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const clearServices = () => {
    setSelectedServices([]);
  };

  const setContact = (updates: Partial<CustomerContact>) => {
    setContactState((prev) => ({ ...prev, ...updates }));
  };

  const resetBooking = () => {
    setSelectedServices([]);
    setSelectedSlot('');
    setError(null);
    setAvailableSlots([]);
    setAvailabilityError(null);
    setStep(1);
  };

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        step,
        services,
        catalogueLoading,
        catalogueError,
        selectedServices,
        selectedDate,
        selectedSlot,
        contact,
        error,
        availabilityLoading,
        availabilityError,
        totalPrice,
        totalDuration,
        availableSlots,
        openBooking,
        closeBooking,
        setStep,
        toggleService,
        removeService,
        clearServices,
        setSelectedDate: handleDateChange,
        setSelectedSlot,
        setContact,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
