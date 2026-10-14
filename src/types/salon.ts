export type UserRole = 'customer' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export type GenderClassification = 'men' | 'women' | 'unisex';

export type HairLengthVariation = 'short' | 'medium' | 'long' | 'extra_long';

export type ServiceCategory =
  | 'Hair Cutting'
  | 'Hair Wash'
  | 'Blow Dry'
  | 'Smoothening / Straightening'
  | 'Keratin Treatment'
  | 'Classic Facial'
  | 'Premium Facial'
  | 'Clean-Up'
  | 'Bleach & Add-On'
  | 'Hair Colour'
  | 'Manicure'
  | 'Pedicure'
  | 'Hair Spa'
  | 'Waxing'
  | 'Brazilian Waxing'
  | 'Threading'
  | 'Body Spa & Massage';

export interface SalonService {
  id: string;
  name: string;
  category: ServiceCategory;
  gender: GenderClassification;
  description?: string;
  price: number; // in INR (base or exact price)
  minPrice?: number; // for approved price ranges (e.g. ₹3,000)
  maxPrice?: number; // for approved price ranges (e.g. ₹5,000)
  displayPrice?: string; // e.g. "₹3,000–₹5,000" or "₹10,000+"
  hairLength?: HairLengthVariation;
  durationMinutes: number;
  priceConfirmed: boolean; // confirmed by official catalogue
  requiresConfirmation?: boolean; // if true, flagged for confirmation prior to booking
  sourceNote?: string; // notes from catalogue
  isActive: boolean;
  imageUrl?: string;
  createdAt?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  specialties: ServiceCategory[];
  isActive: boolean;
  avatarUrl?: string;
  rating?: number;
  workingDays?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  startTime?: string; // "09:00"
  endTime?: string; // "20:30"
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  bookingReference: string; // e.g. OASIS-2026-8941
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  staffId?: string; // undefined or specific staff id
  staffName?: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalDurationMinutes: number;
  totalPrice: number;
  status: AppointmentStatus;
  services: SalonService[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  paymentStatus?: 'pending' | 'completed' | 'refunded';
  paymentMethod?: 'cash' | 'upi' | 'card' | 'online';
}

export interface SalonBusinessHours {
  id?: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  dayName: string;
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "20:30"
}

export interface SalonHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
}

export interface PaymentRecord {
  id: string;
  appointmentId: string;
  bookingReference: string;
  customerName: string;
  amount: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'online';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  upiTransactionId?: string;
  recordedBy: string;
  recordedAt: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'service' | 'appointment' | 'staff' | 'business_hours' | 'payment';
  entityId: string;
  details: string;
  timestamp: string;
}
