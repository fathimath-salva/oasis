import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Clock,
  CreditCard,
  BarChart3,
  History,
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  TrendingUp,
} from 'lucide-react';
import { db } from '../lib/db';
import type {
  Appointment,
  SalonService,
  StaffMember,
  SalonBusinessHours,
  SalonHoliday,
  PaymentRecord,
  AuditLog,
  AppointmentStatus,
  ServiceCategory,
} from '../types/salon';
import { formatINR, formatDuration, formatTime12Hour, formatDateIndian } from '../lib/formatters';
import { SERVICE_CATEGORIES } from '../constants/salonData';

type AdminTab =
  | 'overview'
  | 'appointments'
  | 'services'
  | 'staff'
  | 'customers'
  | 'hours'
  | 'payments'
  | 'reports'
  | 'audit';

export const AdminDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');

  // Live state from db
  const [appointments, setAppointments] = useState<Appointment[]>(() => db.getAppointments());
  const [services, setServices] = useState<SalonService[]>(() => db.getServices());
  const [staffList, setStaffList] = useState<StaffMember[]>(() => db.getStaff());
  const [businessHours, setBusinessHours] = useState<SalonBusinessHours[]>(() => db.getBusinessHours());
  const [holidays, setHolidays] = useState<SalonHoliday[]>(() => db.getHolidays());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => db.getPayments());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => db.getAuditLogs());

  const refreshAll = () => {
    setAppointments(db.getAppointments());
    setServices(db.getServices());
    setStaffList(db.getStaff());
    setBusinessHours(db.getBusinessHours());
    setHolidays(db.getHolidays());
    setPayments(db.getPayments());
    setAuditLogs(db.getAuditLogs());
  };

  // Search & filter states
  const [aptSearch, setAptSearch] = useState('');
  const [aptStatusFilter, setAptStatusFilter] = useState<string>('all');

  // Modals
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<SalonService | null>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedAptForPayment, setSelectedAptForPayment] = useState<Appointment | null>(null);
  const [payMethod, setPayMethod] = useState<'cash' | 'upi' | 'card'>('upi');
  const [upiRefId, setUpiRefId] = useState('');

  const [holidayTitle, setHolidayTitle] = useState('');
  const [holidayDate, setHolidayDate] = useState('');

  // --------------------------------------------------------------------------
  // COMPUTED METRICS
  // --------------------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];

  const todayAppointments = useMemo(
    () => appointments.filter((a) => a.appointmentDate === todayStr),
    [appointments, todayStr]
  );

  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.appointmentDate > todayStr && a.status !== 'cancelled'),
    [appointments, todayStr]
  );

  const pendingAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'pending'),
    [appointments]
  );

  const completedAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'completed'),
    [appointments]
  );

  const cancelledAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'cancelled' || a.status === 'no_show'),
    [appointments]
  );

  const totalRevenue = useMemo(
    () => payments.reduce((sum, p) => sum + (p.paymentStatus === 'completed' ? p.amount : 0), 0),
    [payments]
  );

  // Popular services calculation
  const popularServices = useMemo(() => {
    const counts: Record<string, { name: string; count: number; revenue: number }> = {};
    appointments.forEach((a) => {
      a.services.forEach((s) => {
        if (!counts[s.name]) {
          counts[s.name] = { name: s.name, count: 0, revenue: 0 };
        }
        counts[s.name].count += 1;
        counts[s.name].revenue += s.price;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [appointments]);

  // Unique customers CRM aggregation
  const customerList = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; email: string; visits: number; totalSpent: number; lastDate: string }>();

    appointments.forEach((a) => {
      const key = a.customerPhone || a.customerEmail;
      if (!map.has(key)) {
        map.set(key, {
          name: a.customerName,
          phone: a.customerPhone,
          email: a.customerEmail,
          visits: 0,
          totalSpent: 0,
          lastDate: a.appointmentDate,
        });
      }
      const existing = map.get(key)!;
      existing.visits += 1;
      existing.totalSpent += a.totalPrice;
      if (a.appointmentDate > existing.lastDate) {
        existing.lastDate = a.appointmentDate;
      }
    });

    return Array.from(map.values());
  }, [appointments]);

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------
  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    db.updateAppointmentStatus(id, status, 'Admin');
    refreshAll();
  };

  const handleSaveService = (serviceData: Partial<SalonService>) => {
    if (editingService) {
      db.updateService(editingService.id, serviceData);
    } else {
      db.createService({
        name: serviceData.name || 'New Service',
        category: (serviceData.category as ServiceCategory) || 'Haircutting and hairstyling',
        gender: serviceData.gender || 'unisex',
        description: serviceData.description || '',
        price: Number(serviceData.price) || 0,
        priceConfirmed: Boolean(serviceData.priceConfirmed),
        durationMinutes: Number(serviceData.durationMinutes) || 45,
        isActive: true,
        imageUrl: serviceData.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      });
    }
    setServiceModalOpen(false);
    setEditingService(null);
    refreshAll();
  };

  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      db.deleteService(id);
      refreshAll();
    }
  };

  const handleToggleServiceActive = (service: SalonService) => {
    db.updateService(service.id, { isActive: !service.isActive });
    refreshAll();
  };

  const handleRecordPayment = () => {
    if (!selectedAptForPayment) return;

    db.recordPayment({
      appointmentId: selectedAptForPayment.id,
      bookingReference: selectedAptForPayment.bookingReference,
      customerName: selectedAptForPayment.customerName,
      amount: selectedAptForPayment.totalPrice,
      paymentMethod: payMethod,
      paymentStatus: 'completed',
      upiTransactionId: payMethod === 'upi' ? (upiRefId || 'UPI-OASIS-' + Math.floor(100000 + Math.random() * 900000)) : undefined,
      recordedBy: 'Admin (Director)',
      notes: `Recorded at salon reception for ${selectedAptForPayment.services.map((s) => s.name).join(', ')}`,
    });

    setPaymentModalOpen(false);
    setSelectedAptForPayment(null);
    setUpiRefId('');
    refreshAll();
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate || !holidayTitle) return;
    db.addHoliday({
      date: holidayDate,
      title: holidayTitle,
      description: 'Scheduled salon closure',
    });
    setHolidayDate('');
    setHolidayTitle('');
    refreshAll();
  };

  const handleDeleteHoliday = (id: string) => {
    db.deleteHoliday(id);
    refreshAll();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Booking Reference,Customer Name,Phone,Email,Date,Start Time,End Time,Specialist,Services,Amount,Status,Payment Status'];
    const rows = appointments.map((a) =>
      [
        a.bookingReference,
        `"${a.customerName}"`,
        a.customerPhone,
        a.customerEmail,
        a.appointmentDate,
        a.startTime,
        a.endTime,
        `"${a.staffName || 'Specialist'}"`,
        `"${a.services.map((s) => s.name).join('; ')}"`,
        a.totalPrice,
        a.status,
        a.paymentStatus || 'pending',
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `the_oasis_appointments_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="bg-[#26352A] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#D8C9A7]/30">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D8C9A7] text-[#26352A] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
              Director Administration
            </span>
            <span className="text-xs text-[#E3E9DF]/80">Providence Plaza, Puttur</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-1">Salon Operations Control</h1>
          <p className="text-xs text-[#E3E9DF]/80">
            Real-time control of appointments, pricing, staff rosters, payments, and auditing.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#344839] hover:bg-[#D8C9A7] hover:text-[#26352A] text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={refreshAll}
            className="px-4 py-2 bg-[#E3E9DF] text-[#26352A] rounded-xl text-xs font-semibold hover:bg-white transition-all shadow-sm"
          >
            Sync DB
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center space-x-1 bg-white p-1.5 rounded-2xl shadow-xs border border-[#D8C9A7]/40 overflow-x-auto scrollbar-thin">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'appointments', label: `Appointments (${appointments.length})`, icon: Calendar },
          { id: 'services', label: `Services & Pricing (${services.length})`, icon: Scissors },
          { id: 'staff', label: `Staff (${staffList.length})`, icon: Users },
          { id: 'customers', label: `Customers (${customerList.length})`, icon: Users },
          { id: 'payments', label: `Billing & UPI (₹${totalRevenue.toLocaleString('en-IN')})`, icon: CreditCard },
          { id: 'hours', label: 'Hours & Holidays', icon: Clock },
          { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
          { id: 'audit', label: 'Audit Trail', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as AdminTab)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentTab === tab.id
                  ? 'bg-[#26352A] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-[#E3E9DF]/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 1. OVERVIEW TAB */}
      {/* -------------------------------------------------------------------- */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
                Total Recorded Revenue
              </span>
              <p className="font-serif text-3xl font-bold text-[#26352A]">
                {formatINR(totalRevenue)}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">From verified payments</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
                Today's Bookings
              </span>
              <p className="font-serif text-3xl font-bold text-[#26352A]">
                {todayAppointments.length}
              </p>
              <span className="text-[10px] text-gray-500 font-medium">Scheduled for today</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-blue-500 font-semibold block">
                Upcoming Sessions
              </span>
              <p className="font-serif text-3xl font-bold text-blue-800">
                {upcomingAppointments.length}
              </p>
              <span className="text-[10px] text-gray-500 font-medium">Future confirmed</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-red-500 font-semibold block">
                Cancellations / No Show
              </span>
              <p className="font-serif text-3xl font-bold text-red-700">
                {cancelledAppointments.length}
              </p>
              <span className="text-[10px] text-gray-500 font-medium">Total cancelled records</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Schedule Live Feed */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#D8C9A7]/40 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-serif text-lg font-bold text-[#26352A]">
                  Today's Live Queue ({todayAppointments.length})
                </h3>
                <button
                  onClick={() => setCurrentTab('appointments')}
                  className="text-xs font-semibold text-[#76603F] hover:underline"
                >
                  View All Appointments
                </button>
              </div>

              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3.5 rounded-xl border border-gray-100 bg-[#F5F1E8]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[#26352A]">
                            {apt.bookingReference}
                          </span>
                          <span className="bg-[#26352A] text-white text-[10px] px-2 py-0.5 rounded-full font-medium capitalize">
                            {apt.status}
                          </span>
                        </div>
                        <p className="font-bold text-[#26352A] mt-1">
                          {apt.customerName} ({apt.customerPhone})
                        </p>
                        <p className="text-gray-500">
                          {apt.services.map((s) => s.name).join(', ')} • Specialist:{' '}
                          {apt.staffName || 'Oasis Stylist'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-sm text-[#26352A]">
                          {formatTime12Hour(apt.startTime)}
                        </span>
                        <p className="font-bold text-[#26352A] mt-0.5">{formatINR(apt.totalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-gray-500">
                  No appointments booked for today yet.
                </div>
              )}
            </div>

            {/* Popular Services Ranking */}
            <div className="bg-white rounded-2xl p-6 border border-[#D8C9A7]/40 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-serif text-lg font-bold text-[#26352A]">Most Booked Services</h3>
                <TrendingUp className="w-4 h-4 text-[#A8B7A0]" />
              </div>

              <div className="space-y-3">
                {popularServices.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <span className="w-5 h-5 rounded-full bg-[#E3E9DF] flex items-center justify-center font-bold text-[10px] text-[#26352A] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-[#26352A] truncate">{item.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-[#26352A]">{item.count} bookings</span>
                      <p className="text-[10px] text-gray-400">{formatINR(item.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 2. APPOINTMENTS TAB */}
      {/* -------------------------------------------------------------------- */}
      {currentTab === 'appointments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-[#D8C9A7]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reference, client name, phone..."
                value={aptSearch}
                onChange={(e) => setAptSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={aptStatusFilter}
                onChange={(e) => setAptStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-[#26352A] text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-2xl border border-[#D8C9A7]/40 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F1E8] border-b border-[#D8C9A7]/40 text-[#26352A] uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">Ref ID</th>
                    <th className="p-3.5">Client</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Services</th>
                    <th className="p-3.5">Specialist</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments
                    .filter((a) => {
                      if (aptStatusFilter !== 'all' && a.status !== aptStatusFilter) return false;
                      if (aptSearch) {
                        const q = aptSearch.toLowerCase();
                        return (
                          a.bookingReference.toLowerCase().includes(q) ||
                          a.customerName.toLowerCase().includes(q) ||
                          a.customerPhone.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((apt) => (
                      <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#26352A]">
                          {apt.bookingReference}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-[#26352A]">{apt.customerName}</p>
                          <p className="text-gray-400 text-[11px]">{apt.customerPhone}</p>
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-gray-800">{formatDateIndian(apt.appointmentDate)}</p>
                          <p className="text-gray-400 text-[11px]">{formatTime12Hour(apt.startTime)}</p>
                        </td>
                        <td className="p-3.5 max-w-xs truncate">
                          {apt.services.map((s) => s.name).join(', ')}
                        </td>
                        <td className="p-3.5 text-gray-600 font-medium">
                          {apt.staffName || 'Specialist'}
                        </td>
                        <td className="p-3.5 font-bold text-[#26352A]">
                          {formatINR(apt.totalPrice)}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={apt.status}
                            onChange={(e) => handleUpdateStatus(apt.id, e.target.value as AppointmentStatus)}
                            className="text-[11px] font-semibold border rounded-lg px-2 py-1 bg-white capitalize"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="checked_in">Checked In</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no_show">No Show</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          {apt.paymentStatus === 'completed' ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Paid ({apt.paymentMethod || 'UPI'})
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedAptForPayment(apt);
                                setPaymentModalOpen(true);
                              }}
                              className="text-[10px] font-bold bg-[#E3E9DF] text-[#26352A] hover:bg-[#26352A] hover:text-white px-2 py-1 rounded transition-colors"
                            >
                              Record ₹
                            </button>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                            className="text-red-600 hover:text-red-800 font-medium text-xs"
                            title="Cancel appointment"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 3. SERVICES & PRICING TAB */}
      {/* -------------------------------------------------------------------- */}
      {currentTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#26352A]">
                Catalogue & Rate Card Management
              </h3>
              <p className="text-xs text-gray-500">
                Update prices in INR, modify durations, toggle active status, and review unconfirmed prices.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingService(null);
                setServiceModalOpen(true);
              }}
              className="px-4 py-2 bg-[#26352A] text-white rounded-xl text-xs font-semibold hover:bg-[#19231C] flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#76603F]">
                      {service.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          service.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {service.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-serif text-base font-bold text-[#26352A] mt-1">
                    {service.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 block">
                      {formatDuration(service.durationMinutes)}
                    </span>
                    <span className="font-bold text-base text-[#26352A]">
                      {formatINR(service.price)}
                    </span>
                    {!service.priceConfirmed && (
                      <span className="block text-[9px] text-amber-700 font-bold">
                        Awaiting Review
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setEditingService(service);
                        setServiceModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-gray-600 hover:bg-[#E3E9DF]"
                      title="Edit price & details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleServiceActive(service)}
                      className="p-1.5 rounded-lg text-gray-600 hover:bg-[#E3E9DF]"
                      title="Toggle active"
                    >
                      {service.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 4. STAFF TAB */}
      {/* -------------------------------------------------------------------- */}
      {currentTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#26352A]">Stylists & Specialists</h3>
              <p className="text-xs text-gray-500">
                Manage salon specialists, roster schedules, and service specialties.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffList.map((stf) => (
              <div
                key={stf.id}
                className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs flex items-start space-x-4"
              >
                <img
                  src={stf.avatarUrl}
                  alt={stf.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#D8C9A7]"
                />
                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#26352A]">{stf.name}</h4>
                      <p className="text-gray-500">{stf.title}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>

                  <p className="text-gray-600">
                    Phone: <strong>{stf.phone}</strong> • Shift: <strong>{stf.startTime} – {stf.endTime}</strong>
                  </p>

                  <div className="pt-2 flex flex-wrap gap-1">
                    {stf.specialties.map((s) => (
                      <span
                        key={s}
                        className="bg-[#E3E9DF]/80 text-[#26352A] text-[10px] px-2 py-0.5 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 5. CUSTOMERS CRM TAB */}
      {/* -------------------------------------------------------------------- */}
      {currentTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#26352A]">Customer CRM Directory</h3>
              <p className="text-xs text-gray-500">
                Track client visits, loyalty, contact information, and lifetime spend in INR.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D8C9A7]/40 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F1E8] border-b border-[#D8C9A7]/40 text-[#26352A] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Total Visits</th>
                  <th className="p-3.5">Lifetime Spend</th>
                  <th className="p-3.5">Last Appointment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customerList.map((c) => (
                  <tr key={c.phone + c.email} className="hover:bg-gray-50">
                    <td className="p-3.5 font-bold text-[#26352A]">{c.name}</td>
                    <td className="p-3.5 font-medium">{c.phone}</td>
                    <td className="p-3.5 text-gray-500">{c.email}</td>
                    <td className="p-3.5 font-bold text-[#26352A]">{c.visits} visit(s)</td>
                    <td className="p-3.5 font-bold text-emerald-800">{formatINR(c.totalSpent)}</td>
                    <td className="p-3.5 text-gray-500">{formatDateIndian(c.lastDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 6. PAYMENTS & UPI TAB */}
      {/* -------------------------------------------------------------------- */}
      {currentTab === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
                Total Collected
              </span>
              <p className="font-serif text-3xl font-bold text-emerald-800 mt-1">
                {formatINR(totalRevenue)}
              </p>
              <span className="text-[10px] text-gray-400">Cash & UPI at Puttur Salon</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
                Total Transactions
              </span>
              <p className="font-serif text-3xl font-bold text-[#26352A] mt-1">
                {payments.length}
              </p>
              <span className="text-[10px] text-gray-400">Recorded receipts</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8C9A7]/40 shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
                Supported Methods
              </span>
              <p className="font-serif text-base font-bold text-[#26352A] mt-1">
                Cash • UPI (GPay/PhonePe) • Card
              </p>
              <span className="text-[10px] text-gray-400">Recorded by reception staff</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D8C9A7]/40 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#26352A]">
                Recorded Payment Transactions
              </h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F1E8] border-b border-[#D8C9A7]/40 text-[#26352A] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5">Ref ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">UPI / Txn ID</th>
                  <th className="p-3.5">Recorded By</th>
                  <th className="p-3.5">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3.5 font-mono font-bold text-[#26352A]">{p.bookingReference}</td>
                    <td className="p-3.5 font-semibold text-[#26352A]">{p.customerName}</td>
                    <td className="p-3.5 font-bold text-emerald-800">{formatINR(p.amount)}</td>
                    <td className="p-3.5 uppercase font-semibold text-gray-700">{p.paymentMethod}</td>
                    <td className="p-3.5 font-mono text-gray-500">{p.upiTransactionId || '—'}</td>
                    <td className="p-3.5 text-gray-600">{p.recordedBy}</td>
                    <td className="p-3.5 text-gray-500">
                      {new Date(p.recordedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 7. HOURS & HOLIDAYS TAB */}
      {/* -------------------------------------------------------------------- */}
      {currentTab === 'hours' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Hours */}
          <div className="bg-white rounded-2xl p-6 border border-[#D8C9A7]/40 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#26352A]">Weekly Business Hours</h3>
            <div className="space-y-2 text-xs">
              {businessHours.map((h, i) => (
                <div key={h.dayOfWeek} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="font-bold text-[#26352A] w-24">{h.dayName}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={h.openTime}
                      onChange={(e) => {
                        const updated = [...businessHours];
                        updated[i].openTime = e.target.value;
                        setBusinessHours(updated);
                        db.updateBusinessHours(updated);
                      }}
                      className="border rounded px-2 py-1 text-xs"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={h.closeTime}
                      onChange={(e) => {
                        const updated = [...businessHours];
                        updated[i].closeTime = e.target.value;
                        setBusinessHours(updated);
                        db.updateBusinessHours(updated);
                      }}
                      className="border rounded px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salon Holidays & Closures */}
          <div className="bg-white rounded-2xl p-6 border border-[#D8C9A7]/40 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#26352A]">Holidays & Closures</h3>

            <form onSubmit={handleAddHoliday} className="space-y-3 bg-[#F5F1E8] p-4 rounded-xl text-xs">
              <span className="font-bold text-[#26352A] block">Add Salon Closure Date</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="p-2 border rounded-lg bg-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Holiday title / occasion"
                  value={holidayTitle}
                  onChange={(e) => setHolidayTitle(e.target.value)}
                  className="p-2 border rounded-lg bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#26352A] text-white rounded-lg font-semibold hover:bg-[#19231C]"
              >
                Add Closure Date
              </button>
            </form>

            <div className="space-y-2 text-xs">
              {holidays.map((h) => (
                <div key={h.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <span className="font-bold text-[#26352A]">{h.title}</span>
                    <p className="text-gray-400">{formatDateIndian(h.date)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteHoliday(h.id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 8. AUDIT LOGS TAB */}
      {/* -------------------------------------------------------------------- */}
      {currentTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#26352A]">System Audit Trail</h3>
              <p className="text-xs text-gray-500">
                Tamper-evident logs of administrative edits, price adjustments, and booking lifecycle events.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D8C9A7]/40 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F1E8] border-b border-[#D8C9A7]/40 text-[#26352A] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-3.5 text-gray-500">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-bold text-[#26352A]">{log.userName}</td>
                    <td className="p-3.5 font-bold text-blue-700">{log.action}</td>
                    <td className="p-3.5 uppercase text-gray-500">{log.entityType}</td>
                    <td className="p-3.5 font-sans text-xs text-gray-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 9. ANALYTICS & REPORTS TAB */}
      {/* -------------------------------------------------------------------- */}
      {currentTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#26352A]">Management Reports</h3>
              <p className="text-xs text-gray-500">
                Performance breakdown by category and appointment metrics.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-[#26352A] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#D8C9A7]/40 shadow-xs space-y-4">
              <h4 className="font-serif text-base font-bold text-[#26352A]">
                Revenue by Service Category
              </h4>
              <div className="space-y-2 text-xs">
                {SERVICE_CATEGORIES.map((cat) => {
                  const matchingApts = appointments.filter((a) =>
                    a.services.some((s) => s.category === cat)
                  );
                  const rev = matchingApts.reduce((sum, a) => sum + a.totalPrice, 0);
                  if (matchingApts.length === 0) return null;
                  return (
                    <div key={cat} className="flex justify-between items-center py-1.5 border-b border-gray-100">
                      <span className="font-medium text-gray-700">{cat}</span>
                      <span className="font-bold text-[#26352A]">{formatINR(rev)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#D8C9A7]/40 shadow-xs space-y-4">
              <h4 className="font-serif text-base font-bold text-[#26352A]">
                Appointment Status Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Completed Sessions</span>
                  <span className="font-bold text-emerald-700">{completedAppointments.length}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Upcoming Active Sessions</span>
                  <span className="font-bold text-blue-700">{upcomingAppointments.length}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Pending Confirmation</span>
                  <span className="font-bold text-amber-700">{pendingAppointments.length}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Cancelled / No Shows</span>
                  <span className="font-bold text-red-700">{cancelledAppointments.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE EDIT / CREATE MODAL */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D8C9A7] space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#26352A]">
                {editingService ? `Edit: ${editingService.name}` : 'Add New Salon Service'}
              </h3>
              <button
                onClick={() => setServiceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                handleSaveService({
                  name: formData.get('name') as string,
                  category: formData.get('category') as ServiceCategory,
                  gender: formData.get('gender') as 'men' | 'women' | 'unisex',
                  price: Number(formData.get('price')),
                  priceConfirmed: formData.get('priceConfirmed') === 'on',
                  durationMinutes: Number(formData.get('durationMinutes')),
                  description: formData.get('description') as string,
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Service Name *</label>
                <input
                  name="name"
                  required
                  defaultValue={editingService?.name || ''}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingService?.category || SERVICE_CATEGORIES[0]}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Gender</label>
                  <select
                    name="gender"
                    defaultValue={editingService?.gender || 'unisex'}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Price in INR (₹) *</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    required
                    defaultValue={editingService?.price || 500}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Duration (Minutes) *</label>
                  <input
                    name="durationMinutes"
                    type="number"
                    min="10"
                    step="5"
                    required
                    defaultValue={editingService?.durationMinutes || 45}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  name="priceConfirmed"
                  id="priceConfirmed"
                  defaultChecked={editingService ? editingService.priceConfirmed : true}
                  className="rounded border-gray-300"
                />
                <label htmlFor="priceConfirmed" className="text-xs text-gray-700">
                  Confirmed Salon Price (uncheck to flag for admin review)
                </label>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingService?.description || ''}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#26352A] text-white rounded-xl text-xs font-semibold hover:bg-[#19231C]"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {paymentModalOpen && selectedAptForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D8C9A7] space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-serif text-base font-bold text-[#26352A]">
                Record Salon Payment: {selectedAptForPayment.bookingReference}
              </h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#F5F1E8] p-3.5 rounded-xl text-xs space-y-1">
              <p>
                <strong>Client:</strong> {selectedAptForPayment.customerName}
              </p>
              <p>
                <strong>Total Due:</strong>{' '}
                <span className="text-base font-bold text-[#26352A]">
                  {formatINR(selectedAptForPayment.totalPrice)}
                </span>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['upi', 'cash', 'card'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPayMethod(method)}
                      className={`py-2 text-center rounded-lg border font-bold uppercase ${
                        payMethod === method
                          ? 'bg-[#26352A] text-white'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {payMethod === 'upi' && (
                <div>
                  <label className="block font-semibold mb-1">
                    UPI Transaction ID / UTR Ref Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-AXIS-915155-8932"
                    value={upiRefId}
                    onChange={(e) => setUpiRefId(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Leave blank to auto-generate verified salon transaction ID.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
              >
                Confirm Payment & Issue Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
