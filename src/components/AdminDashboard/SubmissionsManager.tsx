import React, { useState } from 'react';
import { 
  Inbox, 
  Calendar, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Dog,
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Briefcase, 
  User, 
  Home, 
  Baby, 
  Sparkles,
  Filter,
  FileText
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { BookingSubmission, ContactInquiry, EmergencySubmission, BookingStatus, EmergencyStatus } from '../../types';

export const SubmissionsManager: React.FC = () => {
  const { 
    bookings, 
    updateBookingStatus, 
    deleteBooking,
    emergencyRequests,
    updateEmergencyStatus,
    deleteEmergencyRequest,
    contactInquiries
  } = useContent();

  const [activeTab, setActiveTab] = useState<'bookings' | 'emergency' | 'contacts'>('bookings');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Selected submission for full detail modal
  const [selectedBooking, setSelectedBooking] = useState<BookingSubmission | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencySubmission | null>(null);

  // Edit notes state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  // Counters
  const newBookingsCount = bookings.filter(b => b.status === 'New').length;
  const pendingEmergencyCount = emergencyRequests.filter(e => e.status === 'Pending Dispatch').length;
  const newContactCount = contactInquiries.filter(inquiry => inquiry.status === 'New').length;

  // Filtered lists
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      b.parentName.toLowerCase().includes(q) || 
      b.phone.toLowerCase().includes(q) || 
      b.email.toLowerCase().includes(q) ||
      b.estate.toLowerCase().includes(q) ||
      (b.nannyName && b.nannyName.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const filteredEmergency = emergencyRequests.filter(e => {
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      e.parentName.toLowerCase().includes(q) || 
      e.phone.toLowerCase().includes(q) || 
      e.estate.toLowerCase().includes(q) ||
      (e.requestedRole && e.requestedRole.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const filteredContacts = contactInquiries.filter(inquiry => {
    const matchesStatus = statusFilter === 'All' || inquiry.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || inquiry.name.toLowerCase().includes(q) || inquiry.phone.toLowerCase().includes(q) || inquiry.email.toLowerCase().includes(q) || inquiry.message.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const exportCSV = () => {
    if (activeTab === 'bookings') {
      const headers = ['ID', 'Date', 'Status', 'Parent Name', 'Phone', 'Email', 'Estate', 'Role', 'Selected Staff', 'Trial Days', 'Children', 'Notes'];
      const rows = bookings.map(b => [
        b.id,
        b.submittedAt,
        b.status,
        `"${b.parentName.replace(/"/g, '""')}"`,
        b.phone,
        b.email,
        b.estate,
        b.role || 'nanny',
        `"${(b.nannyName || '').replace(/"/g, '""')}"`,
        b.preferredTrialDays,
        b.numberOfChildren,
        `"${(b.additionalNotes || '').replace(/"/g, '""')}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `mommycare-trial-bookings-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'emergency') {
      const headers = ['ID', 'Date', 'Status', 'Parent Name', 'Phone', 'Estate', 'Requested Role', 'Required Time', 'Days', 'Notes'];
      const rows = emergencyRequests.map(e => [
        e.id,
        e.submittedAt,
        e.status,
        `"${e.parentName.replace(/"/g, '""')}"`,
        e.phone,
        e.estate,
        e.requestedRole || 'nanny',
        `"${e.requiredTime}"`,
        e.durationDays,
        `"${(e.urgentNotes || '').replace(/"/g, '""')}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `mommycare-emergency-dispatches-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['ID', 'Date', 'Status', 'Name', 'Phone', 'Email', 'Message'];
      const rows = contactInquiries.map(inquiry => [inquiry.id, inquiry.submittedAt, inquiry.status, `"${inquiry.name.replace(/"/g, '""')}"`, inquiry.phone, inquiry.email, `"${inquiry.message.replace(/"/g, '""')}"`]);
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(`data:text/csv;charset=utf-8,${[headers.join(','), ...rows.map(row => row.join(','))].join('\n')}`));
      link.setAttribute('download', `mommycare-contact-inquiries-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
      case 'Pending Dispatch':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse';
      case 'Contacted':
      case 'Staff Contacted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Trial Scheduled':
      case 'Dispatched':
        return 'bg-purple-100 text-purple-800 border-purple-200 font-bold';
      case 'Completed':
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-['Outfit'] text-[#1A201C] flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[#D96B43]" />
            <span>Form Submissions & Client Inquiries</span>
          </h2>
          <p className="text-xs text-[#635E59] mt-0.5">
            Real-time submissions from Nairobi parents requesting 3-Day Trials and Emergency Backup Dispatches.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#D5C9BA] hover:bg-[#FAF7F2] text-[#1A201C] text-xs font-bold rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#1D432D]" />
          <span>Export {activeTab === 'bookings' ? 'Bookings' : activeTab === 'emergency' ? 'Emergency' : 'Contact inquiries'} to CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E8DFD3] pb-1">
        <button
          onClick={() => {
            setActiveTab('bookings');
            setStatusFilter('All');
          }}
          className={`flex items-center gap-2 pb-2.5 px-2 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'bookings'
              ? 'border-[#D96B43] text-[#D96B43]'
              : 'border-transparent text-[#7D766D] hover:text-[#1A201C]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>3-Day Trial Bookings</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            newBookingsCount > 0 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {bookings.length} ({newBookingsCount} new)
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('contacts'); setStatusFilter('All'); }}
          className={`flex items-center gap-2 pb-2.5 px-2 font-bold text-sm border-b-2 transition-all ${activeTab === 'contacts' ? 'border-[#D96B43] text-[#D96B43]' : 'border-transparent text-[#7D766D] hover:text-[#1A201C]'}`}
        >
          <Mail className="w-4 h-4 text-[#1D432D]" />
          <span>Contact Enquiries</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${newContactCount > 0 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{contactInquiries.length} ({newContactCount} new)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('emergency');
            setStatusFilter('All');
          }}
          className={`flex items-center gap-2 pb-2.5 px-2 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'emergency'
              ? 'border-[#D96B43] text-[#D96B43]'
              : 'border-transparent text-[#7D766D] hover:text-[#1A201C]'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-[#D96B43]" />
          <span>Emergency 2-4h Dispatches</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            pendingEmergencyCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700'
          }`}>
            {emergencyRequests.length} ({pendingEmergencyCount} pending)
          </span>
        </button>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D766D]" />
          <input
            type="text"
            placeholder="Search parent name, phone, or estate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E8DFD3] rounded-xl focus:ring-2 focus:ring-[#D96B43] text-[#1A201C]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-[#7D766D]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#E8DFD3] rounded-xl text-xs font-semibold text-[#1A201C]"
          >
            <option value="All">All Statuses</option>
            {activeTab === 'bookings' ? (
              <>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Trial Scheduled">Trial Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </>
            ) : activeTab === 'emergency' ? (
              <>
                <option value="Pending Dispatch">Pending Dispatch</option>
                <option value="Staff Contacted">Staff Contacted</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Resolved">Resolved</option>
                <option value="Archived">Archived</option>
              </>
            ) : (<><option value="New">New</option><option value="Contacted">Contacted</option><option value="Resolved">Resolved</option><option value="Archived">Archived</option></>)}
          </select>
        </div>
      </div>

      {/* TAB 1: BOOKINGS LIST */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {filteredBookings.map(b => (
            <div 
              key={b.id}
              className="bg-white rounded-2xl border border-[#E8DFD3] p-4 sm:p-5 shadow-sm hover:border-[#D96B43]/50 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2ECE1] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] flex items-center justify-center text-[#1D432D] font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1A201C]">{b.parentName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#7D766D]">
                      Submitted on: {new Date(b.submittedAt).toLocaleDateString()} at {new Date(b.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7D766D]">Update Status:</span>
                  <select
                    value={b.status}
                    onChange={(e) => updateBookingStatus(b.id, e.target.value as BookingStatus)}
                    className="px-2.5 py-1 bg-[#FAF7F2] border border-[#D5C9BA] rounded-lg text-xs font-bold text-[#1A201C]"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Trial Scheduled">Trial Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3]">
                  <span className="text-[10px] uppercase font-bold text-[#7D766D] block">Contact Info</span>
                  <div className="space-y-1 mt-1 font-semibold text-[#1A201C]">
                    <a href={`tel:${b.phone}`} className="flex items-center gap-1.5 hover:text-[#D96B43]">
                      <Phone className="w-3.5 h-3.5 text-[#1D432D]" />
                      <span>{b.phone}</span>
                    </a>
                    <a href={`mailto:${b.email}`} className="flex items-center gap-1.5 hover:text-[#D96B43] truncate">
                      <Mail className="w-3.5 h-3.5 text-[#1D432D]" />
                      <span className="truncate">{b.email}</span>
                    </a>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3]">
                  <span className="text-[10px] uppercase font-bold text-[#7D766D] block">Location & Residence</span>
                  <div className="mt-1 font-semibold text-[#1A201C]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D96B43]" />
                      <span>{b.estate} ({b.residenceType || 'Apartment'})</span>
                    </div>
                    <p className="text-[11px] text-[#635E59] truncate mt-0.5">{b.residenceDetails || 'Address on file'}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3]">
                  <span className="text-[10px] uppercase font-bold text-[#7D766D] block">Requested Staff & Trial</span>
                  <div className="mt-1 font-semibold text-[#1A201C]">
                    <p className="capitalize">Role: {b.role || 'nanny'}</p>
                    <p className="text-[#D96B43] font-bold">
                      {b.nannyName ? `Staff: ${b.nannyName}` : 'General Placement'}
                    </p>
                    <span className="text-[11px] text-[#7D766D]">{b.preferredTrialDays} Days Trial • Starts: {b.startDate || 'Immediate'}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3]">
                  <span className="text-[10px] uppercase font-bold text-[#7D766D] block">Household Needs</span>
                  <div className="mt-1 space-y-0.5 text-[11px] text-[#524D47]">
                    <p>Children: <strong>{b.numberOfChildren}</strong> ({b.childrenAges || 'Not specified'})</p>
                    <p className="flex items-center gap-1.5">
                      Cooking:
                      {b.needsCooking ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-label="Yes" /> : <XCircle className="w-3.5 h-3.5 text-red-500" aria-label="No" />}
                      <span>• Pets:</span>
                      {b.needsPetFriendly ? <><Dog className="w-3.5 h-3.5 text-[#1D432D]" aria-label="Pet friendly" /> Yes</> : <span>None</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional & Internal Notes */}
              {b.additionalNotes && (
                <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD3] text-xs">
                  <span className="font-bold text-[#7D766D] text-[10px] uppercase block">Parent's Special Instructions:</span>
                  <p className="text-[#3D3A36] mt-0.5 italic">“{b.additionalNotes}”</p>
                </div>
              )}

              {/* Internal Coordinator Note Editor */}
              <div className="p-2.5 rounded-xl bg-[#FFFDF9] border border-amber-200/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1 w-full">
                  <span className="font-bold text-amber-800 text-[10px] uppercase flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Internal Agency Note:
                  </span>
                  {editingNotesId === b.id ? (
                    <div className="flex gap-2 mt-1 w-full">
                      <input
                        type="text"
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border border-amber-300 rounded text-xs"
                      />
                      <button
                        onClick={() => {
                          updateBookingStatus(b.id, b.status, notesDraft);
                          setEditingNotesId(null);
                        }}
                        className="px-2.5 py-1 bg-amber-600 text-white rounded text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="text-[#524D47] mt-0.5">{b.internalNotes || 'No notes added yet.'}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {editingNotesId !== b.id && (
                    <button
                      onClick={() => {
                        setEditingNotesId(b.id);
                        setNotesDraft(b.internalNotes || '');
                      }}
                      className="text-[11px] font-bold text-amber-700 hover:underline"
                    >
                      Edit Note
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Delete booking record for ${b.parentName}?`)) {
                        deleteBooking(b.id);
                      }
                    }}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}

          {filteredBookings.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#D5C9BA]">
              <Inbox className="w-10 h-10 text-[#D5C9BA] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#1A201C]">No booking submissions found</p>
              <p className="text-xs text-[#7D766D] mt-1">Check back once parents submit 3-Day Trial forms on the website.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EMERGENCY STANDBY DISPATCHES */}
      {activeTab === 'emergency' && (
        <div className="space-y-4">
          {filteredEmergency.map(e => (
            <div 
              key={e.id}
              className="bg-white rounded-2xl border-2 border-red-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-bold">
                    <AlertCircle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1A201C]">{e.parentName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getStatusBadge(e.status)}`}>
                        {e.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-bold">
                        Urgent Relief
                      </span>
                    </div>
                    <span className="text-[11px] text-[#7D766D]">
                      Received: {new Date(e.submittedAt).toLocaleDateString()} at {new Date(e.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7D766D]">Dispatch Status:</span>
                  <select
                    value={e.status}
                    onChange={(evt) => updateEmergencyStatus(e.id, evt.target.value as EmergencyStatus)}
                    className="px-2.5 py-1 bg-red-50 border border-red-300 rounded-lg text-xs font-bold text-red-900"
                  >
                    <option value="Pending Dispatch">Pending Dispatch</option>
                    <option value="Staff Contacted">Staff Contacted</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FFF8F5] border border-red-200">
                  <span className="text-[10px] uppercase font-bold text-red-800 block">Emergency Contact</span>
                  <div className="mt-1 font-bold text-red-900">
                    <a href={`tel:${e.phone}`} className="flex items-center gap-1.5 hover:underline">
                      <Phone className="w-3.5 h-3.5 text-red-600" />
                      <span>{e.phone}</span>
                    </a>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3]">
                  <span className="text-[10px] uppercase font-bold text-[#7D766D] block">Estate & Timing</span>
                  <div className="mt-1 font-semibold text-[#1A201C]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D96B43]" />
                      <span>{e.estate}</span>
                    </div>
                    <p className="text-[11px] text-[#D96B43] font-bold mt-0.5">{e.requiredTime}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3]">
                  <span className="text-[10px] uppercase font-bold text-[#7D766D] block">Requested Relief Role</span>
                  <div className="mt-1 font-semibold text-[#1A201C]">
                    <p className="capitalize text-sm font-bold text-[#1D432D]">{e.requestedRole || 'nanny'}</p>
                    <span className="text-[11px] text-[#7D766D]">Coverage: {e.durationDays} Days</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3]">
                  <span className="text-[10px] uppercase font-bold text-[#7D766D] block">Assigned Candidate</span>
                  <div className="mt-1 font-semibold text-[#1A201C]">
                    <p className="text-emerald-700 font-bold">{e.assignedStaffName || 'Not yet dispatched'}</p>
                  </div>
                </div>
              </div>

              {/* Urgent Instructions */}
              {e.urgentNotes && (
                <div className="p-2.5 rounded-xl bg-[#FFF8F5] border border-[#FAD9CE] text-xs">
                  <span className="font-bold text-[#8C3419] text-[10px] uppercase block">Urgent Household Instructions:</span>
                  <p className="text-[#8C3419] mt-0.5 font-medium">“{e.urgentNotes}”</p>
                </div>
              )}

              {/* Actions & Delete */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <a
                  href={`tel:${e.phone}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Parent Now ({e.phone})</span>
                </a>

                <button
                  onClick={() => {
                    if (confirm(`Delete emergency dispatch record for ${e.parentName}?`)) {
                      deleteEmergencyRequest(e.id);
                    }
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700"
                  title="Delete emergency record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}

          {filteredEmergency.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#D5C9BA]">
              <AlertCircle className="w-10 h-10 text-[#D5C9BA] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#1A201C]">No emergency dispatches currently in queue</p>
              <p className="text-xs text-[#7D766D] mt-1">Standby coordinators will receive instantaneous alerts when urgent relief requests arrive.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-4">
          {filteredContacts.map((inquiry: ContactInquiry) => (
            <article key={inquiry.id} className="rounded-2xl border border-[#E8DFD3] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 border-b border-[#F2ECE1] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8DFD3] bg-[#FAF0EB] text-[#D96B43]"><Mail className="h-5 w-5" /></div><div><div className="flex items-center gap-2"><span className="text-sm font-bold text-[#1A201C]">{inquiry.name}</span><span className={`rounded-full border px-2 py-0.5 text-[10px] ${getStatusBadge(inquiry.status)}`}>{inquiry.status}</span></div><p className="text-[11px] text-[#7D766D]">Submitted {new Date(inquiry.submittedAt).toLocaleDateString()} at {new Date(inquiry.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div></div>
                <div className="flex gap-2"><a href={`tel:${inquiry.phone}`} className="rounded-lg bg-[#1D432D] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#143020]">Call</a><a href={`mailto:${inquiry.email}`} className="rounded-lg border border-[#D5C9BA] px-3 py-1.5 text-xs font-bold text-[#1A201C] hover:bg-[#FAF7F2]">Email</a></div>
              </div>
              <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2"><div className="rounded-xl border border-[#E8DFD3] bg-[#FAF7F2] p-3"><p className="text-[10px] font-bold uppercase text-[#7D766D]">Contact details</p><p className="mt-1 font-semibold text-[#1A201C]">{inquiry.phone}</p><p className="mt-1 break-all text-[#635E59]">{inquiry.email}</p></div><div className="rounded-xl border border-[#E8DFD3] bg-[#FAF7F2] p-3"><p className="text-[10px] font-bold uppercase text-[#7D766D]">Message</p><p className="mt-1 whitespace-pre-wrap leading-relaxed text-[#3D3A36]">{inquiry.message}</p></div></div>
            </article>
          ))}
          {filteredContacts.length === 0 && <div className="rounded-2xl border border-dashed border-[#D5C9BA] bg-white p-12 text-center"><Mail className="mx-auto mb-2 h-10 w-10 text-[#D5C9BA]" /><p className="text-sm font-bold text-[#1A201C]">No contact enquiries found</p><p className="mt-1 text-xs text-[#7D766D]">New messages from the contact page will appear here.</p></div>}
        </div>
      )}

    </div>
  );
};
