import React, { useRef, useState } from 'react';
import {
  addDemoService, addDemoStaff, createDemoBookingPreview,
  DEMO_APPOINTMENTS, DEMO_SERVICES, DEMO_STAFF,
  setDemoServiceEnabled, setDemoStaffEnabled,
  updateDemoAppointmentStatus, updateDemoService, updateDemoStaff,
  type DemoAppointmentStatus, type DemoServiceRecord, type DemoStaffRecord,
} from '../lib/demoState';

type AdminTab = 'overview' | 'services' | 'staff' | 'appointments' | 'booking';

const DemoModeBanner = () => (
  <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold tracking-wide text-amber-950" role="status">
    DEMO MODE — Sample Data
    <p className="mt-1 text-xs font-normal tracking-normal">All records are DEMO DATA. Names, profiles, statistics, and schedules are fictional examples stored only in this page session.</p>
  </div>
);

const SectionHeading: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="mb-4"><h2 className="font-serif text-xl font-bold text-[#26352A]">{title}</h2><p className="mt-1 text-xs text-[#69705A]">{description}</p></div>
);

const DemoTag = () => <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-950">DEMO DATA</span>;

const SampleTable: React.FC<{ headers: string[]; rows: string[][] }> = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-xl border border-[#A8B7A0]/50 bg-white"><table className="w-full min-w-[640px] border-collapse text-left text-xs">
    <thead className="bg-[#EEE7DA] text-[#343923]"><tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr></thead>
    <tbody className="divide-y divide-[#53583A]/10">{rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`} className="px-4 py-3 text-[#343923]">{cell}</td>)}</tr>)}</tbody>
  </table></div>
);

export const DemoBookingSimulator: React.FC = () => {
  const [serviceId, setServiceId] = useState(DEMO_SERVICES[0]?.id ?? '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:30 AM');
  const [preview, setPreview] = useState<ReturnType<typeof createDemoBookingPreview> | null>(null);
  const selectedService = DEMO_SERVICES.find((service) => service.id === serviceId);
  const runPreview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedService && date && time) setPreview(createDemoBookingPreview(selectedService.name, date, time));
  };

  return <section className="rounded-2xl border border-[#A8B7A0]/40 bg-white p-5 shadow-sm sm:p-6">
    <SectionHeading title="Demo booking simulator" description="Choose a sample service and date to preview the flow. Listed times are examples, not live availability." />
    <form onSubmit={runPreview} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-xs font-semibold text-[#343923]">DEMO DATA · Service<select value={serviceId} onChange={(event) => { setServiceId(event.target.value); setPreview(null); }} className="mt-1.5 w-full rounded-xl border border-[#53583A]/25 bg-white p-2.5 font-normal">{DEMO_SERVICES.map((service) => <option key={service.id} value={service.id}>{service.gender} · {service.name} — {service.priceLabel}</option>)}</select></label>
      <label className="text-xs font-semibold text-[#343923]">DEMO ONLY · Date<input required type="date" value={date} onChange={(event) => { setDate(event.target.value); setPreview(null); }} className="mt-1.5 w-full rounded-xl border border-[#53583A]/25 p-2.5 font-normal" /></label>
      <label className="text-xs font-semibold text-[#343923]">Example time · not a real slot<select value={time} onChange={(event) => { setTime(event.target.value); setPreview(null); }} className="mt-1.5 w-full rounded-xl border border-[#53583A]/25 bg-white p-2.5 font-normal"><option>10:30 AM</option><option>12:00 PM</option><option>2:30 PM</option></select></label>
      <div className="flex items-end"><button type="submit" disabled={!selectedService || !date} className="w-full rounded-xl bg-[#343923] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#19231C] disabled:cursor-not-allowed disabled:opacity-50">Preview Demo Booking</button></div>
    </form>
    <p className="mt-3 text-[11px] leading-5 text-[#69705A]">The simulator does not query availability, reserve a time, create an appointment, send a notification, or process a payment.</p>
    {preview && <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4" role="status"><p className="font-bold text-amber-950">{preview.result}</p><p className="mt-1 text-xs text-amber-900">{preview.serviceName} · {preview.date} · {preview.time}</p><p className="mt-2 text-xs leading-5 text-amber-900">{preview.detail}</p></div>}
  </section>;
};

export const DemoAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [services, setServices] = useState<DemoServiceRecord[]>(() => DEMO_SERVICES.map((record) => ({ ...record })));
  const [staff, setStaff] = useState<DemoStaffRecord[]>(() => DEMO_STAFF.map((record) => ({ ...record })));
  const [appointments] = useState(() => DEMO_APPOINTMENTS.map((record) => ({ ...record })));
  const idCounter = useRef(0);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceGender, setServiceGender] = useState("Women's");
  const [serviceCategory, setServiceCategory] = useState('');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffTitle, setStaffTitle] = useState('');
  const [staffSpecialties, setStaffSpecialties] = useState('');
  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'overview', label: 'Overview' }, { id: 'services', label: 'Service Management' },
    { id: 'staff', label: 'Staff Management' }, { id: 'appointments', label: 'Appointment Management' }, { id: 'booking', label: 'Booking Simulator' },
  ];
  const clearServiceForm = () => { setEditingServiceId(null); setServiceName(''); setServiceGender("Women's"); setServiceCategory(''); };
  const saveService = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = serviceName.trim(); const category = serviceCategory.trim();
    if (!name || !category) return;
    if (editingServiceId) setServices((current) => updateDemoService(current, editingServiceId, { name, gender: serviceGender, category }));
    else setServices((current) => addDemoService(current, { id: `demo-service-sample-${++idCounter.current}`, name, gender: serviceGender, category, priceLabel: 'Demo only — no catalogue price', enabled: true }));
    clearServiceForm();
  };
  const clearStaffForm = () => { setEditingStaffId(null); setStaffName(''); setStaffTitle(''); setStaffSpecialties(''); };
  const saveStaff = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = staffName.trim(); const title = staffTitle.trim(); const specialties = staffSpecialties.trim();
    if (!name || !title || !specialties) return;
    if (editingStaffId) setStaff((current) => updateDemoStaff(current, editingStaffId, { name, title, specialties: `Illustrative ${specialties}` }));
    else setStaff((current) => addDemoStaff(current, { id: `demo-staff-sample-${++idCounter.current}`, name, title, specialties: `Illustrative ${specialties}`, enabled: true }));
    clearStaffForm();
  };

  return <div>
    <DemoModeBanner />
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#69705A]">Sample administration</p><h1 className="mt-1 font-serif text-3xl font-bold text-[#26352A]">Admin Dashboard</h1></div><span className="rounded-full bg-[#E3E9DF] px-3 py-1.5 text-[10px] font-semibold text-[#343923]">DEMO DATA · in-memory only</span></div>
    <nav aria-label="Demo admin sections" className="mb-6 flex gap-2 overflow-x-auto pb-1">{tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined} className={`min-h-11 shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold ${activeTab === tab.id ? 'bg-[#343923] text-white' : 'border border-[#53583A]/20 bg-white text-[#343923] hover:bg-[#EEE7DA]'}`}>{tab.label}</button>)}</nav>

    {activeTab === 'overview' && <><SectionHeading title="Sample business overview" description="Illustrative dashboard metrics; no live bookings or payments are shown." /><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Demo appointments', String(appointments.length).padStart(2, '0')], ['Demo staff records', String(staff.length).padStart(2, '0')], ['Demo service records', String(services.length).padStart(2, '0')], ['Payments', 'Not processed']].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#A8B7A0]/40 bg-white p-4 shadow-sm sm:p-5"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#69705A]">{label}</p><p className="mt-2 text-lg font-bold text-[#26352A] sm:text-2xl">{value}</p><DemoTag /></div>)}</div><div className="mt-6 rounded-2xl border border-[#A8B7A0]/40 bg-white p-5"><SectionHeading title="Management previews" description="Use the tabs to inspect service, staff, appointment, and booking screens." /><p className="text-xs leading-5 text-[#53583A]">Service and staff changes stay in component memory only. Leaving or reloading this demo discards them.</p></div></>}

    {activeTab === 'services' && <><SectionHeading title="Service management · DEMO DATA" description="Add, edit, or disable sample rows. Existing verified catalogue prices are locked; new rows have no catalogue price." />
      <form onSubmit={saveService} className="mb-5 grid gap-3 rounded-2xl border border-[#A8B7A0]/40 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-[11px] font-semibold text-[#343923]">DEMO DATA · Service name<input required value={serviceName} onChange={(event) => setServiceName(event.target.value)} placeholder="Sample service name" className="mt-1 w-full rounded-lg border border-[#53583A]/25 p-2 text-xs font-normal" /></label>
        <label className="text-[11px] font-semibold text-[#343923]">Sample group<input required value={serviceCategory} onChange={(event) => setServiceCategory(event.target.value)} placeholder="Sample category" className="mt-1 w-full rounded-lg border border-[#53583A]/25 p-2 text-xs font-normal" /></label>
        <label className="text-[11px] font-semibold text-[#343923]">Sample catalogue group<select value={serviceGender} onChange={(event) => setServiceGender(event.target.value)} className="mt-1 w-full rounded-lg border border-[#53583A]/25 bg-white p-2 text-xs font-normal"><option>Women's</option><option>Men's</option><option>Unisex</option></select></label>
        <div className="flex items-end gap-2"><button type="submit" className="rounded-lg bg-[#343923] px-3 py-2 text-xs font-semibold text-white">{editingServiceId ? 'Save Sample Edit' : 'Add Sample Service'}</button>{editingServiceId && <button type="button" onClick={clearServiceForm} className="rounded-lg border border-[#53583A]/25 px-3 py-2 text-xs">Cancel</button>}</div>
      </form><div className="grid gap-3 md:grid-cols-2">{services.map((service) => <article key={service.id} className="rounded-2xl border border-[#A8B7A0]/40 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><DemoTag /><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${service.enabled ? 'bg-[#E3E9DF] text-[#343923]' : 'bg-gray-100 text-gray-600'}`}>{service.enabled ? 'Demo enabled' : 'Demo disabled'}</span></div><h3 className="mt-3 font-semibold text-[#26352A]">{service.name}</h3><p className="mt-1 text-[11px] text-[#69705A]">{service.gender} · {service.category}</p><p className="mt-2 text-sm font-bold text-[#343923]">{service.priceLabel}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => { setEditingServiceId(service.id); setServiceName(service.name); setServiceGender(service.gender); setServiceCategory(service.category); }} className="rounded-lg border border-[#53583A]/25 px-3 py-2 text-[11px] font-semibold">Edit demo row</button><button type="button" onClick={() => setServices((current) => setDemoServiceEnabled(current, service.id, !service.enabled))} className="rounded-lg border border-[#53583A]/25 px-3 py-2 text-[11px] font-semibold">{service.enabled ? 'Disable sample' : 'Enable sample'}</button></div></article>)}</div>
    </>}

    {activeTab === 'staff' && <><SectionHeading title="Staff management · DEMO DATA" description="Fictional profiles only. Specialty text is illustrative and does not represent verified qualifications." />
      <form onSubmit={saveStaff} className="mb-5 grid gap-3 rounded-2xl border border-[#A8B7A0]/40 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-[11px] font-semibold text-[#343923]">DEMO DATA · Name<input required value={staffName} onChange={(event) => setStaffName(event.target.value)} placeholder="Demo team member" className="mt-1 w-full rounded-lg border border-[#53583A]/25 p-2 text-xs font-normal" /></label>
        <label className="text-[11px] font-semibold text-[#343923]">Sample title<input required value={staffTitle} onChange={(event) => setStaffTitle(event.target.value)} placeholder="Sample role" className="mt-1 w-full rounded-lg border border-[#53583A]/25 p-2 text-xs font-normal" /></label>
        <label className="text-[11px] font-semibold text-[#343923]">Illustrative specialties<input required value={staffSpecialties} onChange={(event) => setStaffSpecialties(event.target.value)} placeholder="Sample areas" className="mt-1 w-full rounded-lg border border-[#53583A]/25 p-2 text-xs font-normal" /></label>
        <div className="flex items-end gap-2"><button type="submit" className="rounded-lg bg-[#343923] px-3 py-2 text-xs font-semibold text-white">{editingStaffId ? 'Save Sample Edit' : 'Add Sample Staff'}</button>{editingStaffId && <button type="button" onClick={clearStaffForm} className="rounded-lg border border-[#53583A]/25 px-3 py-2 text-xs">Cancel</button>}</div>
      </form><div className="grid gap-3 md:grid-cols-2">{staff.map((member) => <article key={member.id} className="rounded-2xl border border-[#A8B7A0]/40 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><DemoTag /><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${member.enabled ? 'bg-[#E3E9DF] text-[#343923]' : 'bg-gray-100 text-gray-600'}`}>{member.enabled ? 'Demo enabled' : 'Demo disabled'}</span></div><h3 className="mt-3 font-semibold text-[#26352A]">{member.name}</h3><p className="mt-1 text-[11px] text-[#69705A]">{member.title}</p><p className="mt-2 text-xs text-[#343923]">{member.specialties}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => { setEditingStaffId(member.id); setStaffName(member.name); setStaffTitle(member.title); setStaffSpecialties(member.specialties.replace(/^Illustrative\s/, '')); }} className="rounded-lg border border-[#53583A]/25 px-3 py-2 text-[11px] font-semibold">Edit demo profile</button><button type="button" onClick={() => setStaff((current) => setDemoStaffEnabled(current, member.id, !member.enabled))} className="rounded-lg border border-[#53583A]/25 px-3 py-2 text-[11px] font-semibold">{member.enabled ? 'Disable sample' : 'Enable sample'}</button></div></article>)}</div>
    </>}

    {activeTab === 'appointments' && <><SectionHeading title="Appointment management · DEMO DATA" description="Fictional schedule rows only. No real appointment is created, changed, paid, or notified." /><SampleTable headers={['DEMO DATA · Reference', 'Fictional customer', 'Example service', 'Example time', 'Fictional staff', 'Example status']} rows={appointments.map((appointment) => [appointment.id, appointment.customer, appointment.service, appointment.time, appointment.staff, appointment.status])} /></>}
    {activeTab === 'booking' && <DemoBookingSimulator />}
  </div>;
};

const appointmentStatuses: DemoAppointmentStatus[] = ['Scheduled', 'Checked in', 'In progress', 'Completed', 'Cancelled'];

export const DemoStaffDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState(() => DEMO_APPOINTMENTS.map((record) => ({ ...record })));
  return <div>
    <DemoModeBanner />
    <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#69705A]">Fictional sample team workspace</p><h1 className="mt-1 font-serif text-3xl font-bold text-[#26352A]">Staff Dashboard</h1></div>
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-2xl border border-[#A8B7A0]/40 bg-white p-5 shadow-sm"><SectionHeading title="Fictional staff profile · DEMO DATA" description="Sample profile for demonstration only." /><div className="rounded-xl bg-[#F5F1E8] p-4"><DemoTag /><p className="mt-3 font-serif text-xl font-bold text-[#26352A]">Demo Staff Member</p><p className="mt-1 text-xs text-[#53583A]">Sample Hair Stylist · FICTIONAL PROFILE</p><p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[#69705A]">Illustrative assigned services</p><ul className="mt-2 space-y-2 text-xs text-[#343923]"><li>• Sample Hair Cutting service</li><li>• Sample Hair Colour service</li></ul><p className="mt-3 border-t border-[#53583A]/15 pt-3 text-[10px] leading-4 text-amber-900">These examples are not actual staff assignments or verified service qualifications.</p></div></section>
      <section className="rounded-2xl border border-[#A8B7A0]/40 bg-white p-5 shadow-sm"><SectionHeading title="Fictional appointment schedule · DEMO DATA" description="Change an example status below. Updates stay in memory on this demo page only." /><div className="space-y-3">{appointments.map((appointment) => <article key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#53583A]/10 bg-[#F5F1E8]/60 p-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><DemoTag /><span className="text-[10px] font-semibold text-[#69705A]">{appointment.id}</span></div><p className="mt-2 text-sm font-bold text-[#26352A]">{appointment.time} · {appointment.customer}</p><p className="mt-1 text-xs text-[#53583A]">{appointment.service} · {appointment.staff}</p></div><label className="text-[10px] font-semibold text-[#343923]">DEMO STATUS<select aria-label={`Demo status for ${appointment.id}`} value={appointment.status} onChange={(event) => setAppointments((current) => updateDemoAppointmentStatus(current, appointment.id, event.target.value as DemoAppointmentStatus))} className="mt-1 block rounded-lg border border-[#53583A]/25 bg-white p-2 text-xs">{appointmentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label></article>)}</div></section>
    </div>
    <div className="mt-5"><DemoBookingSimulator /></div>
    <p className="mt-5 rounded-xl border border-[#A8B7A0]/40 bg-white p-4 text-xs text-[#53583A]">Demo mode does not create or update real appointments, process payments, or send customer notifications.</p>
  </div>;
};
