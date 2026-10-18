import React, { useState } from 'react';
import { FileDown, FileSignature, Printer, X } from 'lucide-react';
import { getAdminAuthHeaders } from '../../lib/adminAuth';
import { getApiBaseUrl } from '../../lib/api';

export interface ProviderDocumentProfile {
  name: string;
  email?: string;
  phone?: string;
  role: string;
  roleTitle?: string;
  nannyType?: string;
  primaryEstate?: string;
  age?: number;
  experienceYears?: number;
  monthlySalaryKsh?: number;
  monthlySalaryRange?: string;
  languages?: string[];
  skills?: string[];
  bio?: string;
  education?: string;
  certifications?: string[];
  avatar?: string;
}

interface ContractDetails {
  contractNumber: string;
  nationalId: string;
  clientName: string;
  serviceLocation: string;
  startDate: string;
  monthlyPay: string;
  workSchedule: string;
  restDays: string;
  duties: string;
}

const roleName: Record<string, string> = {
  nanny: 'Nanny / childcare provider',
  babysitter: 'Babysitter',
  'house-manager': 'House manager',
  'house-girl': 'Housekeeper',
  mamafua: 'Mamafua (One-Time Housekeeper)',
  'house-boy': 'Domestic steward',
  'shamba-boy': 'Gardener / groundskeeper',
  caretaker: 'Caretaker',
  'cook-chef': 'Cook / chef',
  chef: 'Chef',
  'home-driver': 'Family driver',
  'temporary-backup': 'Temporary care provider'
};

export const getProviderRoleName = (role: string, fallback?: string) =>
  roleName[role] || fallback || role;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character] || character);

const createDatedStamp = (date: string): Promise<string> => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Could not prepare the dated company stamp.'));
      return;
    }

    context.drawImage(image, 0, 0);
    context.font = 'bold 25px Georgia, serif';
    const maxWidth = canvas.width * 0.54;
    const textWidth = context.measureText(date).width;
    context.save();
    context.translate(canvas.width / 2, canvas.height * 0.704);
    context.scale(Math.min(1, maxWidth / textWidth), 1);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineJoin = 'round';
    context.lineWidth = 2;
    context.strokeStyle = '#fff';
    context.strokeText(date, 0, 0);
    context.fillStyle = '#0757bb';
    context.fillText(date, 0, 0);
    context.restore();

    resolve(canvas.toDataURL('image/png'));
  };
  image.onerror = () => reject(new Error('Could not load the company stamp image.'));
  image.src = new URL('/STAMP.png', window.location.href).href;
});

const printDocument = async (title: string, content: string, stampDate?: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) throw new Error('Allow pop-ups for this site to prepare the PDF.');

  const logoUrl = new URL('/mommycare-logo-transparent.png', window.location.href).href;
  let stampUrl = new URL('/STAMP.png', window.location.href).href;
  try {
    if (stampDate) stampUrl = await createDatedStamp(stampDate);
  } catch (error) {
    printWindow.close();
    throw error;
  }
  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(title)}</title>
        <style>
          :root { color: #202923; font-family: Arial, Helvetica, sans-serif; }
          * { box-sizing: border-box; }
          body { margin: 0; background: #f3f2ef; color: #202923; font-size: 10pt; line-height: 1.5; }
          .document { width: 210mm; min-height: 297mm; margin: 18px auto; padding: 18mm 19mm; background: #fff; }
          .brand { display: flex; justify-content: space-between; align-items: center; gap: 20px; border-bottom: 4px solid #1d432d; padding-bottom: 12px; }
          .brand-logo { display: block; width: 235px; height: 78px; object-fit: contain; object-position: left center; }
          .muted { color: #626a64; font-size: 8.5pt; }
          .reference { color: #273a2e; font-size: 9pt; font-weight: 700; text-align: right; overflow-wrap: anywhere; }
          h1 { margin: 20px 0 4px; color: #1d432d; font-size: 17pt; letter-spacing: .06em; }
          h2 { margin: 17px 0 7px; color: #1d432d; font-size: 10pt; letter-spacing: .04em; text-transform: uppercase; }
          p { margin: 6px 0; }
          .meta { margin: 13px 0; padding: 10px 12px; background: #f5f7f4; border-left: 3px solid #d96b43; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
          .field { border-bottom: 1px solid #d9ddd9; padding-bottom: 3px; }
          .field strong { display: inline-block; min-width: 112px; color: #39453d; }
          ul { margin: 5px 0 8px; padding-left: 18px; }
          li { margin: 3px 0; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 28px; }
          .signature { min-height: 74px; border-bottom: 1px solid #59615b; padding-top: 38px; }
          .signature span { display: block; color: #626a64; font-size: 8pt; }
          .company-signature { position: relative; min-height: 136px; padding-right: 118px; }
          .company-stamp { position: absolute; top: 0; right: 0; width: 112px; height: 107px; }
          .company-stamp img { display: block; width: 100%; height: 100%; object-fit: fill; }
          .footer { margin-top: 22px; border-top: 1px solid #d9ddd9; padding-top: 8px; color: #626a64; font-size: 8pt; }
          .cv-header { display: flex; align-items: center; gap: 18px; margin: 18px 0 20px; }
          .cv-photo { width: 86px; height: 86px; flex: 0 0 86px; border-radius: 50%; object-fit: cover; border: 2px solid #dce7de; }
          .cv-role { margin: 0; color: #d96b43; font-size: 11pt; font-weight: 700; }
          .chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 7px 0; }
          .chip { padding: 3px 8px; border-radius: 12px; background: #edf3ee; color: #1d432d; font-size: 8.5pt; }
          @page { size: A4; margin: 0; }
          @media print { body { background: #fff; } .document { width: auto; min-height: 0; margin: 0; padding: 17mm 19mm; } }
          @media screen { .document { box-shadow: 0 8px 28px #1a201c1a; } }
        </style>
      </head>
      <body>${content
        .replaceAll('__Tmommycare_LOGO_URL__', escapeHtml(logoUrl))
        .replaceAll('__Tmommycare_STAMP_URL__', escapeHtml(stampUrl))}</body>
    </html>`);
  printWindow.addEventListener('load', () => {
    printWindow.focus();
    printWindow.print();
  }, { once: true });
  printWindow.document.close();
};

export const printProviderCv = async (profile: ProviderDocumentProfile) => {
  const skills = (profile.skills || []).filter(Boolean);
  const languages = (profile.languages || []).filter(Boolean);
  const certifications = (profile.certifications || []).filter(Boolean);
  const title = getProviderRoleName(profile.role, profile.roleTitle);
  const photo = profile.avatar
    ? `<img class="cv-photo" src="${escapeHtml(profile.avatar)}" alt="">`
    : '';

  await printDocument(`${profile.name} - CV`, `
    <main class="document">
      <header class="brand">
        <img class="brand-logo" src="__Tmommycare_LOGO_URL__" alt="Tmommycare — Quality Care. Safer Homes.">
        <div class="reference">PROVIDER PROFILE<br>CURRICULUM VITAE</div>
      </header>
      <section class="cv-header">
        ${photo}
        <div>
          <h1>${escapeHtml(profile.name)}</h1>
          <p class="cv-role">${escapeHtml(title)}</p>
          <p class="muted">${[profile.primaryEstate, profile.phone, profile.email].filter(Boolean).map(value => escapeHtml(value!)).join(' · ')}</p>
        </div>
      </section>
      <section>
        <h2>Professional Profile</h2>
        <p>${escapeHtml(profile.bio?.trim() || `${profile.name} is a ${title.toLowerCase()}${profile.experienceYears !== undefined ? ` with ${profile.experienceYears} years of experience` : ''}.`)}</p>
      </section>
      <section>
        <h2>Experience</h2>
        <p><strong>${profile.experienceYears ?? 'Not provided'} years</strong> of experience in ${escapeHtml(title.toLowerCase())}.</p>
        ${profile.nannyType ? `<p>Preferred arrangement: ${escapeHtml(profile.nannyType.replaceAll('-', ' '))}</p>` : ''}
        ${profile.primaryEstate ? `<p>Preferred location: ${escapeHtml(profile.primaryEstate)}</p>` : ''}
      </section>
      ${profile.education ? `<section><h2>Education</h2><p>${escapeHtml(profile.education)}</p></section>` : ''}
      ${certifications.length ? `<section><h2>Training & Certifications</h2><ul>${certifications.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>` : ''}
      ${skills.length ? `<section><h2>Skills</h2><div class="chips">${skills.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join('')}</div></section>` : ''}
      ${languages.length ? `<section><h2>Languages</h2><p>${languages.map(escapeHtml).join(', ')}</p></section>` : ''}
      <footer class="footer">Prepared from the provider profile on ${escapeHtml(new Date().toLocaleDateString())}. Contact details are included for placement discussion.</footer>
    </main>`);
};

export const ProviderCvButton: React.FC<{ profile: ProviderDocumentProfile; className?: string }> = ({ profile, className = '' }) => {
  const [error, setError] = useState('');

  const handlePrint = async () => {
    setError('');
    try {
      await printProviderCv(profile);
    } catch (printError) {
      setError(printError instanceof Error ? printError.message : 'Could not prepare the provider CV.');
    }
  };

  return <span className="inline-flex flex-col items-start gap-1">
    <button type="button" onClick={handlePrint} className={className || 'inline-flex items-center gap-1.5 rounded-lg border border-[#D5C9BA] bg-white px-3 py-2 text-xs font-bold text-[#1D432D] hover:bg-[#FAF7F2]'}>
      <FileDown className="h-4 w-4" /> Prepare PDF CV
    </button>
    {error && <span role="alert" className="text-xs text-red-700">{error}</span>}
  </span>;
};

export const ProviderContractButton: React.FC<{ profile: ProviderDocumentProfile }> = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [assigningNumber, setAssigningNumber] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState<ContractDetails>(() => ({
    contractNumber: '',
    nationalId: '',
    clientName: '',
    serviceLocation: profile.primaryEstate || '',
    startDate: '',
    monthlyPay: profile.monthlySalaryKsh ? String(profile.monthlySalaryKsh) : '',
    workSchedule: '',
    restDays: '',
    duties: `Provide professional ${roleName[profile.role] || profile.roleTitle || profile.role} services as agreed with the assigned household.`
  }));
  const title = getProviderRoleName(profile.role, profile.roleTitle);

  const update = (key: keyof ContractDetails, value: string) => {
    setDetails(current => ({ ...current, [key]: value }));
  };

  const handleOpen = async () => {
    setAssigningNumber(true);
    setError('');
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/contract-number`, {
        method: 'POST',
        headers: getAdminAuthHeaders()
      });
      const result: { contractNumber?: string; error?: string } = await response.json().catch(() => ({}));
      if (!response.ok || typeof result.contractNumber !== 'string') {
        throw new Error(result.error || 'Could not assign a contract number.');
      }
      const contractNumber = result.contractNumber;
      setDetails(current => ({ ...current, contractNumber }));
      setIsOpen(true);
    } catch (allocationError) {
      setError(allocationError instanceof Error ? allocationError.message : 'Could not assign a contract number.');
    } finally {
      setAssigningNumber(false);
    }
  };

  const handlePrint = async () => {
    if (!details.contractNumber.trim() || details.contractNumber.trim().endsWith('-') || !details.startDate || !details.monthlyPay.trim() || !details.workSchedule.trim() || !details.restDays.trim()) {
      setError('Complete the contract number, start date, pay, work schedule, and rest days before preparing the agreement.');
      return;
    }
    const pay = Number(details.monthlyPay);
    if (!Number.isFinite(pay) || pay <= 0) {
      setError('Enter a valid monthly pay amount greater than zero.');
      return;
    }
    setError('');

    const value = (text: string) => escapeHtml(text.trim() || 'To be agreed in writing');
    const date = (text: string) => text ? escapeHtml(new Date(`${text}T00:00:00`).toLocaleDateString()) : 'To be agreed';
    const stampDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    const payText = `KES ${pay.toLocaleString()} per month`;

    try {
      await printDocument(`${details.contractNumber} - ${profile.name}`, `
        <main class="document">
          <header class="brand">
            <img class="brand-logo" src="__Tmommycare_LOGO_URL__" alt="Tmommycare — Quality Care. Safer Homes.">
            <div class="reference">SERVICE PROVIDER AGREEMENT<br>${value(details.contractNumber)}</div>
          </header>
          <h1>SERVICE PROVIDER AGREEMENT</h1>
          <p class="muted">Contract number: <strong>${value(details.contractNumber)}</strong></p>
          <p>This agreement is made on ${escapeHtml(new Date().toLocaleDateString())} and takes effect on ${date(details.startDate)}.</p>
          <section class="meta meta-grid">
            <div class="field"><strong>Service Provider</strong> ${escapeHtml(profile.name)}</div>
            <div class="field"><strong>National ID / Passport</strong> ${value(details.nationalId)}</div>
            <div class="field"><strong>Telephone / Email</strong> ${[profile.phone, profile.email].filter(Boolean).map(item => escapeHtml(item!)).join(' · ') || 'To be agreed in writing'}</div>
            <div class="field"><strong>Position</strong> ${escapeHtml(title)}</div>
            <div class="field"><strong>Assigned household</strong> ${value(details.clientName)}</div>
            <div class="field"><strong>Service location</strong> ${value(details.serviceLocation)}</div>
          </section>
          <p><strong>BETWEEN:</strong> Tmommycare Nairobi, referred to in this agreement as “Tmommycare”; and <strong>${escapeHtml(profile.name)}</strong>, referred to as the “Service Provider”. The parties agree as follows:</p>
          <h2>Definitions</h2>
          <ul>
            <li><strong>Tmommycare:</strong> Tmommycare Nairobi, coordinating the introduction and placement.</li>
            <li><strong>Service Provider:</strong> ${escapeHtml(profile.name)}, providing the services described in this agreement.</li>
            <li><strong>Assigned Household:</strong> the household identified above where the agreed services will be performed.</li>
          </ul>
          <h2>1. Appointment and assignment</h2>
          <p>Tmommycare introduces the Service Provider for the service assignment described in this agreement. The Service Provider will provide the agreed ${escapeHtml(title.toLowerCase())} services to the assigned household. The household, duties, work arrangements, and any changes must be confirmed with the relevant parties in writing.</p>
          <h2>2. Service details</h2>
          <div class="meta">
            <p><strong>Commencement:</strong> ${date(details.startDate)}</p>
            <p><strong>Monthly pay:</strong> ${payText}</p>
            <p><strong>Work schedule:</strong> ${value(details.workSchedule)}</p>
            <p><strong>Rest days:</strong> ${value(details.restDays)}</p>
            <p><strong>Agreed duties:</strong> ${value(details.duties)}</p>
          </div>
          <h2>3. Service Provider responsibilities</h2>
          <ul>
            <li>Perform the agreed duties with reasonable care, professionalism, and respect for the household’s routines and property.</li>
            <li>Follow reasonable safety instructions and promptly communicate any incident, absence, or concern affecting the service.</li>
            <li>Keep household, family, and child information confidential and use it only to perform the agreed duties.</li>
            <li>Not accept duties or working arrangements that materially differ from those agreed without discussing them with the household and Tmommycare.</li>
          </ul>
          <h2>4. Household and Tmommycare responsibilities</h2>
          <ul>
            <li>The household will explain duties, routines, work arrangements, and applicable safety requirements before service begins.</li>
            <li>Payment arrangements, including payment date and method, must be agreed directly and recorded by the relevant parties.</li>
            <li>Tmommycare will provide placement coordination and receive concerns about the assignment for follow-up.</li>
          </ul>
          <h2>5. Pay, working time, and rest</h2>
          <p>The pay, work schedule, and rest days set out above are the agreed terms for this assignment. Any additional hours, deductions, benefits, leave, or changes must be discussed and documented in writing by the parties concerned, in line with applicable law.</p>
          <h2>6. Safety, conduct, and confidentiality</h2>
          <p>The Service Provider will observe household safety instructions, maintain appropriate professional boundaries, and protect confidential information during and after the assignment. Concerns about safety or conduct should be raised promptly with the household and Tmommycare.</p>
          <h2>7. Changes and ending the assignment</h2>
          <p>Any change to this agreement should be recorded in writing. The parties should give reasonable written notice before ending the assignment, except where urgent safety concerns or applicable law require otherwise. Outstanding pay and any handover arrangements should be discussed promptly.</p>
          <h2>8. Concerns and resolution</h2>
          <p>The parties will first try to resolve concerns through prompt, respectful discussion, with Tmommycare available to assist with placement-related issues. Nothing in this agreement limits any rights or obligations provided by applicable law.</p>
          <h2>9. Acknowledgement</h2>
          <p>Each signatory confirms they have read and understood this agreement, had an opportunity to ask questions, and received a copy. This template should be completed and reviewed before signing.</p>
          <section class="signatures">
            <div class="signature"><strong>Service Provider: ${escapeHtml(profile.name)}</strong><span>Signature · Date</span></div>
            <div class="signature company-signature">
              <strong>Tmommycare representative</strong>
              <span>Name · Signature · Date</span>
              <div class="company-stamp">
                <img src="__Tmommycare_STAMP_URL__" alt="Tmommycare company stamp">
              </div>
            </div>
            <div class="signature"><strong>Household representative</strong><span>Name · Signature · Date</span></div>
            <div class="signature"><strong>Witness</strong><span>Name · Signature · Date</span></div>
          </section>
          <footer class="footer">Draft for completion and review before signing. This template does not replace advice from a qualified Kenyan employment or legal professional.</footer>
        </main>`, stampDate);
      setIsOpen(false);
    } catch (printError) {
      setError(printError instanceof Error ? printError.message : 'Could not prepare the service provider agreement.');
    }
  };

  const inputClass = 'mt-1.5 w-full rounded-xl border border-[#D5C9BA] bg-white px-3 py-2 text-sm text-[#1A201C]';

  return <>
    <button type="button" disabled={assigningNumber} onClick={() => void handleOpen()} className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5C9BA] bg-white px-3 py-2 text-xs font-bold text-[#1D432D] hover:bg-[#FAF7F2] disabled:cursor-wait disabled:opacity-60">
      <FileSignature className="h-4 w-4" /> {assigningNumber ? 'Assigning number…' : 'Prepare contract'}
    </button>
    {error && !isOpen && <span role="alert" className="mt-1 block text-xs text-red-700">{error}</span>}
    {isOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#17221bb3] p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setIsOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="provider-contract-title" className="my-auto w-full max-w-3xl rounded-2xl bg-[#FAF7F2] p-5 shadow-2xl sm:p-7">
        <header className="flex items-start justify-between gap-4">
          <div><h2 id="provider-contract-title" className="font-['Outfit'] text-2xl font-extrabold text-[#1A201C]">Prepare service provider contract</h2><p className="mt-1 text-sm text-[#635E59]">Complete assignment terms, then print or save the agreement as a PDF.</p></div>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Close contract form" className="rounded-lg p-2 text-[#635E59] hover:bg-white"><X className="h-5 w-5" /></button>
        </header>
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-bold text-[#635E59]">Auto-assigned contract number<input value={details.contractNumber} readOnly className={`${inputClass} cursor-not-allowed bg-[#F2ECE1] font-bold`} /></label>
          <label className="text-xs font-bold text-[#635E59]">Provider National ID / Passport<input value={details.nationalId} onChange={event => update('nationalId', event.target.value)} className={inputClass} /></label>
          <label className="text-xs font-bold text-[#635E59]">Assigned household / client<input value={details.clientName} onChange={event => update('clientName', event.target.value)} className={inputClass} /></label>
          <label className="text-xs font-bold text-[#635E59]">Service location<input value={details.serviceLocation} onChange={event => update('serviceLocation', event.target.value)} className={inputClass} /></label>
          <label className="text-xs font-bold text-[#635E59]">Start date<input type="date" value={details.startDate} onChange={event => update('startDate', event.target.value)} className={inputClass} required /></label>
          <label className="text-xs font-bold text-[#635E59]">Monthly pay (KES)<input type="number" min="1" value={details.monthlyPay} onChange={event => update('monthlyPay', event.target.value)} className={inputClass} required /></label>
          <label className="text-xs font-bold text-[#635E59]">Work schedule<input value={details.workSchedule} onChange={event => update('workSchedule', event.target.value)} placeholder="e.g. Monday–Saturday, 8:00 am–5:00 pm" className={inputClass} required /></label>
          <label className="text-xs font-bold text-[#635E59]">Rest days<input value={details.restDays} onChange={event => update('restDays', event.target.value)} placeholder="e.g. Sunday" className={inputClass} required /></label>
          <label className="text-xs font-bold text-[#635E59] sm:col-span-2">Agreed duties<textarea value={details.duties} onChange={event => update('duties', event.target.value)} rows={3} className={inputClass} /></label>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-[#635E59]">The printed agreement is a template. Confirm all terms and obtain appropriate legal review before signing.</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl border border-[#D5C9BA] bg-white px-4 py-2.5 text-sm font-bold text-[#3D3A36]">Cancel</button>
          <button type="button" onClick={handlePrint} className="inline-flex items-center gap-2 rounded-xl bg-[#1D432D] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#173824]"><Printer className="h-4 w-4" /> Print / Save PDF</button>
        </div>
      </section>
    </div>}
  </>;
};
