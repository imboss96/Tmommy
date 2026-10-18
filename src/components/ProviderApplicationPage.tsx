import React, { FormEvent, PointerEvent, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, FileLock2, LoaderCircle, LockKeyhole, Sparkles, UploadCloud, UserRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getApiBaseUrl } from '../lib/api';
import { HomecareRole, NannyType } from '../types';

type DocumentKind = 'profile-photo' | 'identity' | 'good-conduct' | 'training' | 'cv' | 'other';
type ApplicationDocument = { path: string; name: string; kind: DocumentKind };
const documentFields: { kind: DocumentKind; label: string; required?: boolean; hint: string }[] = [
  { kind: 'profile-photo', label: 'Profile photo', required: true, hint: 'JPG or PNG image; max 5 MB. This photo will appear in your public profile if approved.' },
  { kind: 'identity', label: 'National ID or passport', required: true, hint: 'PDF, JPG, or PNG; max 8 MB.' },
  { kind: 'good-conduct', label: 'Certificate of Good Conduct', required: true, hint: 'PDF, JPG, or PNG; max 8 MB.' },
  { kind: 'training', label: 'Training or first-aid certificate', hint: 'Optional supporting document.' },
  { kind: 'cv', label: 'CV or work history', hint: 'Optional supporting document.' }
];
const roles: { value: HomecareRole; label: string }[] = [
  { value: 'nanny', label: 'Nanny / childcare provider' }, { value: 'babysitter', label: 'Babysitter' },
  { value: 'house-manager', label: 'House manager' }, { value: 'house-girl', label: 'Housekeeper' },
  { value: 'mamafua', label: 'Mamafua (One-Time Housekeeper)' }, { value: 'house-boy', label: 'Domestic steward' },
  { value: 'shamba-boy', label: 'Gardener / groundskeeper' }, { value: 'caretaker', label: 'Caretaker' },
  { value: 'cook-chef', label: 'Cook / chef' }, { value: 'home-driver', label: 'Family driver' }
];
const salaryRanges = [
  'KES 6,000–8,000',
  'KES 8,001–12,000',
  'KES 12,001–15,000',
  'KES 15,001–20,000',
  'Above KES 20,000'
];
const homecareSkillOptions = [
  'Infant care', 'Newborn care', 'Toddler care', 'Child supervision', 'School run support',
  'Meal preparation', 'Healthy cooking', 'Baby food preparation', 'Housekeeping', 'Laundry',
  'Ironing', 'Dishwashing', 'General cleaning', 'Deep cleaning', 'Bathroom cleaning',
  'Pet care', 'Gardening', 'Lawn care', 'Pool maintenance', 'Elderly care', 'Care for special needs',
  'First aid', 'CPR', 'Medication reminders', 'Home organization', 'Errands', 'Shopping',
  'Babysitting', 'Nanny duties', 'Family support', 'Cooking for toddlers', 'Companionship'
];
const languageOptions = ['English', 'Kiswahili', 'Swahili', 'French', 'Arabic', 'German', 'Spanish', 'Italian', 'Portuguese'];
const inputClass = 'mt-2 w-full rounded-xl border border-[#E7E1D9] bg-[#FCFBF9] px-4 py-3.5 text-sm text-[#1A201C] outline-none transition placeholder:text-[#A39B91] hover:border-[#CFC5B8] focus:border-[#1D432D] focus:bg-white focus:ring-4 focus:ring-[#1D432D]/10';

export const ProviderApplicationPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', contactAddress: '', referenceName: '', referenceRelationship: '', referencePhone: '', emergencyContactName: '', emergencyContactPhone: '', gender: '' as '' | 'male' | 'female', role: 'nanny' as HomecareRole, nannyType: 'live-in' as NannyType, primaryEstate: '', age: '', experienceYears: '', monthlySalaryRange: '', languages: '', skills: '', dciGoodConductNumber: '', bio: '' });
  const [documents, setDocuments] = useState<Record<DocumentKind, File | null>>({ 'profile-photo': null, identity: null, 'good-conduct': null, training: null, cv: null, other: null });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingSignatureRef = useRef(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'submitted'>('idle');
  const [error, setError] = useState('');

  const setField = <Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) => setForm(current => ({ ...current, [key]: value }));
  const selectedSkills = form.skills.split(',').map(skill => skill.trim()).filter(Boolean);
  const selectedLanguages = form.languages.split(',').map(language => language.trim()).filter(Boolean);
  const toggleSkill = (skill: string) => {
    const nextSkills = new Set(selectedSkills);
    if (nextSkills.has(skill)) {
      nextSkills.delete(skill);
    } else {
      nextSkills.add(skill);
    }
    setField('skills', [...nextSkills].join(', '));
  };
  const toggleLanguage = (language: string) => {
    const nextLanguages = new Set(selectedLanguages);
    if (nextLanguages.has(language)) {
      nextLanguages.delete(language);
    } else {
      nextLanguages.add(language);
    }
    setField('languages', [...nextLanguages].join(', '));
  };
  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
    drawingSignatureRef.current = false;
  };
  const getSignaturePoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * canvas.width / bounds.width,
      y: (event.clientY - bounds.top) * canvas.height / bounds.height
    };
  };
  const startSignature = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!termsAccepted) return;
    event.preventDefault();
    const canvas = event.currentTarget;
    const point = getSignaturePoint(event);
    const context = canvas.getContext('2d');
    if (!context) return;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineWidth = 1.25;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#1D432D';
    context.lineTo(point.x + 0.1, point.y + 0.1);
    context.stroke();
    drawingSignatureRef.current = true;
  };
  const drawSignature = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingSignatureRef.current) return;
    event.preventDefault();
    const point = getSignaturePoint(event);
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    context.lineTo(point.x, point.y);
    context.stroke();
  };
  const finishSignature = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingSignatureRef.current) return;
    drawingSignatureRef.current = false;
    setSignatureDataUrl(event.currentTarget.toDataURL('image/png'));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!supabase) { setStatus('error'); setError('Applications are temporarily unavailable. Please contact us directly.'); return; }
    if (!documents['profile-photo'] || !documents.identity || !documents['good-conduct']) { setStatus('error'); setError('Please attach your profile photo, identity document, and Certificate of Good Conduct.'); return; }
    if (![form.contactAddress, form.emergencyContactName, form.emergencyContactPhone].every(value => value.trim())) {
      setStatus('error');
      setError('Enter your contact address and an emergency contact with a phone number.');
      return;
    }
    const hasReferenceDetails = [form.referenceName, form.referenceRelationship, form.referencePhone].some(value => value.trim());
    if (hasReferenceDetails && (form.referenceName.trim().length < 2 || form.referencePhone.trim().length < 7)) {
      setStatus('error');
      setError('If you add a reference, enter their full name and a valid phone number.');
      return;
    }
    if (!termsAccepted || !signatureDataUrl) {
      setStatus('error');
      setError('Agree to the provider terms and sign in the signature box before submitting.');
      return;
    }
    setStatus('sending');
    const id = crypto.randomUUID();
    try {
      const uploaded: ApplicationDocument[] = [];
      for (const field of documentFields) {
        const file = documents[field.kind];
        if (!file) continue;
        const isProfilePhoto = field.kind === 'profile-photo';
        if (file.size > (isProfilePhoto ? 5 : 8) * 1024 * 1024) throw new Error(`${field.label} exceeds the maximum file size.`);
        const allowedTypes = isProfilePhoto ? ['image/jpeg', 'image/png'] : ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) throw new Error(`${field.label} must be ${isProfilePhoto ? 'a JPG or PNG image' : 'a PDF, JPG, or PNG'}.`);
        const extension = file.name.split('.').pop()?.toLowerCase() || 'file';
        const path = `${id}/${field.kind}-${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from('provider-documents').upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error(`Could not upload ${field.label}: ${uploadError.message}`);
        uploaded.push({ path, name: file.name.slice(0, 160), kind: field.kind });
      }
      const response = await fetch(`${getApiBaseUrl()}/api/provider-applications/draft`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, profile: {
          ...form, age: Number(form.age), experienceYears: Number(form.experienceYears),
          languages: form.languages.split(',').map(value => value.trim()).filter(Boolean),
          skills: form.skills.split(',').map(value => value.trim()).filter(Boolean),
          termsAccepted,
          signatureDataUrl
        }, documents: uploaded })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not submit your application. Please try again.');
      if (result.status === 'submitted') {
        setStatus('submitted');
        return;
      }
      sessionStorage.setItem(`Tmommycare-provider-payment-phone-${id}`, form.phone);
      window.location.assign(`/provider-payment?id=${encodeURIComponent(id)}`);
    } catch (submissionError) {
      setStatus('error');
      setError(submissionError instanceof Error ? submissionError.message : 'We could not submit your application.');
    }
  };

  if (status === 'submitted') {
    return <main className="flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_top,_#f1e9dc_0%,_#faf7f2_45%)] px-4 py-10 sm:px-6">
      <section className="w-full max-w-xl rounded-[2rem] border border-[#E8DFD3] bg-white p-8 text-center shadow-[0_24px_70px_rgba(42,35,25,0.08)] sm:p-10">
        <BadgeCheck className="mx-auto h-14 w-14 text-[#1D432D]" />
        <h1 className="mt-5 font-['Outfit'] text-3xl font-extrabold text-[#1A201C]">Free application submitted</h1>
        <p className="mt-4 text-sm leading-7 text-[#635E59]">Your application has been submitted to the Tmommycare review team. No registration payment is required for the KES 6,000–8,000 salary band.</p>
        <a href="/" className="mt-7 inline-block rounded-xl bg-[#1D432D] px-6 py-3.5 text-sm font-bold text-white">Return to Tmommycare</a>
      </section>
    </main>;
  }

  return <main className="flex-1 bg-[radial-gradient(ellipse_at_top,_#f1e9dc_0%,_#faf7f2_45%)] px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
    <div className="mx-auto max-w-6xl">
      <header className="mb-9 grid gap-7 lg:mb-12 lg:grid-cols-[1fr_340px] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#DCE7DE] bg-white/80 px-3.5 py-2 text-xs font-bold tracking-wide text-[#1D432D] shadow-sm"><Sparkles className="h-4 w-4" /> PROVIDER APPLICATIONS</div>
          <h1 className="max-w-3xl font-['Outfit'] text-4xl font-extrabold leading-[1.05] tracking-tight text-[#1A201C] sm:text-5xl lg:text-6xl">Your next chapter in <span className="text-[#D96B43]">homecare</span> starts here.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#635E59]">Share your experience and the kind of work you’re looking for. Registration is free for the KES 6,000–8,000 salary band; other bands continue to secure M-Pesa payment. Paid applications enter review after payment is confirmed.</p>
        </div>
        <aside className="flex gap-4 rounded-2xl border border-[#E8DFD3] bg-white/80 p-5 shadow-[0_12px_32px_rgba(42,35,25,0.05)]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F0EA] text-[#1D432D]"><LockKeyhole className="h-5 w-5" /></span>
          <div><h2 className="font-['Outfit'] text-base font-bold text-[#1A201C]">Your information stays protected</h2><p className="mt-1.5 text-sm leading-6 text-[#635E59]">Your contact details and uploaded documents are private and only shared with our review team.</p></div>
        </aside>
      </header>

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
                <label className="text-xs font-bold text-[#514B44]">Gender *<select required value={form.gender} onChange={e => setField('gender', e.target.value as typeof form.gender)} className={inputClass}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option></select></label>
              </div>
              <div className="mt-6 rounded-2xl border border-[#E8DFD3] bg-[#FCFBF9] p-4 sm:p-5">
                <div className="mb-4">
                  <h4 className="font-['Outfit'] text-base font-bold text-[#1A201C]">Address, optional reference & emergency contact</h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#777067]">Your address and emergency contact are required. Reference details are optional and stored privately for application review; they are not included in your public profile.</p>
                </div>
                <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                  <label className="text-xs font-bold text-[#514B44] sm:col-span-2">Current residential / contact address *<textarea required minLength={5} autoComplete="street-address" rows={2} value={form.contactAddress} onChange={e => setField('contactAddress', e.target.value)} placeholder="Estate, area, town and any directions needed to contact you" className={inputClass} /></label>
                  <label className="text-xs font-bold text-[#514B44]">Reference full name (optional)<input minLength={2} autoComplete="off" value={form.referenceName} onChange={e => setField('referenceName', e.target.value)} className={inputClass} /></label>
                  <label className="text-xs font-bold text-[#514B44]">Reference relationship / workplace (optional)<input value={form.referenceRelationship} onChange={e => setField('referenceRelationship', e.target.value)} placeholder="e.g. Previous employer" className={inputClass} /></label>
                  <label className="text-xs font-bold text-[#514B44]">Reference contact number (optional)<input minLength={7} type="tel" autoComplete="off" value={form.referencePhone} onChange={e => setField('referencePhone', e.target.value)} className={inputClass} /></label>
                  <label className="text-xs font-bold text-[#514B44]">Emergency contact full name *<input required minLength={2} autoComplete="off" value={form.emergencyContactName} onChange={e => setField('emergencyContactName', e.target.value)} className={inputClass} /></label>
                  <label className="text-xs font-bold text-[#514B44]">Emergency contact number *<input required minLength={7} type="tel" autoComplete="off" value={form.emergencyContactPhone} onChange={e => setField('emergencyContactPhone', e.target.value)} className={inputClass} /></label>
                </div>
              </div>
            </section>

            <section className="border-t border-[#F0EBE5] pt-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0EA] text-[#1D432D]"><BriefcaseBusiness className="h-5 w-5" /></span>
                <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#66816D]">02 · Your work</p><h3 className="font-['Outfit'] text-lg font-bold text-[#1A201C]">Experience & preferences</h3></div>
              </div>
              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-[#514B44]">Profession *<select value={form.role} onChange={e => setField('role', e.target.value as HomecareRole)} className={inputClass}>{roles.map(role => <option value={role.value} key={role.value}>{role.label}</option>)}</select></label>
                <label className="text-xs font-bold text-[#514B44]">Preferred arrangement *<select value={form.nannyType} onChange={e => setField('nannyType', e.target.value as NannyType)} className={inputClass}><option value="live-in">Live-in</option><option value="day-care">Live-out / Day Work</option><option value="night-nurse">Night shifts</option><option value="temporary-backup">Temporary / relief</option></select></label>
                <label className="text-xs font-bold text-[#514B44]">Home area / neighbourhood *<input required minLength={2} maxLength={100} value={form.primaryEstate} onChange={e => setField('primaryEstate', e.target.value)} placeholder="Enter your town, estate, or neighbourhood" className={inputClass} /></label>
                <label className="text-xs font-bold text-[#514B44]">Years of experience *<input required type="number" min="0" max="60" value={form.experienceYears} onChange={e => setField('experienceYears', e.target.value)} className={inputClass} /></label>
                <label className="text-xs font-bold text-[#514B44]">Expected monthly salary *<select required value={form.monthlySalaryRange} onChange={e => setField('monthlySalaryRange', e.target.value)} className={inputClass}><option value="">Select a salary range</option>{salaryRanges.map(range => <option key={range} value={range}>{range}</option>)}</select><span className="mt-1 block font-normal text-[#777067]">KES 6,000–8,000 is free. Higher bands add KES 200, 250, 300, or 500 to the base fee set by Tmommycare.</span></label>
                <div className="text-xs font-bold text-[#514B44]">
                  Languages
                  <span className="font-normal text-[#91897F]"> · tap to choose all that apply</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {languageOptions.map(language => {
                      const isSelected = selectedLanguages.includes(language);
                      return (
                        <button
                          key={language}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleLanguage(language)}
                          className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                            isSelected
                              ? 'border-[#1D432D] bg-[#1D432D] text-white shadow-sm'
                              : 'border-[#D7CDBD] bg-[#FCFBF9] text-[#3D3A36] hover:border-[#1D432D] hover:text-[#1D432D]'
                          }`}
                        >
                          {language}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-4">
                <div className="text-xs font-bold text-[#514B44]">
                  Skills and experience
                  <span className="font-normal text-[#91897F]"> · choose multiple skills</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {homecareSkillOptions.map(skill => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            isSelected
                              ? 'border-[#1D432D] bg-[#1D432D] text-white shadow-sm'
                              : 'border-[#D7CDBD] bg-[#FCFBF9] text-[#3D3A36] hover:border-[#1D432D] hover:text-[#1D432D]'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <label className="text-xs font-bold text-[#514B44]">Short introduction<textarea rows={4} value={form.bio} onChange={e => setField('bio', e.target.value)} placeholder="Tell us about your work experience and the kind of role you are looking for." className={inputClass} /></label>
                <label className="text-xs font-bold text-[#514B44]">Certificate of Good Conduct reference <span className="font-normal text-[#91897F]">· if available</span><input value={form.dciGoodConductNumber} onChange={e => setField('dciGoodConductNumber', e.target.value)} className={inputClass} /></label>
              </div>
            </section>

            <section className="border-t border-[#F0EBE5] pt-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7EEE8] text-[#B8532F]"><FileLock2 className="h-5 w-5" /></span>
                <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9A7160]">03 · Documents</p><h3 className="font-['Outfit'] text-lg font-bold text-[#1A201C]">Supporting documents</h3></div>
              </div>
              <p className="mb-5 max-w-2xl text-sm leading-6 text-[#777067]">Your profile photo will appear in your public profile if approved. Other documents remain private and are only shared with administrators for application review. Photos: JPG or PNG, 5 MB maximum. Other documents: PDF, JPG, or PNG, 8 MB maximum each.</p>
              <div className="grid gap-3 sm:grid-cols-2">{documentFields.map(field => <label key={field.kind} className="group cursor-pointer rounded-2xl border border-dashed border-[#D8CFC3] bg-[#FCFBF9] p-4 transition hover:border-[#1D432D] hover:bg-[#F7FAF7]">
                <span className="flex items-start justify-between gap-2 text-xs font-bold text-[#3D3A36]">{field.label}{field.required ? ' *' : ''}<UploadCloud className="h-4 w-4 shrink-0 text-[#1D432D]" /></span>
                <span className="mt-1 block text-xs font-normal text-[#91897F]">{field.hint}</span>
                <span className="mt-4 block truncate rounded-lg border border-[#EEE9E2] bg-white px-3 py-2.5 text-xs font-semibold text-[#1D432D]">{documents[field.kind]?.name || 'Choose a file to upload'}</span>
                <input required={Boolean(field.required)} type="file" accept={field.kind === 'profile-photo' ? ".jpg,.jpeg,.png,image/jpeg,image/png" : ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"} onChange={e => setDocuments(current => ({ ...current, [field.kind]: e.target.files?.[0] || null }))} className="sr-only" />
              </label>)}</div>
            </section>

            <section className="border-t border-[#F0EBE5] pt-8">
              <div className="rounded-2xl border border-[#E8DFD3] bg-[#FCFBF9] p-4 sm:p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9A7160]">04 · Agreement & signature</p>
                <label className="mt-3 flex items-start gap-3 text-xs leading-6 text-[#635E59]">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={event => {
                      setTermsAccepted(event.target.checked);
                      if (!event.target.checked) clearSignature();
                    }}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#1D432D]"
                  />
                  <span>I confirm that the information I have provided is accurate, consent to Tmommycare reviewing my application and supporting documents, and agree to the provider application terms. If approved, I consent to my name, role, area, arrangement, experience, skills, introduction, and expected salary appearing in the public directory. My contact details and documents remain private.</span>
                </label>
                <div className="mt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor="provider-signature" className="text-xs font-bold text-[#514B44]">Draw your signature * {termsAccepted ? '' : '· agree to the terms first'}</label>
                    <button type="button" disabled={!termsAccepted} onClick={clearSignature} className="text-xs font-bold text-[#1D432D] underline disabled:cursor-not-allowed disabled:opacity-50">Clear signature</button>
                  </div>
                  <canvas
                    id="provider-signature"
                    ref={signatureCanvasRef}
                    width={700}
                    height={180}
                    aria-label="Draw your signature after agreeing to the provider terms"
                    onPointerDown={startSignature}
                    onPointerMove={drawSignature}
                    onPointerUp={finishSignature}
                    onPointerCancel={finishSignature}
                    className={`mt-2 h-36 w-full touch-none rounded-xl border border-dashed border-[#CFC5B8] bg-white ${termsAccepted ? 'cursor-crosshair' : 'cursor-not-allowed opacity-60'}`}
                  />
                  <p className="mt-2 text-xs text-[#777067]">Use your mouse, touch screen, or stylus. Your signature and agreement time will be kept with your private application for review.</p>
                </div>
              </div>
              {status === 'error' && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs text-[#777067]"><LockKeyhole className="h-4 w-4 text-[#1D432D]" /> Your documents are submitted securely</p>
                <button type="submit" disabled={status === 'sending'} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D432D] px-6 py-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(29,67,45,0.2)] transition hover:-translate-y-0.5 hover:bg-[#143020] hover:shadow-[0_14px_28px_rgba(29,67,45,0.25)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{status === 'sending' ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Submitting application…</> : <>Submit provider application <ArrowRight className="h-4 w-4" /></>}</button>
              </div>
            </section>
          </div>
      </form>
    </div>
  </main>;
};
