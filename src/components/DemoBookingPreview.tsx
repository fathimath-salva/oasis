import React, { useState } from 'react';
import { createDemoBookingPreview, DEMO_SERVICES } from '../lib/demoState';

const SAMPLE_TIMES = ['10:30 AM', '12:00 PM', '2:30 PM'];

function localDateAfter(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DemoBookingPreview: React.FC = () => {
  const [serviceId, setServiceId] = useState(DEMO_SERVICES[0]?.id ?? '');
  const [date, setDate] = useState(() => localDateAfter(1));
  const [time, setTime] = useState(SAMPLE_TIMES[0]);
  const [preview, setPreview] = useState<ReturnType<typeof createDemoBookingPreview> | null>(null);
  const selectedService = DEMO_SERVICES.find((service) => service.id === serviceId);

  const createPreview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedService || !date || !time) return;
    setPreview(createDemoBookingPreview(selectedService.name, date, time));
  };

  return (
    <section className="mt-5 rounded-2xl border border-[#D8C9A7] bg-white p-4 sm:p-5" aria-labelledby="demo-booking-title">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-full bg-[#E3E9DF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#26352A]">Demo only · Sample data</span>
          <h4 id="demo-booking-title" className="mt-2 font-serif text-lg font-semibold text-[#26352A]">Demo Booking Preview</h4>
          <p className="mt-1 max-w-2xl text-[11px] leading-5 text-[#53583A]">Explore a fictional service, date and sample time. This preview does not check live availability or contact the salon.</p>
        </div>
      </div>

      <form onSubmit={createPreview} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <label className="block text-[11px] font-semibold text-[#343923]">
          Sample service
          <select value={serviceId} onChange={(event) => { setServiceId(event.target.value); setPreview(null); }} className="mt-1.5 w-full rounded-xl border border-[#D8C9A7] bg-[#F5F1E8] px-3 py-2.5 text-xs font-normal">
            {DEMO_SERVICES.map((service) => <option key={service.id} value={service.id}>{service.name} · DEMO</option>)}
          </select>
        </label>
        <label className="block text-[11px] font-semibold text-[#343923]">
          Sample date
          <input type="date" min={localDateAfter(0)} value={date} onChange={(event) => { setDate(event.target.value); setPreview(null); }} required className="mt-1.5 w-full rounded-xl border border-[#D8C9A7] bg-[#F5F1E8] px-3 py-2.5 text-xs font-normal" />
        </label>
        <label className="block text-[11px] font-semibold text-[#343923]">
          Fictional sample time
          <select value={time} onChange={(event) => { setTime(event.target.value); setPreview(null); }} className="mt-1.5 w-full rounded-xl border border-[#D8C9A7] bg-[#F5F1E8] px-3 py-2.5 text-xs font-normal">
            {SAMPLE_TIMES.map((sampleTime) => <option key={sampleTime} value={sampleTime}>{sampleTime} · sample</option>)}
          </select>
        </label>
        <button type="submit" className="rounded-xl bg-[#26352A] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#19231C]">Preview Demo Booking</button>
      </form>

      {preview && (
        <div className="mt-4 rounded-xl border border-[#D8C9A7] bg-[#F5F1E8] p-4" role="status" aria-live="polite">
          <p className="text-sm font-bold text-[#26352A]">DEMO ONLY — Appointment not booked</p>
          <p className="mt-1 text-xs text-[#343923]">{preview.serviceName} · {preview.date} · {preview.time}</p>
          <p className="mt-1 text-[11px] leading-5 text-[#53583A]">{preview.detail}</p>
        </div>
      )}
    </section>
  );
};
