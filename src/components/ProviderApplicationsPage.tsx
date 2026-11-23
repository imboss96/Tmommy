import React, { useMemo, useState } from 'react';
import { LoaderCircle, Mail, Phone, RefreshCw } from 'lucide-react';
import { getApiBaseUrl } from '../lib/api';

type ProviderApplication = {
  id: string;
  referenceCode: string;
  status: 'pending' | 'approved' | 'rejected' | 'disabled';
  notes: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  monthlySalaryRange: string | null;
};

type ProviderPaymentDraft = {
  id: string;
  referenceCode: string;
  status: 'awaiting_payment' | 'initiating' | 'pending' | 'failed' | 'paid';
  amountKes: number;
  message: string;
  createdAt: string | null;
  updatedAt: string | null;
  monthlySalaryRange: string | null;
};

const statusLabel: Record<string, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  disabled: 'Disabled',
  awaiting_payment: 'Awaiting payment',
  initiating: 'Preparing payment',
  failed: 'Payment failed',
  paid: 'Paid'
};

const statusClass: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-50 text-red-800 border-red-200',
  disabled: 'bg-zinc-100 text-zinc-700 border-zinc-300',
  awaiting_payment: 'bg-blue-50 text-blue-800 border-blue-200',
  initiating: 'bg-blue-50 text-blue-800 border-blue-200',
  failed: 'bg-red-50 text-red-800 border-red-200',
  paid: 'bg-emerald-50 text-emerald-800 border-emerald-200'
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

type LookupPayload = { email?: string; phone?: string };

export const ProviderApplicationsPage: React.FC = () => {
  const api = getApiBaseUrl();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [paymentDrafts, setPaymentDrafts] = useState<ProviderPaymentDraft[]>([]);
  const [lastLookup, setLastLookup] = useState<LookupPayload | null>(null);

  const loadProviderItems = async (lookup: LookupPayload) => {
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`${api}/api/provider/my-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lookup)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not load your applications.');
      const nextApplications = Array.isArray(result.applications) ? result.applications : [];
      const nextDrafts = Array.isArray(result.paymentDrafts) ? result.paymentDrafts : [];
      setApplications(nextApplications);
      setPaymentDrafts(nextDrafts);
      setLastLookup(lookup);
      if (nextApplications.length === 0 && nextDrafts.length === 0) {
        setNotice('No application records were found for those details yet.');
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your applications.');
    } finally {
      setLoading(false);
    }
  };

  const submitLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailValue = email.trim().toLowerCase();
    const phoneValue = phone.trim();
    if (!emailValue && !phoneValue) {
      setError('Enter your email or phone number to continue.');
      return;
    }
    await loadProviderItems({
      ...(emailValue ? { email: emailValue } : {}),
      ...(phoneValue ? { phone: phoneValue } : {})
    });
  };

  const hasItems = useMemo(() => applications.length > 0 || paymentDrafts.length > 0, [applications.length, paymentDrafts.length]);

  return <main className="flex-1 bg-[radial-gradient(ellipse_at_top,_#f1e9dc_0%,_#faf7f2_45%)] px-4 py-10 sm:px-6 sm:py-14">
    <section className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-3xl border border-[#E8DFD3] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D96B43]">Provider portal</p>
        <h1 className="mt-2 font-['Outfit'] text-3xl font-extrabold text-[#1A201C] sm:text-4xl">My applications</h1>
        <p className="mt-3 text-sm leading-6 text-[#635E59]">Check your application or payment status using the same email or phone used during submission.</p>
      </header>

      <section className="rounded-3xl border border-[#E8DFD3] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-['Outfit'] text-xl font-bold text-[#1A201C]">Find my records</h2>
        <p className="mt-2 text-sm text-[#635E59]">You can use email, phone number, or both. No link or OTP is required.</p>
        <form onSubmit={event => void submitLookup(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-[#514B44]">Email address
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D877F]" />
              <input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[#E7E1D9] bg-[#FCFBF9] py-3.5 pl-10 pr-4 text-sm text-[#1A201C] outline-none focus:border-[#1D432D] focus:ring-4 focus:ring-[#1D432D]/10" />
            </div>
          </label>
          <label className="block text-xs font-bold text-[#514B44]">Phone number
            <div className="relative mt-2">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D877F]" />
              <input type="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)}
                placeholder="07... or 254..."
                className="w-full rounded-xl border border-[#E7E1D9] bg-[#FCFBF9] py-3.5 pl-10 pr-4 text-sm text-[#1A201C] outline-none focus:border-[#1D432D] focus:ring-4 focus:ring-[#1D432D]/10" />
            </div>
          </label>
          <div className="sm:col-span-2">
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D432D] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Loading…</> : <>View my applications</>}
            </button>
            <button type="button" disabled={loading || !lastLookup} onClick={() => lastLookup && void loadProviderItems(lastLookup)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D5C9BA] bg-white px-4 py-3 text-sm font-bold text-[#1D432D] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
            </button>
          </div>
        </form>
      </section>

      {hasItems && <section className="space-y-4 rounded-3xl border border-[#E8DFD3] bg-white p-6 shadow-sm sm:p-8">
        {paymentDrafts.length > 0 && <div className="space-y-3">
          <h3 className="font-['Outfit'] text-lg font-bold text-[#1A201C]">Payment drafts</h3>
          {paymentDrafts.map(draft => <article key={draft.id} className="rounded-2xl border border-[#E7E1D9] bg-[#FCFBF9] p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-[#1A201C]">Reference: {draft.referenceCode || draft.id}</p>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass[draft.status] || 'bg-zinc-100 text-zinc-700 border-zinc-300'}`}>
                {statusLabel[draft.status] || draft.status}
              </span>
            </div>
            <p className="mt-2 text-[#635E59]">Salary band: {draft.monthlySalaryRange || '—'}</p>
            <p className="text-[#635E59]">Fee: KES {draft.amountKes.toLocaleString()}</p>
            <p className="text-[#635E59]">Last update: {formatDate(draft.updatedAt || draft.createdAt)}</p>
            {draft.message && <p className="mt-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">{draft.message}</p>}
            <a href={`/provider-payment?id=${encodeURIComponent(draft.id)}`} className="mt-3 inline-flex rounded-xl bg-[#1D432D] px-4 py-2 text-xs font-bold text-white">
              Open payment page
            </a>
          </article>)}
        </div>}

        {applications.length > 0 && <div className="space-y-3">
          <h3 className="font-['Outfit'] text-lg font-bold text-[#1A201C]">Submitted applications</h3>
          {applications.map(application => <article key={application.id} className="rounded-2xl border border-[#E7E1D9] bg-[#FCFBF9] p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-[#1A201C]">Reference: {application.referenceCode || application.id}</p>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass[application.status] || 'bg-zinc-100 text-zinc-700 border-zinc-300'}`}>
                {statusLabel[application.status] || application.status}
              </span>
            </div>
            <p className="mt-2 text-[#635E59]">Salary band: {application.monthlySalaryRange || '—'}</p>
            <p className="text-[#635E59]">Submitted: {formatDate(application.submittedAt)}</p>
            {application.reviewedAt && <p className="text-[#635E59]">Reviewed: {formatDate(application.reviewedAt)}</p>}
            {application.notes && <p className="mt-2 rounded-xl border border-[#E7E1D9] bg-white p-2.5 text-xs text-[#4B463F]">{application.notes}</p>}
          </article>)}
        </div>}
      </section>}
    </section>
  </main>;
};
