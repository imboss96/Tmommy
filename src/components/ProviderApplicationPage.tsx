import React, { FormEvent, useState } from 'react';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, FileLock2, LoaderCircle, LockKeyhole, Sparkles, UploadCloud, UserRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getApiBaseUrl } from '../lib/api';
import { HomecareRole, NairobiEstate, NannyType } from '../types';

type DocumentKind = 'identity' | 'good-conduct' | 'training' | 'cv' | 'other';
type ApplicationDocument = { path: string; name: string; kind: DocumentKind };
const documentFields: { kind: DocumentKind; label: string; required?: boolean; hint: string }[] = [
  { kind: 'identity', label: 'National ID or passport', required: true, hint: 'PDF, JPG, or PNG; max 8 MB.' },
  { kind: 'good-conduct', label: 'Certificate of Good Conduct', required: true, hint: 'PDF, JPG, or PNG; max 8 MB.' },
  { kind: 'training', label: 'Training or first-aid certificate', hint: 'Optional supporting document.' },
  { kind: 'cv', label: 'CV or work history', hint: 'Optional supporting document.' }
];
const roles: { value: HomecareRole; label: string }[] = [
  { value: 'nanny', label: 'Nanny / childcare provider' }, { value: 'house-manager', label: 'House manager' },
  { value: 'house-girl', label: 'Housekeeper' }, { value: 'house-boy', label: 'Domestic steward' },
  { value: 'shamba-boy', label: 'Gardener / groundskeeper' }, { value: 'caretaker', label: 'Caretaker' },
  { value: 'cook-chef', label: 'Cook / chef' }, { value: 'home-driver', label: 'Family driver' }
];
const estates: NairobiEstate[] = ['Kilimani', 'Westlands', 'Karen', 'Lavington', 'Kileleshwa', 'Runda', 'Muthaiga', 'South C', 'Parklands', 'Gigiri', 'Kiambu Road', 'Ruaka'];
const salaryRanges = [
  'KES 10,000–12,000',
  'KES 12,001–15,000',
  'KES 15,001–20,000',
  'KES 20,001–25,000',
  'KES 25,001–30,000',
  'Above KES 30,000',
  'Negotiable'
];
const inputClass = 'mt-2 w-full rounded-xl border border-[#E7E1D9] bg-[#FCFBF9] px-4 py-3.5 text-sm text-[#1A201C] outline-none transition placeholder:text-[#A39B91] hover:border-[#CFC5B8] focus:border-[#1D432D] focus:bg-white focus:ring-4 focus:ring-[#1D432D]/10';

export const ProviderApplicationPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'nanny' as HomecareRole, nannyType: 'live-in' as NannyType, primaryEstate: 'Kilimani' as NairobiEstate, age: '', experienceYears: '', monthlySalaryRange: '', languages: '', skills: '', dciGoodConductNumber: '', bio: '' });
  const [documents, setDocuments] = useState<Record<DocumentKind, File | null>>({ identity: null, 'good-conduct': null, training: null, cv: null, other: null });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const setField = <Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) => setForm(current => ({ ...current, [key]: value }));
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!supabase) { setStatus('error'); setError('Applications are temporarily unavailable. Please contact us directly.'); return; }
    if (!documents.identity || !documents['good-conduct']) { setStatus('error'); setError('Please attach your identity document and Certificate of Good Conduct.'); return; }
    setStatus('sending');
    const id = crypto.randomUUID();
    try {
      const uploaded: ApplicationDocument[] = [];
      for (const field of documentFields) {
        const file = documents[field.kind];
        if (!file) continue;
        if (file.size > 8 * 1024 * 1024) throw new Error(`${field.label} must be smaller than 8 MB.`);
        if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) throw new Error(`${field.label} must be a PDF, JPG, or PNG.`);
        const extension = file.name.split('.').pop()?.toLowerCase() || 'file';
        const path = `${id}/${field.kind}-${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from('provider-documents').upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error(`Could not upload ${field.label}: ${uploadError.message}`);
        uploaded.push({ path, name: file.name.slice(0, 160), kind: field.kind });
      }
      const response = await fetch(`${getApiBaseUrl()}/api/provider-applications`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, profile: {
          ...form, age: Number(form.age), experienceYears: Number(form.experienceYears),
          languages: form.languages.split(',').map(value => value.trim()).filter(Boolean),
          skills: form.skills.split(',').map(value => value.trim()).filter(Boolean)
        }, documents: uploaded })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not submit your application. Please try again.');
      setStatus('sent');
    } catch (submissionError) {
      setStatus('error');
      setError(submissionError instanceof Error ? submissionError.message : 'We could not submit your application.');
    }
  };

  return <main className="flex-1 bg-[radial-gradient(ellipse_at_top,_#f1e9dc_0%,_#faf7f2_45%)] px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
    <div className="mx-auto max-w-6xl">
      <header className="mb-9 grid gap-7 lg:mb-12 lg:grid-cols-[1fr_340px] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#DCE7DE] bg-white/80 px-3.5 py-2 text-xs font-bold tracking-wide text-[#1D432D] shadow-sm"><Sparkles className="h-4 w-4" /> PROVIDER APPLICATIONS</div>
          <h1 className="max-w-3xl font-['Outfit'] text-4xl font-extrabold leading-[1.05] tracking-tight text-[#1A201C] sm:text-5xl lg:text-6xl">Your next chapter in <span className="text-[#D96B43]">homecare</span> starts here.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#635E59]">Share your experience and the kind of work you’re looking for. Our team reviews every application before a profile is considered for the MommyCare directory.</p>
        </div>
        <aside className="flex gap-4 rounded-2xl border border-[#E8DFD3] bg-white/80 p-5 shadow-[0_12px_32px_rgba(42,35,25,0.05)]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F0EA] text-[#1D432D]"><LockKeyhole className="h-5 w-5" /></span>
          <div><h2 className="font-['Outfit'] text-base font-bold text-[#1A201C]">Your information stays protected</h2><p className="mt-1.5 text-sm leading-6 text-[#635E59]">Your contact details and uploaded documents are private and only shared with our review team.</p></div>
        </aside>
      </header>

      {status === 'sent' ? <section className="rounded-[2rem] border border-[#DCE7DE] bg-white px-6 py-14 text-center shadow-[0_24px_70px_rgba(42,35,25,0.08)] sm:px-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F0EA] text-[#1D432D]"><BadgeCheck className="h-8 w-8" /></span>
        <h2 className="mt-6 font-['Outfit'] text-3xl font-bold text-[#1A201C]">Application received</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#635E59]">Your documents are stored privately for review. Your profile will only appear in the public directory if the admin team verifies and approves it.</p>
      </section> :
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-[2rem] border border-[#E8DFD3] bg-white shadow-[0_24px_70px_rgba(42,35,25,0.08)]">
          <div className="flex flex-col gap-5 border-b border-[#F0EBE5] bg-[#FEFDFC] px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-9">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D96B43]">A little about you</p><h2 className="mt-1 font-['Outfit'] text-2xl font-bold text-[#1A201C]">Let’s get your application started</h2></div>
            <p className="flex items-center gap-2 text-xs font-medium text-[#777067]"><span className="h-2 w-2 rounded-full bg-[#D96B43]" /> Required fields are marked with *</p>
          </div>

          <div className="space-y-10 px-5 py-7 sm:px-9 sm:py-9">
            <section>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7EEE8] text-[#B8532F]"><UserRound className="h-5 w-5" /></span>
                <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9A7160]">01 · About you</p><h3 className="font-['Outfit'] text-lg font-bold text-[#1A201C]">Personal details</h3></div>
              </div>
              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-[#514B44]">Full legal name *<input required autoComplete="name" value={form.name} onChange={e => setField('name', e.target.value)} className={inputClass} /></label>
                <label className="text-xs font-bold text-[#514B44]">Phone / WhatsApp *<input required type="tel" autoComplete="tel" value={form.phone} onChange={e => setField('phone', e.target.value)} className={inputClass} /></label>
                <label className="text-xs font-bold text-[#514B44]">Email address *<input required type="email" autoComplete="email" value={form.email} onChange={e => setField('email', e.target.value)} className={inputClass} /></label>
                <label className="text-xs font-bold text-[#514B44]">Age *<input required type="number" min="18" max="75" value={form.age} onChange={e => setField('age', e.target.value)} className={inputClass} /></label>
              </div>
            </section>

            <section className="border-t border-[#F0EBE5] pt-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0EA] text-[#1D432D]"><BriefcaseBusiness className="h-5 w-5" /></span>
                <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#66816D]">02 · Your work</p><h3 className="font-['Outfit'] text-lg font-bold text-[#1A201C]">Experience & preferences</h3></div>
              </div>
              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-[#514B44]">Profession *<select value={form.role} onChange={e => setField('role', e.target.value as HomecareRole)} className={inputClass}>{roles.map(role => <option value={role.value} key={role.value}>{role.label}</option>)}</select></label>
                <label className="text-xs font-bold text-[#514B44]">Preferred arrangement *<select value={form.nannyType} onChange={e => setField('nannyType', e.target.value as NannyType)} className={inputClass}><option value="live-in">Live-in</option><option value="day-care">Day work</option><option value="night-nurse">Night shifts</option><option value="temporary-backup">Temporary / relief</option></select></label>
                <label className="text-xs font-bold text-[#514B44]">Home area / neighbourhood *<select value={form.primaryEstate} onChange={e => setField('primaryEstate', e.target.value as NairobiEstate)} className={inputClass}>{estates.map(estate => <option key={estate}>{estate}</option>)}</select></label>
                <label className="text-xs font-bold text-[#514B44]">Years of experience *<input required type="number" min="0" max="60" value={form.experienceYears} onChange={e => setField('experienceYears', e.target.value)} className={inputClass} /></label>
                <label className="text-xs font-bold text-[#514B44]">Expected monthly salary<select value={form.monthlySalaryRange} onChange={e => setField('monthlySalaryRange', e.target.value)} className={inputClass}><option value="">Select a salary range</option>{salaryRanges.map(range => <option key={range} value={range}>{range}</option>)}</select></label>
                <label className="text-xs font-bold text-[#514B44]">Languages<span className="font-normal text-[#91897F]"> · comma separated</span><input value={form.languages} onChange={e => setField('languages', e.target.value)} placeholder="Kiswahili, English" className={inputClass} /></label>
              </div>
              <div className="mt-4 grid gap-4">
                <label className="text-xs font-bold text-[#514B44]">Skills and experience<span className="font-normal text-[#91897F]"> · comma separated</span><textarea rows={2} value={form.skills} onChange={e => setField('skills', e.target.value)} placeholder="Infant care, first aid, meal preparation" className={inputClass} /></label>
                <label className="text-xs font-bold text-[#514B44]">Short introduction<textarea rows={4} value={form.bio} onChange={e => setField('bio', e.target.value)} placeholder="Tell us about your work experience and the kind of role you are looking for." className={inputClass} /></label>
                <label className="text-xs font-bold text-[#514B44]">Certificate of Good Conduct reference <span className="font-normal text-[#91897F]">· if available</span><input value={form.dciGoodConductNumber} onChange={e => setField('dciGoodConductNumber', e.target.value)} className={inputClass} /></label>
              </div>
            </section>

            <section className="border-t border-[#F0EBE5] pt-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7EEE8] text-[#B8532F]"><FileLock2 className="h-5 w-5" /></span>
                <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9A7160]">03 · Documents</p><h3 className="font-['Outfit'] text-lg font-bold text-[#1A201C]">Supporting documents</h3></div>
              </div>
              <p className="mb-5 max-w-2xl text-sm leading-6 text-[#777067]">Documents are private and only shared with administrators for application review. Accepted formats: PDF, JPG, PNG; 8 MB maximum each.</p>
              <div className="grid gap-3 sm:grid-cols-2">{documentFields.map(field => <label key={field.kind} className="group cursor-pointer rounded-2xl border border-dashed border-[#D8CFC3] bg-[#FCFBF9] p-4 transition hover:border-[#1D432D] hover:bg-[#F7FAF7]">
                <span className="flex items-start justify-between gap-2 text-xs font-bold text-[#3D3A36]">{field.label}{field.required ? ' *' : ''}<UploadCloud className="h-4 w-4 shrink-0 text-[#1D432D]" /></span>
                <span className="mt-1 block text-xs font-normal text-[#91897F]">{field.hint}</span>
                <span className="mt-4 block truncate rounded-lg border border-[#EEE9E2] bg-white px-3 py-2.5 text-xs font-semibold text-[#1D432D]">{documents[field.kind]?.name || 'Choose a file to upload'}</span>
                <input required={Boolean(field.required)} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={e => setDocuments(current => ({ ...current, [field.kind]: e.target.files?.[0] || null }))} className="sr-only" />
              </label>)}</div>
            </section>

            <section className="border-t border-[#F0EBE5] pt-8">
              <label className="flex items-start gap-3 rounded-2xl border border-[#E8DFD3] bg-[#FCFBF9] p-4 text-xs leading-6 text-[#635E59] sm:p-5"><input type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[#1D432D]" /><span>I confirm the information is accurate and consent to MommyCare reviewing these details and documents. If approved, I agree that my name, role, area, arrangement, experience, skills, introduction, and expected salary may appear in the public directory. My contact details and uploaded documents will remain private.</span></label>
              {status === 'error' && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs text-[#777067]"><LockKeyhole className="h-4 w-4 text-[#1D432D]" /> Your documents are submitted securely</p>
                <button type="submit" disabled={status === 'sending'} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D432D] px-6 py-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(29,67,45,0.2)] transition hover:-translate-y-0.5 hover:bg-[#143020] hover:shadow-[0_14px_28px_rgba(29,67,45,0.25)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{status === 'sending' ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Submitting securely…</> : <>Submit provider application <ArrowRight className="h-4 w-4" /></>}</button>
              </div>
            </section>
          </div>
        </form>}
    </div>
  </main>;
};
