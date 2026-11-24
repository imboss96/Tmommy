import React from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Inbox,
  Users
} from 'lucide-react';
import type {
  BookingSubmission,
  ContactInquiry,
  EmergencySubmission,
  MediaItem,
  NannyProfile,
  ParentingInsight
} from '../../types';

type RequestItem = {
  id: string;
  type: 'Booking' | 'Emergency' | 'Contact';
  name: string;
  status: string;
  submittedAt: string;
  followUpAt?: string;
  assignedAdminEmail?: string;
  isOpen: boolean;
};

type AdminOverviewProps = {
  bookings: BookingSubmission[];
  emergencyRequests: EmergencySubmission[];
  contactInquiries: ContactInquiry[];
  nannies: NannyProfile[];
  insights: ParentingInsight[];
  mediaItems: MediaItem[];
  onViewSubmissions: () => void;
  onViewStaff: () => void;
};

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getDayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const getTimestamp = (value: string) => {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const MetricCard: React.FC<{
  label: string;
  value: number;
  caption: string;
  icon: React.ElementType;
  iconClass: string;
  onClick: () => void;
  trend?: number | null;
}> = ({ label, value, caption, icon: Icon, iconClass, onClick, trend }) => (
  <button
    type="button"
    onClick={onClick}
    className="group rounded-2xl border border-[#E8EBEF] bg-white p-4 text-left shadow-[0_2px_8px_rgba(16,24,40,0.03)] transition hover:-translate-y-0.5 hover:border-[#C7D7FE] hover:shadow-md sm:p-5"
  >
    <span className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-[#717784]">{label}</span>
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}><Icon className="h-4 w-4" /></span>
    </span>
    <span className="mt-4 flex flex-wrap items-baseline gap-2">
      <span className="text-2xl font-bold tracking-tight text-[#151922] sm:text-3xl">{value.toLocaleString()}</span>
      {trend !== undefined && trend !== null && (
        <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </span>
    <span className="mt-1 block text-[11px] text-[#858B96]">{caption}</span>
  </button>
);

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  bookings,
  emergencyRequests,
  contactInquiries,
  nannies,
  insights,
  mediaItems,
  onViewSubmissions,
  onViewStaff
}) => {
  const now = new Date();
  const currentDay = startOfDay(now);
  const currentPeriodStart = new Date(currentDay);
  currentPeriodStart.setDate(currentPeriodStart.getDate() - 29);
  const previousPeriodStart = new Date(currentPeriodStart);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
  const nextWeek = now.getTime() + 7 * 24 * 60 * 60 * 1000;

  const requestItems: RequestItem[] = [
    ...bookings.map(booking => ({
      id: booking.id,
      type: 'Booking' as const,
      name: booking.parentName,
      status: booking.status,
      submittedAt: booking.submittedAt,
      followUpAt: booking.followUpAt,
      assignedAdminEmail: booking.assignedAdminEmail,
      isOpen: booking.status !== 'Completed' && booking.status !== 'Archived'
    })),
    ...emergencyRequests.map(request => ({
      id: request.id,
      type: 'Emergency' as const,
      name: request.parentName,
      status: request.status,
      submittedAt: request.submittedAt,
      followUpAt: request.followUpAt,
      assignedAdminEmail: request.assignedAdminEmail,
      isOpen: request.status !== 'Resolved' && request.status !== 'Archived'
    })),
    ...contactInquiries.map(inquiry => ({
      id: inquiry.id,
      type: 'Contact' as const,
      name: inquiry.name,
      status: inquiry.status,
      submittedAt: inquiry.submittedAt,
      followUpAt: inquiry.followUpAt,
      assignedAdminEmail: inquiry.assignedAdminEmail,
      isOpen: inquiry.status !== 'Resolved' && inquiry.status !== 'Archived'
    }))
  ];

  const currentStart = currentPeriodStart.getTime();
  const previousStart = previousPeriodStart.getTime();
  const currentRequests = requestItems.filter(item => {
    const time = getTimestamp(item.submittedAt);
    return time !== null && time >= currentStart && time <= now.getTime();
  }).length;
  const previousRequests = requestItems.filter(item => {
    const time = getTimestamp(item.submittedAt);
    return time !== null && time >= previousStart && time < currentStart;
  }).length;
  const trend = previousRequests === 0
    ? (currentRequests > 0 ? null : 0)
    : Math.round(((currentRequests - previousRequests) / previousRequests) * 100);

  const dailyDates = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(currentDay);
    date.setDate(currentDay.getDate() - (13 - index));
    return date;
  });
  const dailyCounts = dailyDates.map(date => requestItems.filter(item => {
    const timestamp = getTimestamp(item.submittedAt);
    return timestamp !== null && getDayKey(new Date(timestamp)) === getDayKey(date);
  }).length);
  const chartMaximum = Math.max(1, ...dailyCounts);
  const chartPoints = dailyCounts.map((count, index) => ({
    x: 28 + index * (604 / (dailyCounts.length - 1)),
    y: 170 - (count / chartMaximum) * 136
  }));
  const chartLine = chartPoints.map(point => `${point.x},${point.y}`).join(' ');
  const chartArea = `M ${chartPoints[0].x} 170 L ${chartLine.replace(/ /g, ' L ')} L ${chartPoints[chartPoints.length - 1].x} 170 Z`;

  const last30Days = requestItems.filter(item => {
    const timestamp = getTimestamp(item.submittedAt);
    return timestamp !== null && timestamp >= currentStart && timestamp <= now.getTime();
  });
  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekdayCounts = weekdayLabels.map((_, weekdayIndex) => last30Days.filter(item => {
    const date = new Date(item.submittedAt);
    const mondayFirstDay = (date.getDay() + 6) % 7;
    return mondayFirstDay === weekdayIndex;
  }).length);
  const weekdayMaximum = Math.max(1, ...weekdayCounts);
  const busiestWeekday = weekdayCounts.indexOf(Math.max(...weekdayCounts));
  const hasWeekdayActivity = weekdayCounts.some(count => count > 0);
  const requestMix = [
    { label: 'Placement requests', count: last30Days.filter(item => item.type === 'Booking').length, color: 'bg-[#2563EB]' },
    { label: 'Emergency requests', count: last30Days.filter(item => item.type === 'Emergency').length, color: 'bg-[#E7814B]' },
    { label: 'Contact enquiries', count: last30Days.filter(item => item.type === 'Contact').length, color: 'bg-[#35A879]' }
  ];
  const mixMaximum = Math.max(1, ...requestMix.map(item => item.count));

  const needsAttention = requestItems.filter(item => (
    item.status === 'New' || item.status === 'Pending Dispatch'
  )).length;
  const overdueFollowUps = requestItems.filter(item => {
    const timestamp = item.followUpAt ? getTimestamp(item.followUpAt) : null;
    return item.isOpen && timestamp !== null && timestamp < now.getTime();
  }).length;
  const followUpQueue = requestItems
    .map(item => ({ ...item, followUpTimestamp: item.followUpAt ? getTimestamp(item.followUpAt) : null }))
    .filter(item => item.isOpen && item.followUpTimestamp !== null && item.followUpTimestamp <= nextWeek)
    .sort((left, right) => (left.followUpTimestamp || 0) - (right.followUpTimestamp || 0))
    .slice(0, 5);
  const recentRequests = [...requestItems]
    .filter(item => getTimestamp(item.submittedAt) !== null)
    .sort((left, right) => (getTimestamp(right.submittedAt) || 0) - (getTimestamp(left.submittedAt) || 0))
    .slice(0, 6);

  return (
    <section className="space-y-5 sm:space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#858B96]">Workspace / Overview</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#151922] sm:text-3xl">Dashboard</h2>
          <p className="mt-1 text-sm text-[#717784]">A real-time overview of requests and operations.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl border border-[#E8EBEF] bg-white px-3 py-2 text-xs font-semibold text-[#525866] shadow-sm">
          <CalendarDays className="h-4 w-4 text-[#2563EB]" />
          Last 30 days
        </span>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          label="Client requests"
          value={currentRequests}
          caption="Compared with the previous 30 days"
          icon={Inbox}
          iconClass="bg-blue-50 text-[#2563EB]"
          trend={trend}
          onClick={onViewSubmissions}
        />
        <MetricCard
          label="Needs attention"
          value={needsAttention}
          caption="New enquiries and pending emergency requests"
          icon={Clock3}
          iconClass="bg-amber-50 text-amber-700"
          onClick={onViewSubmissions}
        />
        <MetricCard
          label="Overdue request follow-ups"
          value={overdueFollowUps}
          caption="Open requests past their follow-up time"
          icon={Activity}
          iconClass="bg-red-50 text-red-600"
          onClick={onViewSubmissions}
        />
        <MetricCard
          label="Active professionals"
          value={nannies.length}
          caption="Profiles currently in the staff directory"
          icon={Users}
          iconClass="bg-emerald-50 text-emerald-700"
          onClick={onViewStaff}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#E8EBEF] bg-white p-4 shadow-[0_2px_8px_rgba(16,24,40,0.03)] sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#202531]">Request activity</h3>
                <p className="mt-1 text-xs text-[#858B96]">Client requests received over the last 14 days</p>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#2563EB]">{currentRequests} in the last 30 days</span>
            </div>
            <div className="mt-4">
              <svg viewBox="0 0 660 200" role="img" aria-label="Client request volume over the last 14 days" className="h-48 w-full overflow-visible">
                <defs>
                  <linearGradient id="request-area-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[34, 68, 102, 136, 170].map(y => (
                  <line key={y} x1="28" x2="632" y1={y} y2={y} stroke="#EEF0F4" strokeDasharray="4 5" />
                ))}
                <path d={chartArea} fill="url(#request-area-gradient)" />
                <polyline points={chartLine} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {chartPoints.map((point, index) => (
                  <circle key={dailyDates[index].toISOString()} cx={point.x} cy={point.y} r="3" fill="#fff" stroke="#2563EB" strokeWidth="2" />
                ))}
              </svg>
              <div className="flex justify-between px-1 text-[10px] text-[#858B96]">
                <span>{dailyDates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <span>{dailyDates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <span>{dailyDates[13].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
            {currentRequests === 0 && <p className="mt-2 text-center text-xs text-[#858B96]">No client requests in the selected period.</p>}
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#E8EBEF] bg-white shadow-[0_2px_8px_rgba(16,24,40,0.03)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#EEF0F4] px-4 py-4 sm:px-5">
              <div>
                <h3 className="text-sm font-bold text-[#202531]">Recent requests</h3>
                <p className="mt-1 text-xs text-[#858B96]">Latest client activity across all enquiry types</p>
              </div>
              <button type="button" onClick={onViewSubmissions} className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {recentRequests.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="bg-[#FAFBFC] text-[10px] font-bold uppercase tracking-wide text-[#858B96]">
                    <tr><th className="px-5 py-3">Request</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Received</th><th className="px-5 py-3 text-right">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F1F4]">
                    {recentRequests.map(item => (
                      <tr key={`${item.type}-${item.id}`} className="hover:bg-[#FAFBFC]">
                        <td className="px-5 py-3.5 font-semibold text-[#202531]">{item.name}</td>
                        <td className="px-4 py-3.5 text-[#717784]">{item.type}</td>
                        <td className="px-4 py-3.5 text-[#717784]">{new Date(item.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
                        <td className="px-5 py-3.5 text-right"><span className="rounded-full bg-[#F1F3F6] px-2 py-1 text-[10px] font-semibold text-[#525866]">{item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-[#858B96]">Requests will appear here when received.</div>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-[#E8EBEF] bg-white p-4 shadow-[0_2px_8px_rgba(16,24,40,0.03)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#202531]">Requests by weekday</h3>
                <p className="mt-1 text-xs text-[#858B96]">Last 30 days</p>
              </div>
              <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#2563EB]">{hasWeekdayActivity ? `${weekdayLabels[busiestWeekday]} busiest` : 'No requests'}</span>
            </div>
            <div className="mt-5 flex h-36 items-end justify-between gap-2">
              {weekdayCounts.map((count, index) => (
                <div key={weekdayLabels[index]} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[9px] font-semibold text-[#858B96]">{count || ''}</span>
                  <div className="flex h-24 w-full items-end rounded-t-lg bg-[#F3F5F8]">
                    <div
                      className={`w-full rounded-t-lg transition-all ${index === busiestWeekday && count > 0 ? 'bg-[#2563EB]' : 'bg-[#B9C9F6]'}`}
                      style={{ height: `${Math.max(count > 0 ? 10 : 0, (count / weekdayMaximum) * 100)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] ${hasWeekdayActivity && index === busiestWeekday ? 'font-bold text-[#2563EB]' : 'text-[#858B96]'}`}>{weekdayLabels[index]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8EBEF] bg-white p-4 shadow-[0_2px_8px_rgba(16,24,40,0.03)] sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#202531]">Request mix</h3>
                <p className="mt-1 text-xs text-[#858B96]">By enquiry type · last 30 days</p>
              </div>
              <FileText className="h-4 w-4 text-[#858B96]" />
            </div>
            <div className="mt-5 space-y-4">
              {requestMix.map(item => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#525866]">{item.label}</span>
                    <span className="font-bold text-[#202531]">{item.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#F1F3F6]">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.count / mixMaximum) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8EBEF] bg-white p-4 shadow-[0_2px_8px_rgba(16,24,40,0.03)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#202531]">Follow-up queue</h3>
                <p className="mt-1 text-xs text-[#858B96]">Overdue and due within 7 days</p>
              </div>
              <button type="button" onClick={onViewSubmissions} className="text-xs font-bold text-[#2563EB] hover:underline">Open queue</button>
            </div>
            {followUpQueue.length ? (
              <div className="mt-4 space-y-2.5">
                {followUpQueue.map(item => {
                  const dueTime = item.followUpAt ? getTimestamp(item.followUpAt) : null;
                  const overdue = dueTime !== null && dueTime < now.getTime();
                  return (
                    <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-[#FAFBFC] p-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#202531]">{item.name}</p>
                        <p className="mt-0.5 truncate text-[10px] text-[#858B96]">{item.type}{item.assignedAdminEmail ? ` · ${item.assignedAdminEmail}` : ' · Unassigned'}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${overdue ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-[#2563EB]'}`}>
                        {overdue ? 'Overdue' : new Date(item.followUpAt || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-[#FAFBFC] p-4 text-center">
                <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
                <p className="mt-2 text-xs font-semibold text-[#525866]">No follow-ups due this week</p>
                <p className="mt-1 text-[10px] text-[#858B96]">Assign an owner and due date from the submissions queue.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onViewStaff} className="flex items-center justify-between rounded-2xl border border-[#E8EBEF] bg-white px-4 py-3 text-left shadow-[0_2px_8px_rgba(16,24,40,0.03)] hover:border-[#C7D7FE]">
          <span>
            <span className="block text-xs font-bold text-[#202531]">Staff directory</span>
            <span className="mt-1 block text-[11px] text-[#858B96]">{nannies.length} active professionals · {mediaItems.length} media files · {insights.length} articles</span>
          </span>
          <ArrowRight className="h-4 w-4 text-[#2563EB]" />
        </button>
        <div className="flex items-center justify-between rounded-2xl border border-[#E8EBEF] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(16,24,40,0.03)]">
          <span>
            <span className="block text-xs font-bold text-[#202531]">Live requests</span>
            <span className="mt-1 block text-[11px] text-[#858B96]">{requestItems.length.toLocaleString()} total enquiries recorded</span>
          </span>
          <Inbox className="h-4 w-4 text-[#2563EB]" />
        </div>
      </div>
    </section>
  );
};
