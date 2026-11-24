import React, { useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Lock,
  MessageSquareQuote,
  ReceiptText,
  Search,
  Settings,
  UserPlus,
  Users,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { TmommycareLogo } from '../TmommycareLogo';
import { PostsManager } from './PostsManager';
import { StaffManager } from './StaffManager';
import { SubmissionsManager } from './SubmissionsManager';
import { MediaManager } from './MediaManager';
import { SettingsManager } from './SettingsManager';
import { ReviewsManager } from './ReviewsManager';
import { ProviderApplicationsManager } from './ProviderApplicationsManager';
import { ProviderTransactionsManager } from './ProviderTransactionsManager';
import { AdminOverview } from './AdminOverview';

type AdminTab = 'overview' | 'posts' | 'staff' | 'applications' | 'transactions' | 'submissions' | 'media' | 'reviews' | 'settings';
type NavigationItem = { id: AdminTab; label: string; icon: LucideIcon; count?: number; alert?: number };

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
    contactInquiries,
    mediaItems,
    reviews,
    recentAlert,
    dismissAlert
  } = useContent();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [navigationSearch, setNavigationSearch] = useState('');

  const newBookings = bookings.filter(booking => booking.status === 'New').length;
  const pendingEmergency = emergencyRequests.filter(request => request.status === 'Pending Dispatch').length;
  const newContacts = contactInquiries.filter(inquiry => inquiry.status === 'New').length;
  const pendingReviews = reviews.filter(review => review.status === 'pending').length;
  const submissionAlerts = newBookings + pendingEmergency + newContacts;

  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'submissions', label: 'Requests & enquiries', icon: Inbox, alert: submissionAlerts },
    { id: 'applications', label: 'Provider applications', icon: UserPlus },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'staff', label: 'Staff directory', icon: Users, count: nannies.length },
    { id: 'posts', label: 'Posts & articles', icon: BookOpen, count: insights.length },
    { id: 'media', label: 'Photos & media', icon: ImageIcon, count: mediaItems.length },
    { id: 'reviews', label: 'Reviews', icon: MessageSquareQuote, alert: pendingReviews },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];
  const visibleNavigationItems = navigationItems.filter(item => item.label.toLowerCase().includes(navigationSearch.trim().toLowerCase()));

  const renderNavigation = (mobile = false) => visibleNavigationItems.map(item => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => setActiveTab(item.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors ${mobile ? '' : 'w-full'} ${
          isActive
            ? 'bg-[#EEF3FF] text-[#2459CC] shadow-[inset_3px_0_0_#3478F6]'
            : 'text-[#5F6672] hover:bg-[#F5F7FA] hover:text-[#202531]'
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#3478F6]' : 'text-[#818895]'}`} />
        <span className="whitespace-nowrap">{item.label}</span>
        {item.alert ? (
          <span className="ml-auto min-w-5 rounded-full bg-[#EAF7F0] px-1.5 py-0.5 text-center text-[9px] font-bold text-[#22865B]">{item.alert}</span>
        ) : item.count !== undefined ? (
          <span className="ml-auto rounded-full bg-[#F0F2F5] px-2 py-0.5 text-[10px] font-semibold text-[#737A86]">{item.count}</span>
        ) : null}
      </button>
    );
  });

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-[#202531]">
      {recentAlert && (
        <div className="fixed right-4 top-4 z-[60] animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-[#202531] shadow-xl">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span className="text-xs font-semibold">{recentAlert}</span>
            <button type="button" onClick={dismissAlert} className="ml-2 text-xs text-[#818895] hover:text-[#202531]" aria-label="Dismiss notification">✕</button>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        <aside className="hidden w-[248px] shrink-0 flex-col border-r border-[#E8EBEF] bg-white px-4 py-5 lg:flex">
          <div className="flex items-center gap-3 px-2 pb-7">
            <TmommycareLogo variant="icon" colorScheme="default" size="sm" onClick={event => event.preventDefault()} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-[#1E2735]">Tmommycare</p>
              <p className="mt-0.5 text-[10px] font-medium text-[#89909B]">Operations workspace</p>
            </div>
          </div>

          <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[#9AA0AA]">Workspace</p>
          <nav aria-label="Admin sections" className="flex flex-col gap-1">
            {renderNavigation()}
          </nav>

          <div className="mt-auto space-y-3 pt-8">
            <div className="rounded-2xl bg-[#F4F7FC] p-3.5">
              <p className="text-xs font-bold text-[#29364B]">Operations console</p>
              <p className="mt-1 text-[10px] leading-relaxed text-[#7B8492]">Manage requests, providers, and website content from one place.</p>
            </div>
            <button
              type="button"
              onClick={onBackToWebsite}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-[#5F6672] hover:bg-[#F5F7FA]"
            >
              <span className="inline-flex items-center gap-2"><ExternalLink className="h-4 w-4" /> Public website</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            {onLockDashboard && (
              <button
                type="button"
                onClick={onLockDashboard}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#A34C4C] hover:bg-red-50"
              >
                <Lock className="h-4 w-4" /> Lock admin session
              </button>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-[#E8EBEF] bg-white/95 backdrop-blur">
            <div className="flex h-[68px] items-center justify-between gap-3 px-4 sm:px-6 xl:px-8">
              <div className="flex min-w-0 items-center gap-2 lg:hidden">
                <TmommycareLogo variant="icon" colorScheme="default" size="sm" onClick={event => event.preventDefault()} />
                <span className="truncate text-sm font-bold text-[#1E2735]">Tmommycare Admin</span>
              </div>
              <label className="hidden max-w-[420px] flex-1 items-center gap-2 rounded-xl border border-[#E8EBEF] bg-[#F8F9FB] px-3 py-2 md:flex">
                <Search className="h-4 w-4 shrink-0 text-[#9299A4]" />
                <input
                  type="search"
                  value={navigationSearch}
                  onChange={event => setNavigationSearch(event.target.value)}
                  placeholder="Search dashboard sections..."
                  aria-label="Search dashboard sections"
                  className="w-full bg-transparent text-xs text-[#202531] outline-none placeholder:text-[#A0A6AF]"
                />
                {navigationSearch && <button type="button" onClick={() => setNavigationSearch('')} className="text-[10px] text-[#7B8492]">Clear</button>}
              </label>
              <div className="ml-auto flex items-center gap-2">
                <span className="hidden rounded-xl bg-[#F5F7FA] px-3 py-2 text-[10px] font-semibold text-[#717784] sm:inline-flex">
                  {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={onBackToWebsite}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E8ED] bg-white px-3 py-2 text-[11px] font-semibold text-[#4C5563] hover:bg-[#F8F9FB]"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Website</span>
                </button>
                {onLockDashboard && (
                  <button
                    type="button"
                    onClick={onLockDashboard}
                    aria-label="Lock admin session"
                    title="Lock admin session"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E8ED] text-[#69717E] hover:bg-[#F8F9FB]"
                  >
                    <Lock className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </header>

          <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto border-b border-[#E8EBEF] bg-white px-3 py-2 lg:hidden">
            {renderNavigation(true)}
          </nav>

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
            <div className="mx-auto w-full max-w-[1500px]">
              {activeTab === 'overview' && (
                <AdminOverview
                  bookings={bookings}
                  emergencyRequests={emergencyRequests}
                  contactInquiries={contactInquiries}
                  nannies={nannies}
                  insights={insights}
                  mediaItems={mediaItems}
                  onViewSubmissions={() => setActiveTab('submissions')}
                  onViewStaff={() => setActiveTab('staff')}
                />
              )}
              {activeTab === 'posts' && <PostsManager />}
              {activeTab === 'staff' && <StaffManager />}
              {activeTab === 'applications' && <ProviderApplicationsManager />}
              {activeTab === 'transactions' && <ProviderTransactionsManager />}
              {activeTab === 'submissions' && <SubmissionsManager />}
              {activeTab === 'media' && <MediaManager />}
              {activeTab === 'reviews' && <ReviewsManager />}
              {activeTab === 'settings' && <SettingsManager />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
