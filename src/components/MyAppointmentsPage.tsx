import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { db } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import type { Appointment, AppointmentStatus } from '../types/salon';
import { formatINR, formatDuration, formatTime12Hour, formatDateWithWeekday } from '../lib/formatters';

interface MyAppointmentsPageProps {
  onOpenBooking: () => void;
}

export const MyAppointmentsPage: React.FC<MyAppointmentsPageProps> = ({ onOpenBooking }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(user?.phone || user?.email || '');
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    return db.getAppointments();
  });

  // Reschedule state
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleSlot, setRescheduleSlot] = useState<string>('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Cancellation state
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Personal schedule change');

  const refreshList = () => {
    setAppointments(db.getAppointments());
  };

  // Filtered by current user or query
  const displayedAppointments = useMemo(() => {
    if (!user) return [];
    const ownAppointments = appointments.filter((appointment) => appointment.customerId === user.id);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return ownAppointments.filter(
        (a) =>
          a.bookingReference.toLowerCase().includes(q) ||
          a.customerPhone.toLowerCase().includes(q) ||
          a.customerEmail.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q)
      );
    }
    return ownAppointments;
  }, [appointments, searchQuery, user]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return displayedAppointments.filter(
      (a) =>
        a.appointmentDate >= today &&
        a.status !== 'cancelled' &&
        a.status !== 'no_show' &&
        a.status !== 'completed'
    );
  }, [displayedAppointments]);

  const pastAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return displayedAppointments.filter(
      (a) =>
        a.appointmentDate < today ||
        a.status === 'completed' ||
        a.status === 'cancelled' ||
        a.status === 'no_show'
    );
  }, [displayedAppointments]);

  // Handle Reschedule
  const handleStartReschedule = (apt: Appointment) => {
    setReschedulingAppointment(apt);
    setRescheduleDate(apt.appointmentDate);
    setRescheduleSlot(apt.startTime);
    setRescheduleError(null);
  };

  const handleConfirmReschedule = () => {
    if (!reschedulingAppointment || !rescheduleDate || !rescheduleSlot) return;

    const result = db.rescheduleAppointment(
      reschedulingAppointment.id,
      rescheduleDate,
      rescheduleSlot
    );

    if (!result.success) {
      setRescheduleError(result.error || 'Failed to reschedule.');
      return;
    }

    setReschedulingAppointment(null);
    refreshList();
  };

  // Handle Cancel
  const handleConfirmCancel = () => {
    if (!cancellingAppointmentId) return;
    db.cancelAppointment(cancellingAppointmentId, cancelReason);
    setCancellingAppointmentId(null);
    refreshList();
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'checked_in':
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Checked In</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            <span>In Progress</span>
          </span>
        );
      case 'completed':
        return (
          <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-gray-600" />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#76603F]">
            Guest Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#26352A]">
            My Appointments
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your salon bookings, reschedule times, or cancel bookings in accordance with our policy.
          </p>
        </div>

        <button
          onClick={onOpenBooking}
          className="px-5 py-2.5 bg-[#26352A] text-white rounded-xl text-xs font-semibold hover:bg-[#19231C] active:scale-95 transition-all shadow-md flex items-center space-x-2 self-start"
        >
          <Sparkles className="w-4 h-4 text-[#D8C9A7]" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Lookup Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#D8C9A7]/40 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Booking Reference (e.g. OASIS-2026-8021) or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-base sm:text-sm rounded-xl border border-[#D8C9A7] bg-white focus:outline-none focus:ring-2 focus:ring-[#26352A]/20"
          />
        </div>
        <button
          onClick={refreshList}
          className="min-h-11 px-4 py-2 bg-[#E3E9DF] text-[#26352A] rounded-xl text-xs font-semibold hover:bg-[#A8B7A0]/40 transition-colors flex items-center space-x-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* UPCOMING APPOINTMENTS SECTION */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#26352A] flex items-center space-x-2">
          <span>Upcoming Appointments</span>
          <span className="bg-[#26352A] text-white text-[10px] px-2 py-0.2 rounded-full">
            {upcomingAppointments.length}
          </span>
        </h2>

        {upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/50 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-[#26352A] bg-[#E3E9DF] px-2.5 py-1 rounded">
                      {apt.bookingReference}
                    </span>
                    {getStatusBadge(apt.status)}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Providence Plaza, 2nd Floor, Puttur
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                      Date & Schedule
                    </span>
                    <p className="font-bold text-[#26352A] mt-0.5">
                      {formatDateWithWeekday(apt.appointmentDate)}
                    </p>
                    <p className="text-gray-600">
                      {formatTime12Hour(apt.startTime)} – {formatTime12Hour(apt.endTime)} (
                      {formatDuration(apt.totalDurationMinutes)})
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                      Services Booked
                    </span>
                    <p className="font-bold text-[#26352A] mt-0.5">
                      {apt.services.map((s) => s.name).join(', ')}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      Specialist: {apt.staffName || 'Oasis Specialist'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                      Total & Billing
                    </span>
                    <p className="font-bold text-base text-[#26352A] mt-0.5">
                      {formatINR(apt.totalPrice)}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Payment Status:{' '}
                      <span className="capitalize font-semibold text-emerald-700">
                        {apt.paymentStatus || 'Pay at Salon'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Actions: Reschedule / Cancel */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setCancellingAppointmentId(apt.id)}
                    className="px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    Cancel Booking
                  </button>
                  <button
                    onClick={() => handleStartReschedule(apt)}
                    className="px-4 py-1.5 text-xs bg-[#26352A] text-white hover:bg-[#19231C] rounded-lg transition-colors font-medium shadow-xs"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-dashed border-[#D8C9A7] text-center space-y-3">
            <Calendar className="w-8 h-8 text-[#A8B7A0] mx-auto" />
            <p className="text-sm font-bold text-[#26352A]">No upcoming appointments found</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You do not have any active appointments scheduled. Book a signature ritual anytime.
            </p>
            <button
              onClick={onOpenBooking}
              className="px-4 py-2 bg-[#26352A] text-white rounded-xl text-xs font-semibold inline-block"
            >
              Book an Appointment
            </button>
          </div>
        )}
      </div>

      {/* PAST & COMPLETED APPOINTMENTS */}
      {pastAppointments.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center space-x-2">
            <span>Past History & Completed Sessions</span>
            <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.2 rounded-full">
              {pastAppointments.length}
            </span>
          </h2>

          <div className="space-y-2.5">
            {pastAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white/80 rounded-xl p-4 border border-gray-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-gray-700">{apt.bookingReference}</span>
                    {getStatusBadge(apt.status)}
                  </div>
                  <p className="text-gray-700 font-medium mt-1">
                    {apt.services.map((s) => s.name).join(', ')}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {formatDateWithWeekday(apt.appointmentDate)} at {formatTime12Hour(apt.startTime)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-[#26352A]">{formatINR(apt.totalPrice)}</span>
                  <p className="text-[10px] text-gray-400 capitalize">
                    {apt.paymentMethod ? `Paid via ${apt.paymentMethod}` : 'Recorded'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {reschedulingAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-4">
          <div className="my-0 sm:my-4 max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#D8C9A7] space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#26352A]">
                Reschedule Booking {reschedulingAppointment.bookingReference}
              </h3>
              <button
                onClick={() => setReschedulingAppointment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#26352A] mb-1">
                  Select New Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-base sm:text-sm rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26352A] mb-1">
                  Select New Time (Available Slots)
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                  {db
                    .getAvailableSlots(
                      rescheduleDate,
                      reschedulingAppointment.totalDurationMinutes,
                      reschedulingAppointment.staffId
                    )
                    .map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setRescheduleSlot(slot)}
                        className={`py-1.5 px-1 text-center text-xs rounded-lg border ${
                          rescheduleSlot === slot
                            ? 'bg-[#26352A] text-white'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {formatTime12Hour(slot)}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setReschedulingAppointment(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-5 py-2 bg-[#26352A] text-white rounded-xl text-xs font-semibold hover:bg-[#19231C]"
              >
                Confirm New Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL REASON MODAL */}
      {cancellingAppointmentId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-4">
          <div className="my-0 sm:my-4 max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-red-200 space-y-4">
            <h3 className="font-serif text-base font-bold text-red-900 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>Cancel Appointment?</span>
            </h3>

            <p className="text-xs text-gray-600">
              Please note our salon cancellation policy. Are you sure you wish to cancel this slot?
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 text-xs border rounded-lg bg-white"
              >
                <option value="Personal schedule change">Personal schedule change</option>
                <option value="Travelling out of Puttur">Travelling out of Puttur</option>
                <option value="Booked by mistake">Booked by mistake</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setCancellingAppointmentId(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
