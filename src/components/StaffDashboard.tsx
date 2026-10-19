import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { db } from '../lib/db';
import type { Appointment, AppointmentStatus } from '../types/salon';
import { formatINR, formatDuration, formatTime12Hour, formatDateWithWeekday } from '../lib/formatters';

export const StaffDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => db.getAppointments());
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'schedule'>('today');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('stf-1'); // Default to Ramesh Shetty

  const staffList = useMemo(() => db.getStaff(), []);
  const currentStaff = useMemo(
    () => staffList.find((s) => s.id === selectedStaffId) || staffList[0],
    [staffList, selectedStaffId]
  );

  const refreshAppointments = () => {
    setAppointments(db.getAppointments());
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Appointments assigned to this staff member
  const staffAppointments = useMemo(() => {
    return appointments.filter(
      (a) => a.staffId === selectedStaffId || (!a.staffId && a.status === 'confirmed')
    );
  }, [appointments, selectedStaffId]);

  const todayAppointments = useMemo(() => {
    return staffAppointments.filter((a) => a.appointmentDate === todayStr);
  }, [staffAppointments, todayStr]);

  const upcomingAppointments = useMemo(() => {
    return staffAppointments.filter((a) => a.appointmentDate > todayStr);
  }, [staffAppointments, todayStr]);

  // Actions
  const handleStatusUpdate = (appointmentId: string, newStatus: AppointmentStatus) => {
    db.updateAppointmentStatus(appointmentId, newStatus, currentStaff.name);
    refreshAppointments();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Staff Top Banner */}
      <div className="bg-[#26352A] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#D8C9A7]/30">
        <div className="flex items-center space-x-4">
          <img
            src={currentStaff?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt={currentStaff?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#D8C9A7]"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="bg-[#D8C9A7] text-[#26352A] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                Staff Portal
              </span>
              <span className="text-xs text-[#E3E9DF]/80">Dakshina Kannada, Puttur</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-0.5">{currentStaff?.name}</h1>
            <p className="text-xs text-[#E3E9DF]/80">{currentStaff?.title}</p>
          </div>
        </div>

        {/* Staff Switcher for demo */}
        <div className="flex flex-wrap items-center gap-2 bg-[#19231C] p-2.5 rounded-2xl border border-[#344839]">
          <span className="pl-1 text-[11px] text-gray-400 font-medium">Switch Staff:</span>
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="min-w-0 max-w-full flex-1 bg-[#26352A] text-white text-base sm:text-sm rounded-xl px-3 py-1.5 border border-[#D8C9A7]/40 focus:outline-none sm:flex-none"
          >
            {staffList.map((stf) => (
              <option key={stf.id} value={stf.id}>
                {stf.name} ({stf.title.split('&')[0]})
              </option>
            ))}
          </select>
          <button
            onClick={refreshAppointments}
            className="p-1.5 text-[#D8C9A7] hover:text-white"
            title="Refresh queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
            Today's Appointments
          </span>
          <span className="font-serif text-3xl font-bold text-[#26352A] mt-1 block">
            {todayAppointments.length}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-blue-500 font-semibold block">
            Checked In (Waiting)
          </span>
          <span className="font-serif text-3xl font-bold text-blue-700 mt-1 block">
            {todayAppointments.filter((a) => a.status === 'checked_in').length}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-purple-500 font-semibold block">
            In Service Now
          </span>
          <span className="font-serif text-3xl font-bold text-purple-700 mt-1 block">
            {todayAppointments.filter((a) => a.status === 'in_progress').length}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-emerald-500 font-semibold block">
            Completed Today
          </span>
          <span className="font-serif text-3xl font-bold text-emerald-700 mt-1 block">
            {todayAppointments.filter((a) => a.status === 'completed').length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div role="group" aria-label="Staff dashboard sections" className="flex items-center gap-2 overflow-x-auto border-b border-[#D8C9A7]/40 pb-3">
        <button
          onClick={() => setActiveTab('today')}
          className={`min-h-11 shrink-0 whitespace-nowrap px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'today'
              ? 'bg-[#26352A] text-white shadow-xs'
              : 'text-gray-600 hover:bg-[#E3E9DF]'
          }`}
        >
          Today's Queue ({todayAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`min-h-11 shrink-0 whitespace-nowrap px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-[#26352A] text-white shadow-xs'
              : 'text-gray-600 hover:bg-[#E3E9DF]'
          }`}
        >
          Upcoming Bookings ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`min-h-11 shrink-0 whitespace-nowrap px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'schedule'
              ? 'bg-[#26352A] text-white shadow-xs'
              : 'text-gray-600 hover:bg-[#E3E9DF]'
          }`}
        >
          My Working Schedule & Availability
        </button>
      </div>

      {/* TAB CONTENT: TODAY'S QUEUE */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {todayAppointments.length > 0 ? (
            todayAppointments.map((apt) => (
              <div
                key={apt.id}
                className={`bg-white rounded-2xl p-6 border transition-all shadow-xs space-y-4 ${
                  apt.status === 'in_progress'
                    ? 'border-purple-300 ring-2 ring-purple-100'
                    : apt.status === 'checked_in'
                    ? 'border-blue-300 ring-2 ring-blue-50'
                    : 'border-[#D8C9A7]/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold bg-[#E3E9DF] text-[#26352A] px-2.5 py-1 rounded">
                      {apt.bookingReference}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        apt.status === 'in_progress'
                          ? 'bg-purple-100 text-purple-800'
                          : apt.status === 'checked_in'
                          ? 'bg-blue-100 text-blue-800'
                          : apt.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {apt.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-bold text-[#26352A]">
                    <Clock className="w-4 h-4 text-[#A8B7A0]" />
                    <span>
                      {formatTime12Hour(apt.startTime)} – {formatTime12Hour(apt.endTime)} (
                      {formatDuration(apt.totalDurationMinutes)})
                    </span>
                  </div>
                </div>

                {/* Customer and Services breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                      Client Contact
                    </span>
                    <p className="font-bold text-[#26352A] mt-0.5">{apt.customerName}</p>
                    <a
                      href={`tel:${apt.customerPhone}`}
                      className="text-gray-600 hover:text-[#26352A] flex items-center space-x-1 mt-0.5 font-medium"
                    >
                      <Phone className="w-3 h-3 text-[#76603F]" />
                      <span>+91 {apt.customerPhone}</span>
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                      Assigned Services
                    </span>
                    <p className="font-bold text-[#26352A] mt-0.5">
                      {apt.services.map((s) => s.name).join(', ')}
                    </p>
                    {apt.notes && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded mt-1 border border-amber-200">
                        <strong>Note:</strong> {apt.notes}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                      Billing Amount
                    </span>
                    <p className="font-bold text-base text-[#26352A] mt-0.5">
                      {formatINR(apt.totalPrice)}
                    </p>
                    <p className="text-[10px] text-gray-400 capitalize">
                      {apt.paymentStatus ? `Status: ${apt.paymentStatus}` : 'Pay at salon'}
                    </p>
                  </div>
                </div>

                {/* Progress Control Actions */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
                  {apt.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(apt.id, 'checked_in')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      Mark Checked In
                    </button>
                  )}

                  {(apt.status === 'confirmed' || apt.status === 'checked_in') && (
                    <button
                      onClick={() => handleStatusUpdate(apt.id, 'in_progress')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition-colors shadow-xs flex items-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Treatment</span>
                    </button>
                  )}

                  {apt.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusUpdate(apt.id, 'completed')}
                      className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Finish & Complete</span>
                    </button>
                  )}

                  {apt.status === 'completed' && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Treatment Finished</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-[#D8C9A7] space-y-2">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="font-bold text-sm text-[#26352A]">No appointments booked for today</p>
              <p className="text-xs text-gray-500">
                You are currently free. New customer bookings will automatically appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: UPCOMING BOOKINGS */}
      {activeTab === 'upcoming' && (
        <div className="space-y-3">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-xl p-4 border border-[#D8C9A7]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[#26352A]">{apt.bookingReference}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Confirmed
                    </span>
                  </div>
                  <p className="font-bold text-[#26352A] mt-1">
                    {formatDateWithWeekday(apt.appointmentDate)} at {formatTime12Hour(apt.startTime)}
                  </p>
                  <p className="text-gray-500">
                    {apt.customerName} • {apt.services.map((s) => s.name).join(', ')}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-[#26352A]">{formatINR(apt.totalPrice)}</span>
                  <p className="text-[11px] text-gray-400">
                    {formatDuration(apt.totalDurationMinutes)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-[#D8C9A7] text-xs text-gray-500">
              No future appointments assigned yet.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SCHEDULE & AVAILABILITY */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl p-6 border border-[#D8C9A7]/40 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#26352A]">
              Working Schedule & Availability
            </h3>
            <p className="text-xs text-gray-500">
              Your shifts configured at The Oasis, 2nd Floor, Providence Plaza, Puttur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-[#F5F1E8] rounded-xl space-y-2">
              <h4 className="font-bold text-[#26352A] uppercase tracking-wider text-[11px]">
                Daily Duty Timings
              </h4>
              <p className="text-base font-bold text-[#26352A]">
                {formatTime12Hour(currentStaff.startTime || '09:00')} –{' '}
                {formatTime12Hour(currentStaff.endTime || '20:30')}
              </p>
              <p className="text-gray-500">
                Covers morning styling and evening peak rush appointments.
              </p>
            </div>

            <div className="p-4 bg-[#F5F1E8] rounded-xl space-y-2">
              <h4 className="font-bold text-[#26352A] uppercase tracking-wider text-[11px]">
                Specialties & Masteries
              </h4>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {currentStaff.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="bg-white text-[#26352A] border border-[#D8C9A7]/60 text-[11px] px-2 py-0.5 rounded-md font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
