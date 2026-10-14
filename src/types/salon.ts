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

export type ServiceCategory =
  | 'Haircutting and hairstyling'
  | 'Hair wash and blow-dry'
  | 'Hair colouring and highlights'
  | 'Smoothening and straightening'
  | 'Keratin treatments'
  | 'Hair spa and head massage'
  | 'Classic and premium facials'
  | 'Clean-up and skin treatments'
  | 'Waxing and threading'
  | 'Manicure and pedicure'
  | 'Body spa and massage';

export interface SalonService {
  id: string;
  name: string;
  category: ServiceCategory;
  gender: GenderClassification;
  description: string;
  price: number; // in INR
  priceConfirmed: boolean; // if false, flagged for admin review
  durationMinutes: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
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
