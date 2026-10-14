import React from 'react';
import { Shield, Clock, AlertCircle, FileText } from 'lucide-react';
import { SALON_INFO } from '../constants/salonData';

export const TermsPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#76603F]">
          Policies & Transparency
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#26352A]">
          Privacy Policy & Booking Terms
        </h1>
        <p className="text-xs text-gray-500">
          Last updated: October 2026 • THE OASIS UNISEX SALON & SPA, Puttur
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#D8C9A7]/40 space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
        {/* Section 1: Booking & Appointments */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-[#26352A]">
            <Clock className="w-5 h-5 text-[#76603F]" />
            <h2 className="font-serif text-xl font-bold">1. Booking & Arrival Policy</h2>
          </div>
          <p>
            Appointments booked at THE OASIS UNISEX SALON & SPA (2nd Floor, Providence Plaza, Main
            Road, Yelmudi Bridge, Puttur) are reserved exclusively for the allocated time window.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
            <li>
              <strong>Punctuality:</strong> We kindly request guests to arrive 5–10 minutes prior
              to their scheduled time.
            </li>
            <li>
              <strong>Grace Period:</strong> In the event of traffic or unforeseen delays, we hold
              your reservation for up to 15 minutes. Beyond this, we may need to adjust or reschedule
              your service so as not to inconvenience subsequent guests.
            </li>
            <li>
              <strong>Walk-ins:</strong> Walk-in clients are happily accommodated based on stylist
              availability between scheduled bookings.
            </li>
          </ul>
        </section>

        {/* Section 2: Cancellation & Rescheduling */}
        <section className="space-y-3 border-t border-gray-100 pt-6">
          <div className="flex items-center space-x-2 text-[#26352A]">
            <AlertCircle className="w-5 h-5 text-[#76603F]" />
            <h2 className="font-serif text-xl font-bold">2. Rescheduling & Cancellation Policy</h2>
          </div>
          <p>
            We understand that unforeseen events arise. We ask for fair notice so our specialists
            can offer open slots to other awaiting guests:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
            <li>
              <strong>Notice Window:</strong> Rescheduling or cancellation is free of charge when
              requested at least <strong>2 hours prior</strong> to the scheduled time via the
              website "My Appointments" portal or via phone (+91 91515 50077 / +91 77604 51767).
            </li>
            <li>
              <strong>No-Shows:</strong> Repeated unnotified no-shows may require advance deposit
              for future peak-hour or bridal appointments.
            </li>
          </ul>
        </section>

        {/* Section 3: Health, Safety & Patch Testing */}
        <section className="space-y-3 border-t border-gray-100 pt-6">
          <div className="flex items-center space-x-2 text-[#26352A]">
            <Shield className="w-5 h-5 text-[#76603F]" />
            <h2 className="font-serif text-xl font-bold">3. Health, Safety & Patch Testing</h2>
          </div>
          <p>
            Your wellness and skin safety are paramount at The Oasis:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
            <li>
              <strong>Allergy Patch Tests:</strong> For first-time chemical services (Global Hair
              Colour, Keratin Infusions, Rebonding), a discreet skin patch test is strongly
              advised 24 hours prior.
            </li>
            <li>
              <strong>Skin or Medical Conditions:</strong> Please inform your therapist or stylist
              of any skin sensitivities, allergies, recent dermatological treatments, or pregnancy
              prior to beginning facials or body massages.
            </li>
            <li>
              <strong>Hygiene Protocol:</strong> Metal instruments are hospital-grade autoclaved.
              Disposable items (wax strips, spatula, bed rolls, headbands) are strictly single-use.
            </li>
          </ul>
        </section>

        {/* Section 4: Privacy & Data Protection */}
        <section className="space-y-3 border-t border-gray-100 pt-6">
          <div className="flex items-center space-x-2 text-[#26352A]">
            <FileText className="w-5 h-5 text-[#76603F]" />
            <h2 className="font-serif text-xl font-bold">4. Privacy & Data Protection</h2>
          </div>
          <p>
            We respect your privacy in accordance with Indian Digital Personal Data Protection
            standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
            <li>
              We collect your name, mobile number, and email solely for appointment booking, SMS/phone
              confirmations, and billing receipts.
            </li>
            <li>
              We never sell, rent, or disclose your personal details to third-party telemarketers.
            </li>
            <li>
              Payment records and UPI references recorded at the salon are kept strictly for
              accounting and audit compliance.
            </li>
          </ul>
        </section>

        {/* Contact info */}
        <div className="bg-[#F5F1E8] p-4 rounded-2xl text-xs space-y-1">
          <p className="font-bold text-[#26352A]">Questions regarding policies?</p>
          <p className="text-gray-600">
            Please contact salon management directly at <strong>{SALON_INFO.phones[0].display}</strong>{' '}
            or visit us at 2nd Floor, Providence Plaza, Puttur.
          </p>
        </div>
      </div>
    </div>
  );
};
