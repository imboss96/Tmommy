import React from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  FileCheck, 
  Activity, 
  HeartPulse, 
  PhoneCall, 
  BadgeCheck, 
  Building2,
  Lock,
  FileBadge,
  Briefcase
} from 'lucide-react';
import { NannyProfile } from '../types';

interface VettingBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nanny: NannyProfile | null;
  onBookTrial: (nanny: NannyProfile) => void;
}

export const VettingBadgeModal: React.FC<VettingBadgeModalProps> = ({
  isOpen,
  onClose,
  nanny,
  onBookTrial
}) => {
  if (!isOpen || !nanny) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#D5C9BA] max-w-2xl w-full shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-[#1D432D] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-['Outfit']">
                  Official Verification File
                </h2>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                  Audited & Active
                </span>
              </div>
              <p className="text-xs text-white/80">
                Candidate: {nanny.name} • {nanny.categoryLabel} • {nanny.primaryEstate}, Nairobi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Top Profile Summary */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3]">
            <img
              src={nanny.avatar}
              alt={nanny.name}
              className="w-16 h-16 rounded-2xl object-cover shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#1A201C] font-['Outfit'] flex items-center gap-1.5">
                  {nanny.name}
                  <BadgeCheck className="w-5 h-5 text-[#2F80ED]" />
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#1D432D] text-white text-[10px] font-bold">
                  {nanny.categoryLabel}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#D96B43] mt-0.5">{nanny.roleTitle}</p>
              <p className="text-xs text-[#635E59] mt-0.5">{nanny.tagline}</p>
              <p className="text-xs font-semibold text-[#1D432D] mt-1">
                {nanny.experienceYears} Years Documented Experience • Education: {nanny.education}
              </p>
            </div>
          </div>

          {/* Vetting Checklist Matrix */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-bold text-[#7D766D] tracking-wider">
              Forensic Investigation & Documentation Records
            </h4>

            {/* 1. DCI Criminal Records */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#1D432D]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1. DCI Police Certificate of Good Conduct</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Verified Clean Record
                </span>
              </div>
              <p className="text-xs text-[#35523D]">
                Certificate Reference: <strong className="font-mono">{nanny.dciGoodConductNumber}</strong> (Issued: {nanny.dciIssueDate})
              </p>
              <p className="text-[11px] text-[#52705B]">
                Cross-referenced with Directorate of Criminal Investigations headquarters biometric archives. Zero criminal history, zero property theft offenses, and zero cautions.
              </p>
            </div>

            {/* 2. Medical Clinical Screen */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#1D432D]">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>2. Hospital Clinical Diagnostic Panel</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Cleared Fit for Domestic Placement
                </span>
              </div>
              <p className="text-xs text-[#35523D]">
                Laboratory Clearances: <strong>{nanny.medicalClearanceDate}</strong>
              </p>
              <p className="text-[11px] text-[#52705B]">
                Screened for Pulmonary TB (Chest X-Ray / Sputum), Hepatitis B Surface Antigen, Food-Handlers Salmonella & Stool Parasitology at accredited Nairobi hospitals. All negative.
              </p>
            </div>

            {/* 3. First Aid & Safety Certification */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#1D432D]">
                  <HeartPulse className="w-4 h-4 text-emerald-600" />
                  <span>3. First Aid & Life-Saving Certification</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Active CPR License
                </span>
              </div>
              <p className="text-xs text-[#35523D]">
                Certificate Serial: <strong className="font-mono">{nanny.firstAidCertNumber}</strong>
              </p>
              <p className="text-[11px] text-[#52705B]">
                Practical hands-on training in choking relief, burn intervention, household emergency evacuation, and first responder protocols.
              </p>
            </div>

            {/* 4. Verified Employer References */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#1D432D]">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <span>4. Deep Past Employer Reference Audit</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {nanny.verifiedReferenceCount} Employers Audited
                </span>
              </div>
              <p className="text-xs text-[#35523D]">
                All {nanny.verifiedReferenceCount} previous residential employers directly interviewed via phone by MommyCare senior coordinators verifying honesty, punctuality, and work ethic.
              </p>
              <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-[11px] italic text-[#2D4A35]">
                “{nanny.name.split(' ')[0]} was exceptionally trustworthy, honest with compound property and groceries, and diligent throughout their tenure with us.” — Verified Nairobi Residential Employer
              </div>
            </div>

          </div>

        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-6 bg-[#FAF7F2] border-t border-[#E8DFD3] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#7D766D] uppercase tracking-wider block">Fair Monthly Compensation</span>
            <span className="text-base font-extrabold text-[#1A201C] font-['Outfit']">
              KES {nanny.monthlySalaryKsh.toLocaleString()} / month
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              onBookTrial(nanny);
            }}
            className="px-6 py-3 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#D96B43]/20 transition-all hover:scale-105"
          >
            Start 3-Day Trial with {nanny.name.split(' ')[0]}
          </button>
        </div>

      </div>
    </div>
  );
};
