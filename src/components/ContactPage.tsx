import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';
import { SALON_INFO } from '../constants/salonData';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT;
      if (!endpoint || !SALON_INFO.email) {
        throw new Error('The enquiry email service is not configured yet. Please call or message us on WhatsApp.');
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, to: SALON_INFO.email }),
      });
      if (!response.ok) throw new Error('We could not send your enquiry. Please try again or contact us by phone.');
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not send your enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#76603F]">
          Get In Touch
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#26352A]">
          Visit The Oasis in Puttur
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          We are located at Providence Plaza, Yelmudi Bridge. Walk-ins are welcome based on
          availability, though prior appointment booking is strongly recommended.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Details Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#D8C9A7]/40 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#26352A]">Salon Coordinates</h2>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* Address */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-[#E3E9DF] flex items-center justify-center shrink-0 text-[#26352A]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-[#26352A]">Salon Address</h4>
                <p className="text-gray-600 mt-0.5">2nd Floor, Providence Plaza</p>
                <p className="text-gray-600">Main Road, Yelmudi Bridge</p>
                <p className="text-gray-600">Puttur, D.K., Karnataka 574201, India</p>
                <a
                  href={SALON_INFO.googleMaps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[#76603F] hover:underline font-semibold mt-1 text-xs"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Telephone numbers */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-[#E3E9DF] flex items-center justify-center shrink-0 text-[#26352A]">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-[#26352A]">Telephone Numbers (Click to Call)</h4>
                <div className="flex flex-col space-y-1 mt-1">
                  {SALON_INFO.phones.map((phone) => (
                    <a
                      key={phone.raw}
                      href={`tel:${phone.raw}`}
                      className="text-[#26352A] font-semibold hover:text-[#76603F] transition-colors"
                    >
                      {phone.display}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Instagram */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-[#E3E9DF] flex items-center justify-center shrink-0 text-[#26352A]">
                <InstagramIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-[#26352A]">Instagram Official</h4>
                <a
                  href={SALON_INFO.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#26352A] font-semibold hover:text-[#76603F] transition-colors mt-0.5 inline-block"
                >
                  {SALON_INFO.instagram.handle}
                </a>
              </div>
            </div>

            {/* Business Hours */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-[#E3E9DF] flex items-center justify-center shrink-0 text-[#26352A]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-[#26352A]">Operating Hours</h4>
                <p className="text-gray-600 mt-0.5">Monday to Sunday: 09:00 AM – 08:30 PM</p>
                <p className="text-[11px] text-gray-400">Open 7 days a week including Sundays</p>
              </div>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="rounded-2xl overflow-hidden h-56 border border-gray-200 shadow-inner">
            <iframe
              title="Oasis Salon Map"
              src={SALON_INFO.googleMaps.embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            />
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#D8C9A7]/40 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#26352A]">Send an Inquiry</h2>
          <p className="text-xs text-gray-500">
            Send your name, phone number, optional email, subject and message. Email delivery starts after the salon email and server endpoint are configured.
          </p>

          {submitted ? (
            <div className="p-6 bg-[#E3E9DF] rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#26352A] mx-auto" />
              <h4 className="font-serif text-lg font-bold text-[#26352A]">Inquiry Received!</h4>
              <p className="text-xs text-gray-600">
                Thank you, {formData.name}. Our front desk at Providence Plaza will call you back on{' '}
                <strong>{SALON_INFO.email}</strong>.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 px-4 py-2 bg-[#26352A] text-white rounded-xl text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Praveen Gowda"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#26352A]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="98451 12233"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#26352A]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="praveen@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#26352A]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject *</label>
                <input
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Message / Special Request
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us what you are looking for..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#26352A]/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#26352A] text-white rounded-xl text-xs font-semibold hover:bg-[#19231C] active:scale-95 transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5 text-[#D8C9A7]" />
                <span>{submitting ? 'Sending…' : 'Send Email Enquiry'}</span>
              </button>
              {submitError && <p role="alert" className="text-xs text-red-700">{submitError}</p>}
              <a href={`https://wa.me/${SALON_INFO.phones[0].raw}?text=${encodeURIComponent(`Hello THE OASIS UNISEX SALON & SPA. My name is ${formData.name || '[name]'}. ${formData.subject ? `Subject: ${formData.subject}. ` : ''}${formData.message || 'I have an enquiry.'}`)}`} target="_blank" rel="noopener noreferrer" className="block text-center text-xs text-[#343923] underline underline-offset-4">Continue on WhatsApp (you will need to press Send)</a>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
