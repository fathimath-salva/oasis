import { getSupabaseClient } from './supabase';
import type { Database, Json } from './database.types';

type Rows = Database['public']['Tables'];
type ProfileRow = Pick<Rows['profiles']['Row'], 'id' | 'full_name' | 'email' | 'phone' | 'role' | 'created_at' | 'updated_at'>;
type ServiceRow = Rows['services']['Row'];
type StaffRow = Pick<Rows['staff']['Row'], 'id' | 'name' | 'title' | 'specialties' | 'is_active' | 'rating' | 'avatar_url' | 'working_days' | 'start_time' | 'end_time'>;
type HoursRow = Rows['salon_business_hours']['Row'];
type HolidayRow = Rows['salon_holidays']['Row'];
type AppointmentRow = Rows['appointments']['Row'];
type AppointmentServiceRow = Rows['appointment_services']['Row'];

export type CataloguePriceType = 'fixed' | 'range' | 'starting_at';
export type CatalogueHairLength = 'short' | 'medium' | 'long' | 'extra_long';

export class RepositoryError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
  }
}

const throwOnError = (error: { message: string; code?: string } | null): void => {
  if (error) throw new RepositoryError(error.message, error.code);
};

const mapPriceType = (value: string): CataloguePriceType => {
  if (value === 'fixed' || value === 'range' || value === 'starting_at') return value;
  throw new RepositoryError(`Unsupported catalogue price type returned by database: ${value}`);
};

const mapHairLength = (value: string | null): CatalogueHairLength | null => {
  if (value === null) return null;
  if (value === 'short' || value === 'medium' || value === 'long' || value === 'extra_long') return value;
  throw new RepositoryError(`Unsupported hair length returned by database: ${value}`);
};

export interface ServiceRecord {
  id: string;
  sourceKey: string | null;
  name: string;
  category: string;
  gender: Database['public']['Enums']['gender_classification'];
  description: string;
  price: number;
  priceType: CataloguePriceType;
  minPrice: number | null;
  maxPrice: number | null;
  hairLength: CatalogueHairLength | null;
  priceConfirmed: boolean;
  requiresConfirmation: boolean;
  durationMinutes: number;
  isActive: boolean;
  imageUrl: string | null;
  sourceNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicStaffRecord {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  isActive: boolean;
  rating: number;
  avatarUrl: string | null;
  workingDays: number[];
  startTime: string;
  endTime: string;
}

export interface AdminStaffContactRecord {
  staffId: string;
  phone: string;
  email: string;
}

export interface BusinessHoursRecord {
  id: number;
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface HolidayRecord {
  id: string;
  date: string;
  title: string;
  description: string | null;
}

export interface AppointmentServiceSnapshot {
  serviceId: string;
  name: string;
  price: number;
  durationMinutes: number;
  hairLength: CatalogueHairLength | null;
}

export interface AppointmentRecord {
  id: string;
  bookingReference: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  staffId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  totalDurationMinutes: number;
  totalPrice: number;
  status: Database['public']['Enums']['appointment_status'];
  notes: string | null;
  paymentStatus: Database['public']['Enums']['payment_status'];
  paymentMethod: Database['public']['Enums']['payment_method'] | null;
  createdAt: string;
  updatedAt: string;
  services: AppointmentServiceSnapshot[];
}

export interface ProfileRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Database['public']['Enums']['user_role'];
  createdAt: string;
  updatedAt: string;
}

const mapProfile = (row: ProfileRow): ProfileRecord => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  role: row.role,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapService = (row: ServiceRow): ServiceRecord => ({
  id: row.id,
  sourceKey: row.source_key,
  name: row.name,
  category: row.category,
  gender: row.gender,
  description: row.description,
  price: row.price,
  priceType: mapPriceType(row.price_type),
  minPrice: row.price_min,
  maxPrice: row.price_max,
  hairLength: mapHairLength(row.hair_length),
  priceConfirmed: row.price_confirmed,
  requiresConfirmation: row.requires_confirmation,
  durationMinutes: row.duration_minutes,
  isActive: row.is_active,
  imageUrl: row.image_url,
  sourceNote: row.source_note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapStaff = (row: StaffRow): PublicStaffRecord => ({
  id: row.id,
  name: row.name,
  title: row.title,
  specialties: [...row.specialties],
  isActive: row.is_active,
  rating: row.rating,
  avatarUrl: row.avatar_url,
  workingDays: [...row.working_days],
  startTime: row.start_time,
  endTime: row.end_time,
});

const mapHours = (row: HoursRow): BusinessHoursRecord => ({
  id: row.id,
  dayOfWeek: row.day_of_week,
  dayName: row.day_name,
  isOpen: row.is_open,
  openTime: row.open_time,
  closeTime: row.close_time,
});

const mapHoliday = (row: HolidayRow): HolidayRecord => ({
  id: row.id,
  date: row.holiday_date,
  title: row.title,
  description: row.description,
});

const mapAppointment = (row: AppointmentRow, lines: AppointmentServiceRow[]): AppointmentRecord => ({
  id: row.id,
  bookingReference: row.booking_reference,
  customerId: row.customer_id,
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  customerEmail: row.customer_email,
  staffId: row.staff_id,
  appointmentDate: row.appointment_date,
  startTime: row.start_time,
  endTime: row.end_time,
  totalDurationMinutes: row.total_duration_minutes,
  totalPrice: row.total_price,
  status: row.status,
  notes: row.notes,
  paymentStatus: row.payment_status,
  paymentMethod: row.payment_method,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  services: lines.map((line) => ({
    serviceId: line.service_id,
    name: line.service_name,
    price: line.service_price,
    durationMinutes: line.duration_minutes,
    hairLength: mapHairLength(line.hair_length),
  })),
});

export const salonRepository = {
  async getProfile(userId: string): Promise<ProfileRecord | null> {
    const { data, error } = await getSupabaseClient()
      .from('profiles')
      .select('id, full_name, email, phone, role, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();
    throwOnError(error);
    return data ? mapProfile(data) : null;
  },

  async updateOwnProfile(userId: string, updates: { fullName?: string; phone?: string }): Promise<ProfileRecord> {
    const fields: Rows['profiles']['Update'] = {};
    if (updates.fullName !== undefined) fields.full_name = updates.fullName.trim();
    if (updates.phone !== undefined) fields.phone = updates.phone.trim();
    const { data, error } = await getSupabaseClient()
      .from('profiles')
      .update(fields)
      .eq('id', userId)
      .select('id, full_name, email, phone, role, created_at, updated_at')
      .single();
    throwOnError(error);
    if (!data) throw new RepositoryError('Profile update returned no row.');
    return mapProfile(data);
  },

  async getServices(options: { includeInactive?: boolean } = {}): Promise<ServiceRecord[]> {
    let query = getSupabaseClient().from('services').select('*').order('category').order('name');
    if (!options.includeInactive) query = query.eq('is_active', true);
    const { data, error } = await query;
    throwOnError(error);
    return (data ?? []).map(mapService);
  },

  async getPublicStaff(): Promise<PublicStaffRecord[]> {
    const { data, error } = await getSupabaseClient()
      .from('staff')
      .select('id, name, title, specialties, is_active, rating, avatar_url, working_days, start_time, end_time')
      .eq('is_active', true)
      .order('name');
    throwOnError(error);
    return (data ?? []).map(mapStaff);
  },

  // The staff_private RLS policy is the authorization boundary: only admins
  // can receive rows. Do not add this query to public staff-directory code.
  async getAdminStaffContacts(): Promise<AdminStaffContactRecord[]> {
    const { data, error } = await getSupabaseClient()
      .from('staff_private')
      .select('staff_id, phone, email')
      .order('staff_id');
    throwOnError(error);
    return (data ?? []).map((row) => ({
      staffId: row.staff_id,
      phone: row.phone,
      email: row.email,
    }));
  },

  async getBusinessHours(): Promise<BusinessHoursRecord[]> {
    const { data, error } = await getSupabaseClient()
      .from('salon_business_hours').select('*').order('day_of_week');
    throwOnError(error);
    return (data ?? []).map(mapHours);
  },

  async getHolidays(): Promise<HolidayRecord[]> {
    const { data, error } = await getSupabaseClient()
      .from('salon_holidays').select('*').order('holiday_date');
    throwOnError(error);
    return (data ?? []).map(mapHoliday);
  },

  // RLS returns only appointments visible to this authenticated user (customer,
  // assigned staff, or admin). No client-side role claim is used as authority.
  async getVisibleAppointments(): Promise<AppointmentRecord[]> {
    const client = getSupabaseClient();
    const { data: appointments, error } = await client
      .from('appointments').select('*').order('appointment_date', { ascending: false }).order('start_time');
    throwOnError(error);
    const appointmentRows = appointments ?? [];
    if (appointmentRows.length === 0) return [];
    const ids = appointmentRows.map((appointment) => appointment.id);
    const { data: lines, error: linesError } = await client
      .from('appointment_services').select('*').in('appointment_id', ids);
    throwOnError(linesError);
    const linesByAppointment = new Map<string, AppointmentServiceRow[]>();
    for (const line of lines ?? []) {
      const current = linesByAppointment.get(line.appointment_id) ?? [];
      current.push(line);
      linesByAppointment.set(line.appointment_id, current);
    }
    return appointmentRows.map((appointment) => mapAppointment(appointment, linesByAppointment.get(appointment.id) ?? []));
  },
};

// Keep this alias exported so callers can type audit JSON without weakening the
// schema row types or treating arbitrary database rows as frontend models.
export type AuditDetails = Json;
