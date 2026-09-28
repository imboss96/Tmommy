import React, { FormEvent, useState } from 'react';
import { BadgeCheck, FileLock2, LoaderCircle, UploadCloud } from 'lucide-react';
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
const inputClass = 'mt-1.5 w-full rounded-xl border border-[#D5C9BA] bg-white px-3.5 py-3 text-sm text-[#1A201C] outline-none focus:ring-2 focus:ring-[#D96B43]/40';

export const ProviderApplicationPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'nanny' as HomecareRole, nannyType: 'live-in' as NannyType, primaryEstate: 'Kilimani' as NairobiEstate, age: '', experienceYears: '', monthlySalaryKsh: '', languages: '', skills: '', dciGoodConductNumber: '', bio: '' });
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
          ...form, age: Number(form.age), experienceYears: Number(form.experienceYears), monthlySalaryKsh: Number(form.monthlySalaryKsh),
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

  return <main className="flex-1 bg-[#FAF7F2] px-4 py-12 sm:px-6 lg:py-16">
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E8F0EA] px-3 py-1.5 text-xs font-bold text-[#1D432D]"><BadgeCheck className="h-4 w-4" /> Provider applications</div>
        <h1 className="font-['Outfit'] text-3xl font-extrabold text-[#1A201C] sm:text-4xl">Apply to work with MommyCare</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#635E59]">Homecare professionals can apply to be considered for the public directory. Submitting an application does not publish your profile; our team reviews applications and documents first.</p>
      </header>

      {status === 'sent' ? <section className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm"><BadgeCheck className="mx-auto h-12 w-12 text-emerald-700" /><h2 className="mt-4 font-['Outfit'] text-2xl font-bold text-[#1A201C]">Application received</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#635E59]">Your documents are stored privately for review. Your profile will only appear in the public directory if the admin team verifies and approves it.</p></section> :
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-[#E8DFD3] bg-white p-5 shadow-sm sm:p-8">
          <section>
            <h2 className="font-['Outfit'] text-xl font-bold text-[#1A201C]">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold text-[#635E59]">Full legal name *<input required autoComplete="name" value={form.name} onChange={e => setField('name', e.target.value)} className={inputClass} /></label>
              <label className="text-xs font-bold text-[#635E59]">Phone / WhatsApp *<input required type="tel" autoComplete="tel" value={form.phone} onChange={e => setField('phone', e.target.value)} className={inputClass} /></label>
              <label className="text-xs font-bold text-[#635E59]">Email address *<input required type="email" autoComplete="email" value={form.email} onChange={e => setField('email', e.target.value)} className={inputClass} /></label>
              <label className="text-xs font-bold text-[#635E59]">Profession *<select value={form.role} onChange={e => setField('role', e.target.value as HomecareRole)} className={inputClass}>{roles.map(role => <option value={role.value} key={role.value}>{role.label}</option>)}</select></label>
              <label className="text-xs font-bold text-[#635E59]">Preferred arrangement *<select value={form.nannyType} onChange={e => setField('nannyType', e.target.value as NannyType)} className={inputClass}><option value="live-in">Live-in</option><option value="day-care">Day work</option><option value="night-nurse">Night shifts</option><option value="temporary-backup">Temporary / relief</option></select></label>
              <label className="text-xs font-bold text-[#635E59]">Home area / neighbourhood *<select value={form.primaryEstate} onChange={e => setField('primaryEstate', e.target.value as NairobiEstate)} className={inputClass}>{estates.map(estate => <option key={estate}>{estate}</option>)}</select></label>
              <label className="text-xs font-bold text-[#635E59]">Age *<input required type="number" min="18" max="75" value={form.age} onChange={e => setField('age', e.target.value)} className={inputClass} /></label>
              <label className="text-xs font-bold text-[#635E59]">Years of experience *<input required type="number" min="0" max="60" value={form.experienceYears} onChange={e => setField('experienceYears', e.target.value)} className={inputClass} /></label>
              <label className="text-xs font-bold text-[#635E59]">Expected monthly salary (KES)<input type="number" min="0" value={form.monthlySalaryKsh} onChange={e => setField('monthlySalaryKsh', e.target.value)} className={inputClass} /></label>
              <label className="text-xs font-bold text-[#635E59]">Languages, comma separated<input value={form.languages} onChange={e => setField('languages', e.target.value)} placeholder="Kiswahili, English" className={inputClass} /></label>
            </div>
            <label className="mt-4 block text-xs font-bold text-[#635E59]">Skills and experience, comma separated<textarea rows={2} value={form.skills} onChange={e => setField('skills', e.target.value)} placeholder="Infant care, first aid, meal preparation" className={inputClass} /></label>
            <label className="mt-4 block text-xs font-bold text-[#635E59]">Short introduction<textarea rows={4} value={form.bio} onChange={e => setField('bio', e.target.value)} placeholder="Tell us about your work experience and the kind of role you are looking for." className={inputClass} /></label>
            <label className="mt-4 block text-xs font-bold text-[#635E59]">Certificate of Good Conduct reference (if available)<input value={form.dciGoodConductNumber} onChange={e => setField('dciGoodConductNumber', e.target.value)} className={inputClass} /></label>
          </section>

          <section className="border-t border-[#E8DFD3] pt-6">
            <div className="flex gap-3"><FileLock2 className="h-5 w-5 shrink-0 text-[#1D432D]" /><div><h2 className="font-['Outfit'] text-xl font-bold text-[#1A201C]">Supporting documents</h2><p className="mt-1 text-xs leading-relaxed text-[#635E59]">Documents are private and only shared with administrators for application review. Accepted formats: PDF, JPG, PNG; 8 MB maximum each.</p></div></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{documentFields.map(field => <label key={field.kind} className="rounded-2xl border border-dashed border-[#D5C9BA] bg-[#FAF7F2] p-4 text-xs font-bold text-[#3D3A36]">{field.label}{field.required ? ' *' : ''}<span className="mt-1 block font-normal text-[#7D766D]">{field.hint}</span><span className="mt-3 flex items-center gap-2 text-[#1D432D]"><UploadCloud className="h-4 w-4" />{documents[field.kind]?.name || 'Choose file'}</span><input required={Boolean(field.required)} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={e => setDocuments(current => ({ ...current, [field.kind]: e.target.files?.[0] || null }))} className="mt-2 block w-full text-[11px] font-normal" /></label>)}</div>
          </section>
          <label className="flex items-start gap-3 rounded-xl bg-[#FAF7F2] p-4 text-xs leading-relaxed text-[#635E59]"><input type="checkbox" required className="mt-0.5 accent-[#1D432D]" /><span>I confirm the information is accurate and consent to MommyCare reviewing these details and documents. If approved, I agree that my name, role, area, arrangement, experience, skills, introduction, and expected salary may appear in the public directory. My contact details and uploaded documents will remain private.</span></label>
          {status === 'error' && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button type="submit" disabled={status === 'sending'} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D432D] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#143020] disabled:opacity-60">{status === 'sending' ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Submitting securely…</> : 'Submit provider application'}</button>
        </form>}
    </div>
  </main>;
};
