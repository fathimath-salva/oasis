import React, { createContext, useContext, useState, useMemo } from 'react';
import type { SalonService, Appointment } from '../types/salon';
import { db } from '../lib/db';
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
  selectedServices: SalonService[];
  selectedStaffId: string | undefined;
  selectedDate: string;
  selectedSlot: string;
  contact: CustomerContact;
  lastConfirmedAppointment: Appointment | null;
  error: string | null;
  isSubmitting: boolean;

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
  setSelectedStaffId: (staffId: string | undefined) => void;
  setSelectedDate: (date: string) => void;
  setSelectedSlot: (slot: string) => void;
  setContact: (updates: Partial<CustomerContact>) => void;
  submitBooking: () => Promise<Appointment | null>;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<SalonService[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>(undefined);

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

  const [lastConfirmedAppointment, setLastConfirmedAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const availableSlots = useMemo(() => {
    if (!selectedDate || totalDuration === 0) return [];
    return db.getAvailableSlots(selectedDate, totalDuration, selectedStaffId);
  }, [selectedDate, totalDuration, selectedStaffId]);

  const openBooking = (initialService?: SalonService) => {
    if (initialService) {
      if (!initialService.priceConfirmed || initialService.requiresConfirmation) {
        setSelectedServices([]);
        setStep(1);
        setError('This service price needs confirmation from the salon before it can be booked.');
      } else {
        setSelectedServices([initialService]);
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
    if (!service.priceConfirmed || service.requiresConfirmation) return;
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
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

  const submitBooking = async (): Promise<Appointment | null> => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (selectedServices.length === 0) {
        throw new Error('Please select at least one service.');
      }
      if (!selectedDate || !selectedSlot) {
        throw new Error('Please choose a valid appointment date and available time slot.');
      }
      if (!contact.fullName.trim() || !contact.phone.trim()) {
        throw new Error('Please provide your name and contact phone number.');
      }

      // Look up staff name if selected
      const staffMember = selectedStaffId ? db.getStaffById(selectedStaffId) : undefined;

      const result = db.createAppointment({
        customerId: user?.id || `guest-${Date.now()}`,
        customerName: contact.fullName.trim(),
        customerPhone: contact.phone.trim(),
        customerEmail: contact.email.trim() || 'customer@oasis-salon.in',
        staffId: selectedStaffId,
        staffName: staffMember?.name,
        appointmentDate: selectedDate,
        startTime: selectedSlot,
        totalDurationMinutes: totalDuration,
        totalPrice,
        status: 'confirmed',
        services: selectedServices,
        notes: contact.notes.trim() || undefined,
      });

      if (!result.success || !result.appointment) {
        throw new Error(result.error || 'Failed to confirm booking due to slot conflict.');
      }

      setLastConfirmedAppointment(result.appointment);
      setStep(5); // Success step
      return result.appointment;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed';
      setError(msg);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setSelectedServices([]);
    setSelectedStaffId(undefined);
    setSelectedSlot('');
    setError(null);
    setLastConfirmedAppointment(null);
    setStep(1);
  };

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        step,
        selectedServices,
        selectedStaffId,
        selectedDate,
        selectedSlot,
        contact,
        lastConfirmedAppointment,
        error,
        isSubmitting,
        totalPrice,
        totalDuration,
        availableSlots,
        openBooking,
        closeBooking,
        setStep,
        toggleService,
        removeService,
        clearServices,
        setSelectedStaffId,
        setSelectedDate,
        setSelectedSlot,
        setContact,
        submitBooking,
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
