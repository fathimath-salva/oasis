import type {
  SalonService,
  StaffMember,
  SalonBusinessHours,
  SalonHoliday,
  Appointment,
  AppointmentStatus,
  PaymentRecord,
  AuditLog,
  UserRole,
} from '../types/salon';
import {
  INITIAL_SERVICES,
  INITIAL_STAFF,
  INITIAL_BUSINESS_HOURS,
  INITIAL_HOLIDAYS,
} from '../constants/salonData';
import { addMinutesToTime } from './formatters';

const STORAGE_KEYS = {
  SERVICES: 'the_oasis_services_v1',
  STAFF: 'the_oasis_staff_v1',
  BUSINESS_HOURS: 'the_oasis_hours_v1',
  HOLIDAYS: 'the_oasis_holidays_v1',
  APPOINTMENTS: 'the_oasis_appointments_v1',
  PAYMENTS: 'the_oasis_payments_v1',
  AUDIT_LOGS: 'the_oasis_audit_logs_v1',
};

// Helper for local persistence
function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

// Generate sample initial appointments for realistic dashboard testing
function getInitialAppointments(): Appointment[] {
  const today = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  return [
    {
      id: 'apt-seed-1',
      bookingReference: 'OASIS-2026-8021',
      customerId: 'cust-demo-1',
      customerName: 'Kavya Rai',
      customerPhone: '9845112233',
      customerEmail: 'kavya.rai@example.com',
      staffId: 'stf-2',
      staffName: 'Ananya Rao',
      appointmentDate: today,
      startTime: '10:30',
      endTime: '11:45',
      totalDurationMinutes: 75,
      totalPrice: 2800,
      status: 'confirmed',
      services: [INITIAL_SERVICES[12]], // O3+ Bridal Whitening Facial
      notes: 'Please ensure gentle exfoliation, client has sensitive skin.',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      paymentStatus: 'pending',
    },
    {
      id: 'apt-seed-2',
      bookingReference: 'OASIS-2026-8022',
      customerId: 'cust-demo-2',
      customerName: 'Naveen Kumar',
      customerPhone: '9740223344',
      customerEmail: 'naveen.k@example.com',
      staffId: 'stf-1',
      staffName: 'Ramesh Shetty',
      appointmentDate: today,
      startTime: '11:30',
      endTime: '12:15',
      totalDurationMinutes: 45,
      totalPrice: 350,
      status: 'checked_in',
      services: [INITIAL_SERVICES[0]], // Men's Signature Haircut & Beard Trim
      notes: 'Prefers classic fade and sharp beard line.',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      paymentStatus: 'completed',
      paymentMethod: 'upi',
    },
    {
      id: 'apt-seed-3',
      bookingReference: 'OASIS-2026-8023',
      customerId: 'cust-demo-3',
      customerName: 'Shruthi Bhat',
      customerPhone: '9448334455',
      customerEmail: 'shruthi.bhat@example.com',
      staffId: 'stf-4',
      staffName: 'Preethi D’Souza',
      appointmentDate: today,
      startTime: '14:00',
      endTime: '15:10',
      totalDurationMinutes: 70,
      totalPrice: 1750,
      status: 'pending',
      services: [INITIAL_SERVICES[10], INITIAL_SERVICES[17]], // Argan Oil Spa + Eyebrow threading
      notes: 'Visiting Puttur for family festival.',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      paymentStatus: 'pending',
    },
    {
      id: 'apt-seed-4',
      bookingReference: 'OASIS-2026-8024',
      customerId: 'cust-demo-4',
      customerName: 'Deepak Hegde',
      customerPhone: '9980445566',
      customerEmail: 'deepak.h@example.com',
      staffId: 'stf-4',
      staffName: 'Preethi D’Souza',
      appointmentDate: tomorrow,
      startTime: '16:00',
      endTime: '17:00',
      totalDurationMinutes: 60,
      totalPrice: 2400,
      status: 'confirmed',
      services: [INITIAL_SERVICES[20]], // Swedish Relaxation Massage
      notes: 'Relaxation session.',
      createdAt: new Date().toISOString(),
      paymentStatus: 'pending',
    },
  ];
}

function getInitialPayments(): PaymentRecord[] {
  return [
    {
      id: 'pay-seed-1',
      appointmentId: 'apt-seed-2',
      bookingReference: 'OASIS-2026-8022',
      customerName: 'Naveen Kumar',
      amount: 350,
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      upiTransactionId: 'UPI-AXIS-915155-8932',
      recordedBy: 'Admin / Reception',
      recordedAt: new Date().toISOString(),
      notes: 'Paid via GPay to salon QR',
    },
  ];
}

function getInitialAuditLogs(): AuditLog[] {
  return [
    {
      id: 'log-seed-1',
      userId: 'usr-admin-1',
      userName: 'Salon Director',
      userRole: 'admin',
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'business_hours',
      entityId: 'system',
      details: 'Initialized salon master catalogue and business schedule for Puttur branch.',
      timestamp: new Date().toISOString(),
    },
  ];
}

// ----------------------------------------------------------------------------
// DB SERVICE API
// ----------------------------------------------------------------------------

export const db = {
  // Services
  getServices(): SalonService[] {
    return getStorage<SalonService[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  },

  getServiceById(id: string): SalonService | undefined {
    return this.getServices().find((s) => s.id === id);
  },

  createService(service: Omit<SalonService, 'id' | 'createdAt'>): SalonService {
    const services = this.getServices();
    const newService: SalonService = {
      ...service,
      id: `srv-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    services.push(newService);
    setStorage(STORAGE_KEYS.SERVICES, services);
    this.addAuditLog('admin', 'Admin User', 'admin', 'CREATE_SERVICE', 'service', newService.id, `Created service: ${newService.name}`);
    return newService;
  },

  updateService(id: string, updates: Partial<SalonService>): SalonService | null {
    const services = this.getServices();
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) return null;

    services[index] = { ...services[index], ...updates };
    setStorage(STORAGE_KEYS.SERVICES, services);
    this.addAuditLog('admin', 'Admin User', 'admin', 'UPDATE_SERVICE', 'service', id, `Updated service: ${services[index].name}`);
    return services[index];
  },

  deleteService(id: string): boolean {
    const services = this.getServices();
    const filtered = services.filter((s) => s.id !== id);
    if (filtered.length === services.length) return false;
    setStorage(STORAGE_KEYS.SERVICES, filtered);
    this.addAuditLog('admin', 'Admin User', 'admin', 'DELETE_SERVICE', 'service', id, `Deleted service ID: ${id}`);
    return true;
  },

  // Staff
  getStaff(): StaffMember[] {
    return getStorage<StaffMember[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  },

  getStaffById(id: string): StaffMember | undefined {
    return this.getStaff().find((s) => s.id === id);
  },

  createStaff(staffData: Omit<StaffMember, 'id'>): StaffMember {
    const staffList = this.getStaff();
    const newStaff: StaffMember = {
      ...staffData,
      id: `stf-${Date.now()}`,
    };
    staffList.push(newStaff);
    setStorage(STORAGE_KEYS.STAFF, staffList);
    this.addAuditLog('admin', 'Admin User', 'admin', 'CREATE_STAFF', 'staff', newStaff.id, `Added staff: ${newStaff.name}`);
    return newStaff;
  },

  updateStaff(id: string, updates: Partial<StaffMember>): StaffMember | null {
    const staffList = this.getStaff();
    const index = staffList.findIndex((s) => s.id === id);
    if (index === -1) return null;

    staffList[index] = { ...staffList[index], ...updates };
    setStorage(STORAGE_KEYS.STAFF, staffList);
    this.addAuditLog('admin', 'Admin User', 'admin', 'UPDATE_STAFF', 'staff', id, `Updated staff: ${staffList[index].name}`);
    return staffList[index];
  },

  deleteStaff(id: string): boolean {
    const staffList = this.getStaff();
    const filtered = staffList.filter((s) => s.id !== id);
    if (filtered.length === staffList.length) return false;
    setStorage(STORAGE_KEYS.STAFF, filtered);
    this.addAuditLog('admin', 'Admin User', 'admin', 'DELETE_STAFF', 'staff', id, `Deleted staff ID: ${id}`);
    return true;
  },

  // Business Hours & Holidays
  getBusinessHours(): SalonBusinessHours[] {
    return getStorage<SalonBusinessHours[]>(STORAGE_KEYS.BUSINESS_HOURS, INITIAL_BUSINESS_HOURS);
  },

  updateBusinessHours(hours: SalonBusinessHours[]): void {
    setStorage(STORAGE_KEYS.BUSINESS_HOURS, hours);
    this.addAuditLog('admin', 'Admin User', 'admin', 'UPDATE_HOURS', 'business_hours', 'all', 'Updated salon business hours');
  },

  getHolidays(): SalonHoliday[] {
    return getStorage<SalonHoliday[]>(STORAGE_KEYS.HOLIDAYS, INITIAL_HOLIDAYS);
  },

  addHoliday(holiday: Omit<SalonHoliday, 'id'>): SalonHoliday {
    const holidays = this.getHolidays();
    const newHol: SalonHoliday = {
      ...holiday,
      id: `hol-${Date.now()}`,
    };
    holidays.push(newHol);
    setStorage(STORAGE_KEYS.HOLIDAYS, holidays);
    this.addAuditLog('admin', 'Admin User', 'admin', 'ADD_HOLIDAY', 'business_hours', newHol.id, `Added salon closure: ${newHol.title} on ${newHol.date}`);
    return newHol;
  },

  deleteHoliday(id: string): boolean {
    const holidays = this.getHolidays();
    const filtered = holidays.filter((h) => h.id !== id);
    if (filtered.length === holidays.length) return false;
    setStorage(STORAGE_KEYS.HOLIDAYS, filtered);
    return true;
  },

  // Appointments
  getAppointments(): Appointment[] {
    return getStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, getInitialAppointments());
  },

  getAppointmentsByCustomer(phoneOrEmailOrId: string): Appointment[] {
    const appointments = this.getAppointments();
    const query = phoneOrEmailOrId.trim().toLowerCase();
    return appointments.filter(
      (a) =>
        a.customerId === query ||
        a.customerPhone.toLowerCase().includes(query) ||
        a.customerEmail.toLowerCase().includes(query)
    );
  },

  getAppointmentsByStaff(staffId: string): Appointment[] {
    return this.getAppointments().filter((a) => a.staffId === staffId);
  },

  // Availability & Double-Booking Prevention Engine
  checkSlotConflict(
    date: string,
    startTime: string,
    durationMinutes: number,
    staffId?: string,
    excludeAppointmentId?: string
  ): { hasConflict: boolean; reason?: string } {
    const hours = this.getBusinessHours();
    const holidays = this.getHolidays();

    // 1. Check if date is in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      return { hasConflict: true, reason: 'Selected date has already passed.' };
    }

    // 2. Check salon holidays
    const isHoliday = holidays.find((h) => h.date === date);
    if (isHoliday) {
      return {
        hasConflict: true,
        reason: `The salon is closed on this date for: ${isHoliday.title}`,
      };
    }

    // 3. Check day opening hours
    const dayOfWeek = new Date(date + 'T00:00:00').getDay();
    const daySchedule = hours.find((h) => h.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.isOpen) {
      return { hasConflict: true, reason: 'The salon is closed on this day of the week.' };
    }

    const calculatedEndTime = addMinutesToTime(startTime, durationMinutes);
    if (startTime < daySchedule.openTime || calculatedEndTime > daySchedule.closeTime) {
      return {
        hasConflict: true,
        reason: `Appointment must be between opening (${daySchedule.openTime}) and closing (${daySchedule.closeTime}).`,
      };
    }

    // 4. Staff schedule check if specific staff member selected
    if (staffId) {
      const staffMember = this.getStaffById(staffId);
      if (staffMember) {
        if (staffMember.workingDays && !staffMember.workingDays.includes(dayOfWeek)) {
          return {
            hasConflict: true,
            reason: `${staffMember.name} is scheduled off on ${daySchedule.dayName}s.`,
          };
        }
        if (
          (staffMember.startTime && startTime < staffMember.startTime) ||
          (staffMember.endTime && calculatedEndTime > staffMember.endTime)
        ) {
          return {
            hasConflict: true,
            reason: `${staffMember.name} is available only from ${staffMember.startTime} to ${staffMember.endTime}.`,
          };
        }
      }
    }

    // 5. Existing active appointments overlap check (Prevents double booking!)
    const appointments = this.getAppointments().filter(
      (a) =>
        a.appointmentDate === date &&
        a.id !== excludeAppointmentId &&
        a.status !== 'cancelled' &&
        a.status !== 'no_show'
    );

    // If staff member specified, check if that staff member is booked
    if (staffId) {
      const staffOverlap = appointments.find(
        (a) =>
          a.staffId === staffId &&
          !(calculatedEndTime <= a.startTime || startTime >= a.endTime)
      );
      if (staffOverlap) {
        return {
          hasConflict: true,
          reason: `Selected staff is already booked from ${staffOverlap.startTime} to ${staffOverlap.endTime}.`,
        };
      }
    } else {
      // If "Any Available Staff", check if all active staff are simultaneously booked at this time
      const activeStaff = this.getStaff().filter((s) => s.isActive);
      const overlappingBookingsCount = appointments.filter(
        (a) => !(calculatedEndTime <= a.startTime || startTime >= a.endTime)
      ).length;

      if (overlappingBookingsCount >= activeStaff.length) {
        return {
          hasConflict: true,
          reason: 'All salon stations and stylists are fully occupied at this time.',
        };
      }
    }

    return { hasConflict: false };
  },

  getAvailableSlots(date: string, durationMinutes: number, staffId?: string): string[] {
    const hours = this.getBusinessHours();
    const holidays = this.getHolidays();

    const isHoliday = holidays.some((h) => h.date === date);
    if (isHoliday) return [];

    const dayOfWeek = new Date(date + 'T00:00:00').getDay();
    const daySchedule = hours.find((h) => h.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.isOpen) return [];

    // Generate intervals in 30-minute steps
    const [openH, openM] = daySchedule.openTime.split(':').map(Number);
    const [closeH, closeM] = daySchedule.closeTime.split(':').map(Number);
    const openTotalMins = openH * 60 + openM;
    const closeTotalMins = closeH * 60 + closeM;

    const availableSlots: string[] = [];

    // If booking for today, filter out past time
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = date === todayStr;
    const currentMinsNow = now.getHours() * 60 + now.getMinutes() + 15; // 15 min buffer

    for (let m = openTotalMins; m + durationMinutes <= closeTotalMins; m += 30) {
      if (isToday && m < currentMinsNow) {
        continue;
      }
      const slotH = Math.floor(m / 60);
      const slotM = m % 60;
      const slotTimeStr = `${slotH.toString().padStart(2, '0')}:${slotM.toString().padStart(2, '0')}`;

      const conflict = this.checkSlotConflict(date, slotTimeStr, durationMinutes, staffId);
      if (!conflict.hasConflict) {
        availableSlots.push(slotTimeStr);
      }
    }

    return availableSlots;
  },

  createAppointment(
    data: Omit<Appointment, 'id' | 'bookingReference' | 'endTime' | 'createdAt'>
  ): { success: boolean; appointment?: Appointment; error?: string } {
    // 1. Calculate end time
    const endTime = addMinutesToTime(data.startTime, data.totalDurationMinutes);

    // 2. Strict server/db side validation
    const validation = this.checkSlotConflict(
      data.appointmentDate,
      data.startTime,
      data.totalDurationMinutes,
      data.staffId
    );

    if (validation.hasConflict) {
      return { success: false, error: validation.reason || 'Slot is no longer available.' };
    }

    // 3. Assign staff if "any" was selected
    let assignedStaffId = data.staffId;
    let assignedStaffName = data.staffName;

    if (!assignedStaffId) {
      // Find the first available staff for this time window
      const activeStaff = this.getStaff().filter((s) => s.isActive);
      const existingApts = this.getAppointments().filter(
        (a) =>
          a.appointmentDate === data.appointmentDate &&
          a.status !== 'cancelled' &&
          a.status !== 'no_show' &&
          !(endTime <= a.startTime || data.startTime >= a.endTime)
      );
      const bookedStaffIds = new Set(existingApts.map((a) => a.staffId).filter(Boolean));
      const freeStaff = activeStaff.find((s) => !bookedStaffIds.has(s.id));

      if (freeStaff) {
        assignedStaffId = freeStaff.id;
        assignedStaffName = freeStaff.name;
      } else {
        assignedStaffName = 'Oasis Senior Specialist';
      }
    }

    // 4. Generate unique Indian salon booking reference
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `OASIS-2026-${randomSuffix}`;

    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      bookingReference,
      staffId: assignedStaffId,
      staffName: assignedStaffName,
      endTime,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      paymentStatus: 'pending',
    };

    const appointments = this.getAppointments();
    appointments.unshift(newAppointment);
    setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

    this.addAuditLog(
      data.customerId || 'guest',
      data.customerName,
      'customer',
      'BOOK_APPOINTMENT',
      'appointment',
      newAppointment.id,
      `Booked ref ${bookingReference} on ${data.appointmentDate} at ${data.startTime}`
    );

    return { success: true, appointment: newAppointment };
  },

  updateAppointmentStatus(id: string, status: AppointmentStatus, updatedBy = 'Staff'): Appointment | null {
    const appointments = this.getAppointments();
    const index = appointments.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const oldStatus = appointments[index].status;
    appointments[index].status = status;
    appointments[index].updatedAt = new Date().toISOString();
    setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

    this.addAuditLog(
      'user',
      updatedBy,
      'staff',
      'UPDATE_STATUS',
      'appointment',
      id,
      `Status changed from ${oldStatus} to ${status}`
    );

    return appointments[index];
  },

  rescheduleAppointment(
    id: string,
    newDate: string,
    newStartTime: string
  ): { success: boolean; appointment?: Appointment; error?: string } {
    const appointments = this.getAppointments();
    const index = appointments.findIndex((a) => a.id === id);
    if (index === -1) {
      return { success: false, error: 'Appointment not found.' };
    }

    const apt = appointments[index];
    const validation = this.checkSlotConflict(
      newDate,
      newStartTime,
      apt.totalDurationMinutes,
      apt.staffId,
      id
    );

    if (validation.hasConflict) {
      return { success: false, error: validation.reason || 'New slot is not available.' };
    }

    apt.appointmentDate = newDate;
    apt.startTime = newStartTime;
    apt.endTime = addMinutesToTime(newStartTime, apt.totalDurationMinutes);
    apt.status = 'confirmed';
    apt.updatedAt = new Date().toISOString();

    setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

    this.addAuditLog(
      apt.customerId,
      apt.customerName,
      'customer',
      'RESCHEDULE_APPOINTMENT',
      'appointment',
      id,
      `Rescheduled to ${newDate} at ${newStartTime}`
    );

    return { success: true, appointment: apt };
  },

  cancelAppointment(id: string, reason?: string): { success: boolean; error?: string } {
    const appointments = this.getAppointments();
    const index = appointments.findIndex((a) => a.id === id);
    if (index === -1) {
      return { success: false, error: 'Appointment not found.' };
    }

    appointments[index].status = 'cancelled';
    appointments[index].notes = appointments[index].notes
      ? `${appointments[index].notes} [Cancelled: ${reason || 'Customer request'}]`
      : `[Cancelled: ${reason || 'Customer request'}]`;
    appointments[index].updatedAt = new Date().toISOString();

    setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

    this.addAuditLog(
      appointments[index].customerId,
      appointments[index].customerName,
      'customer',
      'CANCEL_APPOINTMENT',
      'appointment',
      id,
      `Cancelled: ${reason || 'No reason provided'}`
    );

    return { success: true };
  },

  // Payments
  getPayments(): PaymentRecord[] {
    return getStorage<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, getInitialPayments());
  },

  recordPayment(data: Omit<PaymentRecord, 'id' | 'recordedAt'>): PaymentRecord {
    const payments = this.getPayments();
    const newPayment: PaymentRecord = {
      ...data,
      id: `pay-${Date.now()}`,
      recordedAt: new Date().toISOString(),
    };
    payments.unshift(newPayment);
    setStorage(STORAGE_KEYS.PAYMENTS, payments);

    // Update appointment payment status
    const appointments = this.getAppointments();
    const aptIndex = appointments.findIndex((a) => a.id === data.appointmentId);
    if (aptIndex !== -1) {
      appointments[aptIndex].paymentStatus = 'completed';
      appointments[aptIndex].paymentMethod = data.paymentMethod;
      setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
    }

    this.addAuditLog(
      'staff',
      data.recordedBy,
      'staff',
      'RECORD_PAYMENT',
      'payment',
      newPayment.id,
      `Recorded ₹${data.amount} via ${data.paymentMethod.toUpperCase()} for ${data.bookingReference}`
    );

    return newPayment;
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, getInitialAuditLogs());
  },

  addAuditLog(
    userId: string,
    userName: string,
    userRole: UserRole,
    action: string,
    entityType: 'service' | 'appointment' | 'staff' | 'business_hours' | 'payment',
    entityId: string,
    details: string
  ): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      userId,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    });
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    setStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
  },
};
