import React, { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, ExternalLink, FileText, LoaderCircle, RefreshCw, UserRoundX } from 'lucide-react';
import { getApiBaseUrl } from '../../lib/api';

type ProviderDocument = { path: string; name: string; kind: string; signedUrl: string };
type ProviderApplication = {
  id: string; profile: { name: string; email: string; phone: string; role: string; nannyType: string; primaryEstate: string; age: number; experienceYears: number; monthlySalaryKsh: number; languages: string[]; skills: string[]; bio: string; dciGoodConductNumber: string };
  documents: ProviderDocument[]; status: 'pending' | 'approved' | 'rejected' | 'disabled'; admin_notes: string; submitted_at: string; staff_profile_id: string | null;
};
const pin = () => localStorage.getItem('mommycare_admin_pin') || sessionStorage.getItem('mommycare_admin_pin') || '';
const roleName: Record<string, string> = { nanny: 'Nanny', 'house-manager': 'House manager', 'house-girl': 'Housekeeper', 'house-boy': 'Domestic steward', 'shamba-boy': 'Gardener', caretaker: 'Caretaker', 'cook-chef': 'Cook / chef', 'home-driver': 'Family driver' };

export const ProviderApplicationsManager: React.FC = () => {
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const api = getApiBaseUrl();

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${api}/api/admin/provider-applications`, { headers: { 'x-admin-pin': pin() } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not load provider applications.');
      setApplications(result.applications || []);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Could not load provider applications.'); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { void load(); }, [load]);

  const act = async (application: ProviderApplication, action: string, extra: Record<string, unknown> = {}) => {
    setBusyId(application.id); setError('');
    try {
      const response = await fetch(`${api}/api/admin/provider-applications/${application.id}/${action}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin() }, body: JSON.stringify(extra)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not update this application.');
      await load();
    } catch (actionError) { setError(actionError instanceof Error ? actionError.message : 'Could not update this application.'); }
    finally { setBusyId(''); }
  };

  return <section className="space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-['Outfit'] text-2xl font-extrabold text-[#1A201C]">Provider applications</h2><p className="mt-1 text-sm text-[#635E59]">Review submitted details and private documents before publishing a provider in the directory.</p></div>
      <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-[#D5C9BA] bg-white px-3 py-2 text-xs font-bold text-[#1A201C]"><RefreshCw className="h-4 w-4" /> Refresh</button>
    </header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading ? <div className="flex items-center gap-2 rounded-2xl bg-white p-8 text-sm text-[#635E59]"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading applications…</div> : applications.length === 0 ? <div className="rounded-2xl border border-dashed border-[#D5C9BA] bg-white p-10 text-center text-sm text-[#635E59]">No provider applications yet.</div> :
      <div className="space-y-4">{applications.map(application => {
        const applicant = application.profile;
        const waiting = application.status === 'pending' || application.status === 'rejected';
        return <article key={application.id} className="rounded-2xl border border-[#E8DFD3] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-['Outfit'] text-xl font-bold text-[#1A201C]">{applicant.name}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${application.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : application.status === 'pending' ? 'bg-amber-100 text-amber-800' : application.status === 'disabled' ? 'bg-slate-200 text-slate-700' : 'bg-red-100 text-red-800'}`}>{application.status}</span></div><p className="mt-1 text-xs text-[#7D766D]">Submitted {new Date(application.submitted_at).toLocaleString()}</p></div>
            <span className="rounded-lg bg-[#FAF7F2] px-3 py-2 text-xs font-bold text-[#1D432D]">{roleName[applicant.role] || applicant.role} · {applicant.primaryEstate}</span>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-[#3D3A36] sm:grid-cols-2 lg:grid-cols-3"><p><strong>Contact:</strong> {applicant.phone} · {applicant.email}</p><p><strong>Arrangement:</strong> {applicant.nannyType}</p><p><strong>Age / experience:</strong> {applicant.age} / {applicant.experienceYears} years</p><p><strong>Expected salary:</strong> {applicant.monthlySalaryKsh ? `KES ${applicant.monthlySalaryKsh.toLocaleString()}` : 'Not provided'}</p><p><strong>Languages:</strong> {(applicant.languages || []).join(', ') || 'Not provided'}</p><p><strong>Good Conduct ref:</strong> {applicant.dciGoodConductNumber || 'Not provided'}</p></div>
          {applicant.bio && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#635E59]">{applicant.bio}</p>}
          {(applicant.skills || []).length > 0 && <p className="mt-2 text-xs text-[#635E59]"><strong>Skills:</strong> {applicant.skills.join(', ')}</p>}
          <div className="mt-4"><p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#7D766D]">Private documents · links expire after 15 minutes</p><div className="flex flex-wrap gap-2">{application.documents.map(document => <a key={document.path} href={document.signedUrl || undefined} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${document.signedUrl ? 'border-[#D5C9BA] text-[#1D432D] hover:bg-[#FAF7F2]' : 'cursor-not-allowed border-red-200 text-red-700'}`}><FileText className="h-4 w-4" />{document.kind}: {document.name}<ExternalLink className="h-3 w-3" /></a>)}</div></div>
          <label className="mt-4 block text-xs font-bold text-[#635E59]">Internal admin note<textarea key={`${application.id}-${application.admin_notes}`} defaultValue={application.admin_notes} rows={2} placeholder="Add a private review note…" onBlur={event => { if (event.target.value !== application.admin_notes) void act(application, 'note', { adminNotes: event.target.value }); }} className="mt-1.5 w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] p-3 text-sm font-normal text-[#1A201C]" /></label>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E8DFD3] pt-4">
            {waiting && <>
              <label className="mr-auto flex items-center gap-2 text-xs font-semibold text-[#3D3A36]"><input id={`reviewed-${application.id}`} type="checkbox" className="accent-[#1D432D]" /> I reviewed and verified the submitted documents</label>
              <button disabled={busyId === application.id} onClick={() => { const reviewed = (document.getElementById(`reviewed-${application.id}`) as HTMLInputElement)?.checked; if (!reviewed) { setError('Confirm document review before publishing a profile.'); return; } void act(application, 'approve', { documentsReviewed: true }); }} className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D432D] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"><BadgeCheck className="h-4 w-4" /> Approve & publish</button>
              <button disabled={busyId === application.id} onClick={() => void act(application, 'reject')} className="rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50">Reject</button>
            </>}
            {application.status === 'approved' && <button disabled={busyId === application.id} onClick={() => void act(application, 'disable')} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 px-4 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-50"><UserRoundX className="h-4 w-4" /> Disable public listing</button>}
            {application.status === 'disabled' && <button disabled={busyId === application.id} onClick={() => void act(application, 'enable')} className="rounded-xl bg-[#1D432D] px-4 py-2.5 text-xs font-bold text-white">Re-enable public listing</button>}
            {busyId === application.id && <LoaderCircle className="h-4 w-4 animate-spin text-[#1D432D]" />}
          </div>
        </article>;
      })}</div>}
  </section>;
};
