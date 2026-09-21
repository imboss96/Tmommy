import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Inbox, 
  Image as ImageIcon, 
  Settings, 
  ArrowLeft, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  Lock
  ,MessageSquareQuote
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { PostsManager } from './PostsManager';
import { StaffManager } from './StaffManager';
import { SubmissionsManager } from './SubmissionsManager';
import { MediaManager } from './MediaManager';
import { SettingsManager } from './SettingsManager';
import { ReviewsManager } from './ReviewsManager';
import { MommyCareLogo } from '../MommyCareLogo';

interface AdminDashboardProps {
  onBackToWebsite: () => void;
  onLockDashboard?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToWebsite, onLockDashboard }) => {
  const { 
    nannies, 
    insights, 
    bookings, 
    emergencyRequests, 
    mediaItems, 
    reviews,
    recentAlert, 
    dismissAlert 
  } = useContent();

  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'staff' | 'submissions' | 'media' | 'reviews' | 'settings'>('overview');

  const newBookings = bookings.filter(b => b.status === 'New');
  const pendingEmergency = emergencyRequests.filter(e => e.status === 'Pending Dispatch');
  const totalSubmissions = bookings.length + emergencyRequests.length;

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1A201C] font-['Plus_Jakarta_Sans'] flex flex-col">
      
      {/* Toast alert notification */}
      {recentAlert && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-200">
          <div className="bg-[#1D432D] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{recentAlert}</span>
            <button
              onClick={dismissAlert}
              className="text-white/70 hover:text-white ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <header className="bg-[#1D432D] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <MommyCareLogo 
              variant="icon" 
              colorScheme="white" 
              size="sm" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold font-['Outfit'] tracking-tight">MommyCare Operations</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Console
                </span>
              </div>
              <p className="text-[11px] text-white/70">Frontend content, staff roster & submissions management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToWebsite}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-300" />
              <span>Public Website</span>
            </button>
            {onLockDashboard && (
              <button
                onClick={onLockDashboard}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white text-xs font-bold transition-colors border border-red-500/30"
                title="Lock admin session and return to public website"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Console</span>
              </button>
            )}
          </div>

        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#163322] border-t border-white/10">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-white text-[#1D432D] shadow'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'bg-white text-[#1D432D] shadow'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Posts & Articles</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {insights.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'staff'
                  ? 'bg-white text-[#1D432D] shadow'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Domestic Staff Directory</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {nannies.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'submissions'
                  ? 'bg-white text-[#1D432D] shadow'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Form Submissions</span>
              {(newBookings.length > 0 || pendingEmergency.length > 0) && (
                <span className="px-2 py-0.5 rounded-full bg-[#D96B43] text-white text-[10px] font-extrabold animate-pulse">
                  {newBookings.length + pendingEmergency.length} NEW
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'media'
                  ? 'bg-white text-[#1D432D] shadow'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Photos & Media</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {mediaItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'bg-white text-[#1D432D] shadow'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" />
              <span>Reviews</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">{reviews.filter(review => review.status === 'pending').length}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-white text-[#1D432D] shadow'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Site Settings</span>
            </button>

          </nav>
        </div>
      </header>

      {/* MAIN BODY CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div 
                onClick={() => setActiveTab('submissions')}
                className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm hover:border-[#D96B43] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7D766D]">New Submissions</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Inbox className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-[#1A201C]">
                    {newBookings.length + pendingEmergency.length}
                  </span>
                  <span className="text-xs text-[#7D766D]">pending review</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-[#D96B43] font-bold group-hover:translate-x-1 transition-transform">
                  <span>View client submissions</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('staff')}
                className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm hover:border-[#1D432D] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7D766D]">Vetted Staff</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-[#1A201C]">
                    {nannies.length}
                  </span>
                  <span className="text-xs text-[#7D766D]">active candidates</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-[#1D432D] font-bold group-hover:translate-x-1 transition-transform">
                  <span>Manage staff profiles</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('posts')}
                className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm hover:border-[#D96B43] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7D766D]">Published Posts</span>
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B43] flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-[#1A201C]">
                    {insights.length}
                  </span>
                  <span className="text-xs text-[#7D766D]">articles live</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-[#D96B43] font-bold group-hover:translate-x-1 transition-transform">
                  <span>Create & edit posts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('media')}
                className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm hover:border-blue-500 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7D766D]">Photo Library</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-[#1A201C]">
                    {mediaItems.length}
                  </span>
                  <span className="text-xs text-[#7D766D]">high-res photos</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-blue-700 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Upload & browse media</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('posts')}
                className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#FAF7F2] border border-[#E8DFD3] text-left hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#D96B43] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#D96B43]/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1A201C]">Publish New Post</h3>
                  <p className="text-xs text-[#635E59] mt-0.5 leading-relaxed">
                    Write parenting advice, infant nutrition guidelines, or estate homecare best practices.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('staff')}
                className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#FAF7F2] border border-[#E8DFD3] text-left hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1D432D] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1D432D]/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1A201C]">Add Domestic Staff</h3>
                  <p className="text-xs text-[#635E59] mt-0.5 leading-relaxed">
                    Register a new nanny, house manager, cook, or groundskeeper with photo and DCI clearance.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('media')}
                className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#FAF7F2] border border-[#E8DFD3] text-left hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1A201C]">Post & Upload Photos</h3>
                  <p className="text-xs text-[#635E59] mt-0.5 leading-relaxed">
                    Add new photos to the media library to use anywhere across the live frontend.
                  </p>
                </div>
              </button>
            </div>

            {/* Recent Submissions Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl border border-[#E8DFD3] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
                  <h3 className="font-bold text-sm text-[#1A201C] flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-[#D96B43]" />
                    <span>Recent 3-Day Trial Bookings</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className="text-xs font-bold text-[#D96B43] hover:underline"
                  >
                    View All ({bookings.length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {bookings.slice(0, 3).map(b => (
                    <div key={b.id} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1A201C]">{b.parentName}</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {b.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#635E59] mt-0.5">
                          {b.estate} • {b.role || 'nanny'} • {b.preferredTrialDays} Days Trial
                        </p>
                      </div>
                      <a
                        href={`tel:${b.phone}`}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#D5C9BA] hover:bg-[#F2ECE1] font-bold text-[#1D432D]"
                      >
                        Call
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Alerts */}
              <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-red-100 pb-3">
                  <h3 className="font-bold text-sm text-red-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Emergency Standby Dispatches</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className="text-xs font-bold text-red-700 hover:underline"
                  >
                    Manage Queue ({emergencyRequests.length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {emergencyRequests.slice(0, 3).map(e => (
                    <div key={e.id} className="p-3 rounded-xl bg-red-50/50 border border-red-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1A201C]">{e.parentName}</span>
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                            {e.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#635E59] mt-0.5">
                          {e.estate} • Needed: {e.requiredTime}
                        </p>
                      </div>
                      <a
                        href={`tel:${e.phone}`}
                        className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
                      >
                        Dispatch
                      </a>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* POSTS TAB */}
        {activeTab === 'posts' && <PostsManager />}

        {/* STAFF TAB */}
        {activeTab === 'staff' && <StaffManager />}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && <SubmissionsManager />}

        {/* MEDIA TAB */}
        {activeTab === 'media' && <MediaManager />}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && <ReviewsManager />}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && <SettingsManager />}

      </main>

    </div>
  );
};
