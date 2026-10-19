export interface DemoServiceRecord {
  id: string;
  name: string;
  gender: string;
  category: string;
  priceLabel: string;
  enabled: boolean;
}

export interface DemoStaffRecord {
  id: string;
  name: string;
  title: string;
  specialties: string;
  enabled: boolean;
}

export type DemoAppointmentStatus = 'Scheduled' | 'Checked in' | 'In progress' | 'Completed' | 'Cancelled';

export interface DemoAppointmentRecord {
  id: string;
  customer: string;
  service: string;
  time: string;
  staff: string;
  status: DemoAppointmentStatus;
}

export const DEMO_SERVICES: DemoServiceRecord[] = [
  { id: 'demo-service-1', name: 'Basic Hair Cut', gender: "Women's", category: 'Hair Cutting', priceLabel: '₹250', enabled: true },
  { id: 'demo-service-2', name: 'Hydra Glow Facial', gender: "Women's", category: 'Premium Facial', priceLabel: '₹3,000–₹5,000', enabled: true },
  { id: 'demo-service-3', name: 'Keratin Treatment — Extra Long', gender: "Women's", category: 'Keratin Treatment', priceLabel: '₹10,000+', enabled: true },
  { id: 'demo-service-4', name: 'Smoothening', gender: "Men's", category: 'Smoothening / Straightening', priceLabel: '₹1,000–₹3,000', enabled: true },
  { id: 'demo-service-5', name: 'Keratin Treatment', gender: "Men's", category: 'Keratin Treatment', priceLabel: '₹2,000–₹3,500', enabled: true },
];

export const DEMO_STAFF: DemoStaffRecord[] = [
  { id: 'demo-staff-1', name: 'Demo Team Member A', title: 'Sample Hair Stylist', specialties: 'Illustrative Hair Cutting · Hair Colour', enabled: true },
  { id: 'demo-staff-2', name: 'Demo Team Member B', title: 'Sample Beauty Therapist', specialties: 'Illustrative Facials · Hair Spa', enabled: true },
];

export const DEMO_APPOINTMENTS: DemoAppointmentRecord[] = [
  { id: 'DEMO-001', customer: 'Fictional Customer A', service: 'Basic Hair Cut', time: '10:30 AM', staff: 'Demo Team Member A', status: 'Scheduled' },
  { id: 'DEMO-002', customer: 'Fictional Customer B', service: 'Hydra Glow Facial', time: '12:00 PM', staff: 'Demo Team Member B', status: 'Scheduled' },
  { id: 'DEMO-003', customer: 'Fictional Customer C', service: 'Smoothening', time: '2:30 PM', staff: 'Demo Team Member A', status: 'Scheduled' },
];

export const addDemoService = (records: DemoServiceRecord[], record: DemoServiceRecord): DemoServiceRecord[] =>
  [...records, { ...record }];

export const updateDemoService = (
  records: DemoServiceRecord[],
  id: string,
  updates: Pick<DemoServiceRecord, 'name' | 'gender' | 'category'>,
): DemoServiceRecord[] => records.map((record) => record.id === id ? { ...record, ...updates } : record);

export const setDemoServiceEnabled = (records: DemoServiceRecord[], id: string, enabled: boolean): DemoServiceRecord[] =>
  records.map((record) => record.id === id ? { ...record, enabled } : record);

export const addDemoStaff = (records: DemoStaffRecord[], record: DemoStaffRecord): DemoStaffRecord[] =>
  [...records, { ...record }];

export const updateDemoStaff = (
  records: DemoStaffRecord[],
  id: string,
  updates: Pick<DemoStaffRecord, 'name' | 'title' | 'specialties'>,
): DemoStaffRecord[] => records.map((record) => record.id === id ? { ...record, ...updates } : record);

export const setDemoStaffEnabled = (records: DemoStaffRecord[], id: string, enabled: boolean): DemoStaffRecord[] =>
  records.map((record) => record.id === id ? { ...record, enabled } : record);

export const updateDemoAppointmentStatus = (
  records: DemoAppointmentRecord[],
  id: string,
  status: DemoAppointmentStatus,
): DemoAppointmentRecord[] => records.map((record) => record.id === id ? { ...record, status } : record);

export interface DemoBookingPreview {
  serviceName: string;
  date: string;
  time: string;
  result: 'DEMO ONLY — Appointment not booked';
  detail: 'This is a simulated preview. No live availability was checked and no salon appointment was created.';
}

export const createDemoBookingPreview = (serviceName: string, date: string, time: string): DemoBookingPreview => ({
  serviceName,
  date,
  time,
  result: 'DEMO ONLY — Appointment not booked',
  detail: 'This is a simulated preview. No live availability was checked and no salon appointment was created.',
});
