import React, { useState } from 'react';

type AdminTab = 'overview' | 'services' | 'staff' | 'appointments';

const sampleServices = [
  { name: 'Basic Hair Cut', gender: "Women's", category: 'Hair Cutting', price: '₹250', status: 'Sample active' },
  { name: 'Hydra Glow Facial', gender: "Women's", category: 'Premium Facial', price: '₹3,000–₹5,000', status: 'Sample active' },
  { name: 'Keratin Treatment — Extra Long', gender: "Women's", category: 'Keratin Treatment', price: '₹10,000+', status: 'Sample active' },
  { name: 'Smoothening', gender: "Men's", category: 'Smoothening / Straightening', price: '₹1,000–₹3,000', status: 'Sample active' },
  { name: 'Keratin Treatment', gender: "Men's", category: 'Keratin Treatment', price: '₹2,000–₹3,500', status: 'Sample active' },
];

const sampleStaff = [
  { name: 'Demo Team Member A', title: 'Sample Hair Stylist', specialties: 'Hair Cutting · Hair Colour', status: 'Sample profile' },
  { name: 'Demo Team Member B', title: 'Sample Beauty Therapist', specialties: 'Facials · Hair Spa', status: 'Sample profile' },
];

const sampleAppointments = [
  { ref: 'DEMO-001', customer: 'Sample Customer A', service: 'Basic Hair Cut', time: '10:30 AM', staff: 'Demo Team Member A', status: 'Example scheduled' },
  { ref: 'DEMO-002', customer: 'Sample Customer B', service: 'Hydra Glow Facial', time: '12:00 PM', staff: 'Demo Team Member B', status: 'Example scheduled' },
  { ref: 'DEMO-003', customer: 'Sample Customer C', service: 'Smoothening', time: '2:30 PM', staff: 'Demo Team Member A', status: 'Example pending' },
];

const DemoModeBanner = () => (
  <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold tracking-wide text-amber-950" role="status">
    DEMO MODE — Sample Data
    <p className="mt-1 text-xs font-normal tracking-normal">All names, profiles, statistics, and appointments on this screen are illustrative sample data. Actions are disabled.</p>
  </div>
);

const SectionHeading: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="mb-4">
    <h2 className="font-serif text-xl font-bold text-[#26352A]">{title}</h2>
    <p className="mt-1 text-xs text-[#69705A]">{description}</p>
  </div>
);

const SampleTable: React.FC<{ headers: string[]; rows: string[][] }> = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-xl border border-[#A8B7A0]/50 bg-white">
    <table className="w-full min-w-[640px] border-collapse text-left text-xs">
      <thead className="bg-[#EEE7DA] text-[#343923]"><tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr></thead>
      <tbody className="divide-y divide-[#53583A]/10">{rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`} className="px-4 py-3 text-[#343923]">{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>
);

export const DemoAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'Service Management' },
    { id: 'staff', label: 'Staff Management' },
    { id: 'appointments', label: 'Appointment Management' },
  ];

  return (
    <div>
      <DemoModeBanner />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#69705A]">Sample administration</p><h1 className="mt-1 font-serif text-3xl font-bold text-[#26352A]">Admin Dashboard</h1></div>
        <span className="rounded-full bg-[#E3E9DF] px-3 py-1.5 text-[10px] font-semibold text-[#343923]">Read-only preview</span>
      </div>

      <nav aria-label="Demo admin sections" className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined} className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold ${activeTab === tab.id ? 'bg-[#343923] text-white' : 'border border-[#53583A]/20 bg-white text-[#343923] hover:bg-[#EEE7DA]'}`}>{tab.label}</button>)}
      </nav>

      {activeTab === 'overview' && <>
        <SectionHeading title="Sample business overview" description="Illustrative dashboard metrics; no live bookings or payments are shown." />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['Sample appointments', '03'], ['Sample team profiles', '02'], ['Sample catalogue rows', '05'], ['Sample payment total', 'Not processed'],
          ].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#A8B7A0]/40 bg-white p-4 shadow-sm sm:p-5"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#69705A]">{label}</p><p className="mt-2 text-lg font-bold text-[#26352A] sm:text-2xl">{value}</p></div>)}
        </div>
        <div className="mt-6 rounded-2xl border border-[#A8B7A0]/40 bg-white p-5"><SectionHeading title="Management previews" description="Use the tabs to inspect the sample service, staff, and appointment screens." /><p className="text-xs leading-5 text-[#53583A]">This dashboard is separate from the authenticated admin console. No changes here are saved, sent, or applied to salon records.</p></div>
      </>}

      {activeTab === 'services' && <>
        <SectionHeading title="Service management · sample rows" description="Prices below match the verified catalogue examples; these are read-only sample rows." />
        <SampleTable headers={['Service', 'Catalogue group', 'Sample price', 'Sample status', 'Demo action']} rows={sampleServices.map((service) => [service.name, `${service.gender} · ${service.category}`, service.price, service.status, 'Edit disabled'])} />
      </>}

      {activeTab === 'staff' && <>
        <SectionHeading title="Staff management · sample profiles" description="Fictional demo profiles; these are not salon employees or qualification assignments." />
        <SampleTable headers={['Sample profile', 'Sample title', 'Illustrative specialties', 'Status', 'Demo action']} rows={sampleStaff.map((staff) => [staff.name, staff.title, staff.specialties, staff.status, 'Edit disabled'])} />
      </>}

      {activeTab === 'appointments' && <>
        <SectionHeading title="Appointment management · examples" description="Fictional schedule rows only. No real appointment is created, changed, paid, or notified." />
        <SampleTable headers={['Sample reference', 'Sample customer', 'Example service', 'Example time', 'Sample staff', 'Example status', 'Demo action']} rows={sampleAppointments.map((appointment) => [appointment.ref, appointment.customer, appointment.service, appointment.time, appointment.staff, appointment.status, 'Actions disabled'])} />
      </>}
    </div>
  );
};

export const DemoStaffDashboard: React.FC = () => (
  <div>
    <DemoModeBanner />
    <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#69705A]">Sample team workspace</p><h1 className="mt-1 font-serif text-3xl font-bold text-[#26352A]">Staff Dashboard</h1></div>

    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-2xl border border-[#A8B7A0]/40 bg-white p-5 shadow-sm">
        <SectionHeading title="Sample staff profile" description="Fictional profile for demonstration only." />
        <div className="rounded-xl bg-[#F5F1E8] p-4"><p className="font-serif text-xl font-bold text-[#26352A]">Demo Staff Member</p><p className="mt-1 text-xs text-[#53583A]">Sample Hair Stylist · DEMO PROFILE</p><p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[#69705A]">Illustrative assigned services</p><ul className="mt-2 space-y-2 text-xs text-[#343923]"><li>• Sample Hair Cutting service</li><li>• Sample Hair Colour service</li></ul><p className="mt-3 border-t border-[#53583A]/15 pt-3 text-[10px] leading-4 text-amber-900">These examples are not actual staff assignments or verified service qualifications.</p></div>
      </section>

      <section className="rounded-2xl border border-[#A8B7A0]/40 bg-white p-5 shadow-sm">
        <SectionHeading title="Example appointment schedule" description="A fictional schedule for layout demonstration; status controls are not available." />
        <div className="space-y-3">
          {[
            ['10:30 AM', 'Sample Customer A', 'Basic Hair Cut', 'Example scheduled'],
            ['1:00 PM', 'Sample Customer B', 'Sample Hair Spa service', 'Example scheduled'],
            ['3:15 PM', 'Sample Customer C', 'Sample Hair Colour service', 'Example pending'],
          ].map(([time, customer, service, status]) => <article key={time} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#53583A]/10 bg-[#F5F1E8]/60 p-4"><div><p className="text-sm font-bold text-[#26352A]">{time} · {customer}</p><p className="mt-1 text-xs text-[#53583A]">{service}</p></div><span className="rounded-full bg-[#E3E9DF] px-3 py-1 text-[10px] font-semibold text-[#343923]">{status}</span></article>)}
        </div>
      </section>
    </div>
    <p className="mt-5 rounded-xl border border-[#A8B7A0]/40 bg-white p-4 text-xs text-[#53583A]">Demo mode does not create or update appointments, process payments, or send customer notifications.</p>
  </div>
);
