import React, { useState, useMemo } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { db } from '../lib/db';
import { formatINR, formatDuration, formatTime12Hour, formatDateWithWeekday } from '../lib/formatters';

interface BookingModalProps {
  onNavigateToAppointments?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ onNavigateToAppointments }) => {
  const {
    isOpen,
    closeBooking,
    step,
    setStep,
    selectedServices,
    toggleService,
    totalPrice,
    totalDuration,
    selectedStaffId,
    setSelectedStaffId,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    availableSlots,
    contact,
    setContact,
    submitBooking,
    isSubmitting,
    error,
    lastConfirmedAppointment,
    resetBooking,
  } = useBooking();

  const [genderFilter, setGenderFilter] = useState<'all' | 'men' | 'women' | 'unisex'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allServices = useMemo(() => db.getServices().filter((s) => s.isActive), [isOpen]);
  const staffList = useMemo(() => db.getStaff().filter((s) => s.isActive), [isOpen]);

  const filteredServices = useMemo(() => {
    return allServices.filter((s) => {
      if (genderFilter !== 'all' && s.gender !== genderFilter && s.gender !== 'unisex') return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allServices, genderFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#F5F1E8] rounded-2xl shadow-2xl border border-[#D8C9A7]/50 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#26352A] text-[#F5F1E8] px-6 py-4 flex items-center justify-between border-b border-[#D8C9A7]/30">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-[#D8C9A7]" />
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-semibold tracking-wide text-white">
                Book an Appointment
              </h3>
              <p className="text-xs text-[#E3E9DF]/80">THE OASIS UNISEX SALON & SPA • PUTTUR</p>
            </div>
          </div>
          <button
            onClick={() => {
              closeBooking();
            }}
            className="p-1.5 rounded-full text-[#E3E9DF] hover:bg-[#344839] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Steps 1 to 4) */}
        {step < 5 && (
          <div className="bg-[#E3E9DF]/70 px-6 py-3 border-b border-[#D8C9A7]/30">
            <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-medium text-[#26352A]">
              <div
                className={`flex items-center space-x-1.5 ${step >= 1 ? 'font-bold text-[#26352A]' : 'opacity-50'}`}
              >
                <span className="w-5 h-5 rounded-full bg-[#26352A] text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Select Services</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <div
                className={`flex items-center space-x-1.5 ${step >= 2 ? 'font-bold text-[#26352A]' : 'opacity-50'}`}
              >
                <span className="w-5 h-5 rounded-full bg-[#26352A] text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Date & Time</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <div
                className={`flex items-center space-x-1.5 ${step >= 3 ? 'font-bold text-[#26352A]' : 'opacity-50'}`}
              >
                <span className="w-5 h-5 rounded-full bg-[#26352A] text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Stylist & Details</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <div
                className={`flex items-center space-x-1.5 ${step >= 4 ? 'font-bold text-[#26352A]' : 'opacity-50'}`}
              >
                <span className="w-5 h-5 rounded-full bg-[#26352A] text-white flex items-center justify-center text-[10px]">
                  4
                </span>
                <span>Review</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: SELECT SERVICES */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Gender pills */}
                <div className="flex items-center space-x-1.5 bg-[#E3E9DF] p-1 rounded-lg">
                  {(['all', 'men', 'women'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenderFilter(g)}
                      className={`px-3 py-1 text-xs rounded-md font-medium capitalize transition-all ${
                        genderFilter === g
                          ? 'bg-[#26352A] text-white shadow-xs'
                          : 'text-[#26352A] hover:bg-[#A8B7A0]/30'
                      }`}
                    >
                      {g === 'all' ? 'All Services' : `${g}'s`}
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <input
                  type="text"
                  placeholder="Search haircut, facial, keratin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3.5 py-1.5 text-xs rounded-lg border border-[#D8C9A7] bg-white focus:outline-none focus:ring-1 focus:ring-[#26352A] w-full sm:w-64"
                />
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1">
                {filteredServices.map((service) => {
                  const isSelected = selectedServices.some((s) => s.id === service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#26352A] bg-white ring-2 ring-[#26352A]/20 shadow-sm'
                          : 'border-[#D8C9A7]/40 bg-white/70 hover:bg-white hover:border-[#26352A]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-[#26352A] border-[#26352A]' : 'border-gray-400'
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </span>
                            <h4 className="text-xs font-semibold text-[#26352A]">{service.name}</h4>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 pl-6">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs pl-6">
                        <span className="text-gray-500 flex items-center space-x-1 text-[11px]">
                          <Clock className="w-3 h-3 text-[#A8B7A0]" />
                          <span>{formatDuration(service.durationMinutes)}</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          {!service.priceConfirmed && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                              Estimated
                            </span>
                          )}
                          <span className="font-semibold text-sm text-[#26352A]">
                            {formatINR(service.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-500">
                  No services found matching your filter.
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DATE & TIME */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Picker */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-[#26352A] uppercase tracking-wider">
                    1. Choose Appointment Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot('');
                    }}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#D8C9A7] bg-white focus:outline-none focus:ring-2 focus:ring-[#26352A]/20"
                  />
                  <div className="p-3 bg-[#E3E9DF]/60 rounded-xl text-xs space-y-1 text-[#26352A]/80">
                    <p className="font-semibold text-[#26352A]">
                      Selected: {formatDateWithWeekday(selectedDate)}
                    </p>
                    <p className="text-[11px]">
                      Duration required for your {selectedServices.length} service(s):{' '}
                      <strong>{formatDuration(totalDuration)}</strong>
                    </p>
                  </div>
                </div>

                {/* Available Slots */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-[#26352A] uppercase tracking-wider">
                    2. Available Time Slots ({availableSlots.length})
                  </label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[36vh] overflow-y-auto pr-1">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-1 text-center text-xs rounded-lg font-medium border transition-all ${
                            selectedSlot === slot
                              ? 'bg-[#26352A] text-white border-[#26352A] shadow-xs'
                              : 'bg-white border-[#D8C9A7]/40 text-[#26352A] hover:border-[#26352A]'
                          }`}
                        >
                          {formatTime12Hour(slot)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-amber-50/80 border border-amber-200 rounded-xl text-center text-xs text-amber-800 space-y-1">
                      <ShieldAlert className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                      <p className="font-semibold">No available slots for this date</p>
                      <p className="text-[11px]">
                        The salon may be fully booked, closed for a holiday, or past operating
                        hours. Please select another date.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: STYLIST & CONTACT */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Staff Preference */}
              <div>
                <label className="block text-xs font-semibold text-[#26352A] uppercase tracking-wider mb-2">
                  Select Specialist or Stylist
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  <div
                    onClick={() => setSelectedStaffId(undefined)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                      selectedStaffId === undefined
                        ? 'border-[#26352A] bg-white ring-2 ring-[#26352A]/20'
                        : 'border-[#D8C9A7]/40 bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E3E9DF] flex items-center justify-center font-bold text-xs text-[#26352A]">
                      ANY
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#26352A]">Any Available Staff</p>
                      <p className="text-[10px] text-gray-500">Fastest appointment match</p>
                    </div>
                  </div>

                  {staffList.map((stf) => (
                    <div
                      key={stf.id}
                      onClick={() => setSelectedStaffId(stf.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                        selectedStaffId === stf.id
                          ? 'border-[#26352A] bg-white ring-2 ring-[#26352A]/20'
                          : 'border-[#D8C9A7]/40 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <img
                        src={stf.avatarUrl}
                        alt={stf.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#D8C9A7]"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-[#26352A] truncate">{stf.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{stf.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information Form */}
              <div className="pt-2 border-t border-[#D8C9A7]/30 space-y-3">
                <label className="block text-xs font-semibold text-[#26352A] uppercase tracking-wider">
                  Your Contact Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-gray-600 block mb-1">
                      Full Name *
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Kavya Rai"
                      value={contact.fullName}
                      onChange={(e) => setContact({ fullName: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D8C9A7] bg-white focus:outline-none focus:ring-1 focus:ring-[#26352A]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-gray-600 block mb-1">
                      Mobile Number (India) *
                    </span>
                    <input
                      type="tel"
                      placeholder="e.g. 98451 12233"
                      value={contact.phone}
                      onChange={(e) => setContact({ phone: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D8C9A7] bg-white focus:outline-none focus:ring-1 focus:ring-[#26352A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-gray-600 block mb-1">
                      Email Address
                    </span>
                    <input
                      type="email"
                      placeholder="kavya.rai@example.com"
                      value={contact.email}
                      onChange={(e) => setContact({ email: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D8C9A7] bg-white focus:outline-none focus:ring-1 focus:ring-[#26352A]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-gray-600 block mb-1">
                      Special Notes / Requests
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Prefer organic herbal oil, first visit"
                      value={contact.notes}
                      onChange={(e) => setContact({ notes: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D8C9A7] bg-white focus:outline-none focus:ring-1 focus:ring-[#26352A]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl p-5 border border-[#D8C9A7]/50 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#26352A]">
                      Appointment Summary
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Providence Plaza, 2nd Floor, Yelmudi Bridge, Puttur
                    </p>
                  </div>
                  <span className="text-xs bg-[#E3E9DF] text-[#26352A] font-semibold px-2.5 py-1 rounded-full">
                    {formatDateWithWeekday(selectedDate)} at {formatTime12Hour(selectedSlot)}
                  </span>
                </div>

                {/* Services list */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Selected Services ({selectedServices.length})
                  </div>
                  {selectedServices.map((s) => (
                    <div key={s.id} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-medium text-[#26352A]">{s.name}</span>
                        <span className="text-gray-400 ml-2">({formatDuration(s.durationMinutes)})</span>
                      </div>
                      <span className="font-semibold text-[#26352A]">{formatINR(s.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-500">Total Duration</span>
                    <p className="text-xs font-bold text-[#26352A]">{formatDuration(totalDuration)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Estimated Total</span>
                    <p className="text-base font-bold text-[#26352A]">{formatINR(totalPrice)}</p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="border-t border-gray-100 pt-3 text-xs grid grid-cols-2 gap-2 text-gray-600 bg-[#F5F1E8]/50 p-2.5 rounded-lg">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Client</span>
                    <span className="font-medium text-[#26352A]">{contact.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Phone</span>
                    <span className="font-medium text-[#26352A]">{contact.phone}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#E3E9DF]/70 rounded-xl text-xs text-[#26352A]/80 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#26352A] shrink-0 mt-0.5" />
                <span>
                  No immediate advance payment required. You may pay at the salon via Cash, UPI (GPay/PhonePe), or Card upon completion.
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS & BOOKING REFERENCE */}
          {step === 5 && lastConfirmedAppointment && (
            <div className="text-center py-6 px-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-[#26352A]">
                  Appointment Confirmed!
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  We look forward to welcoming you at The Oasis in Puttur.
                </p>
              </div>

              {/* Reference Card */}
              <div className="bg-white rounded-xl p-5 border border-[#D8C9A7] max-w-md mx-auto shadow-sm space-y-3 text-left">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-xs text-gray-500">Booking Reference</span>
                  <span className="font-mono text-sm font-bold text-[#26352A] bg-[#E3E9DF] px-2.5 py-0.5 rounded">
                    {lastConfirmedAppointment.bookingReference}
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date & Time</span>
                    <span className="font-semibold text-[#26352A]">
                      {formatDateWithWeekday(lastConfirmedAppointment.appointmentDate)} at{' '}
                      {formatTime12Hour(lastConfirmedAppointment.startTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Specialist</span>
                    <span className="font-semibold text-[#26352A]">
                      {lastConfirmedAppointment.staffName || 'Oasis Specialist'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Services</span>
                    <span className="font-semibold text-[#26352A]">
                      {lastConfirmedAppointment.services.map((s) => s.name).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-sm">
                    <span>Total Amount</span>
                    <span className="text-[#26352A]">
                      {formatINR(lastConfirmedAppointment.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    closeBooking();
                    if (onNavigateToAppointments) {
                      onNavigateToAppointments();
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#26352A] text-white rounded-xl text-xs font-semibold hover:bg-[#19231C] transition-all shadow-md"
                >
                  View in My Appointments
                </button>
                <button
                  onClick={() => {
                    resetBooking();
                    closeBooking();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 border border-[#26352A]/40 text-[#26352A] rounded-xl text-xs font-semibold hover:bg-[#E3E9DF] transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Steps 1 to 4) */}
        {step < 5 && (
          <div className="bg-white px-6 py-4 border-t border-[#D8C9A7]/30 flex items-center justify-between">
            {/* Running total */}
            <div>
              <span className="text-[11px] text-gray-500 block">
                {selectedServices.length} service(s) selected • {formatDuration(totalDuration)}
              </span>
              <span className="text-base font-bold text-[#26352A]">{formatINR(totalPrice)}</span>
            </div>

            {/* Step navigation buttons */}
            <div className="flex items-center space-x-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-[#26352A]/30 text-[#26352A] rounded-xl text-xs font-semibold hover:bg-[#F5F1E8]"
                >
                  Back
                </button>
              )}

              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  disabled={selectedServices.length === 0}
                  className="px-5 py-2.5 bg-[#26352A] text-white rounded-xl text-xs font-semibold hover:bg-[#19231C] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Continue to Date
                </button>
              )}

              {step === 2 && (
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedSlot}
                  className="px-5 py-2.5 bg-[#26352A] text-white rounded-xl text-xs font-semibold hover:bg-[#19231C] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Continue to Stylist
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={() => setStep(4)}
                  disabled={!contact.fullName.trim() || !contact.phone.trim()}
                  className="px-5 py-2.5 bg-[#26352A] text-white rounded-xl text-xs font-semibold hover:bg-[#19231C] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Review Summary
                </button>
              )}

              {step === 4 && (
                <button
                  onClick={() => submitBooking()}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#26352A] text-[#F5F1E8] rounded-xl text-xs font-semibold hover:bg-[#19231C] active:scale-95 transition-all shadow-md flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <span>Confirming...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#D8C9A7]" />
                      <span>Confirm Booking</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
