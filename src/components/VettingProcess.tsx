import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileCheck, 
  Activity, 
  HeartPulse, 
  PhoneCall, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Building2,
  Lock
} from 'lucide-react';
import { VETTING_PILLARS } from '../data/competitors';

export const VettingProcess: React.FC = () => {
  const [activePillarIndex, setActivePillarIndex] = useState(0);
  const activePillar = VETTING_PILLARS[activePillarIndex];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-[#D96B43]" />;
      case 'FileCheck': return <FileCheck className="w-5 h-5 text-[#1D432D]" />;
      case 'Activity': return <Activity className="w-5 h-5 text-[#D96B43]" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-[#1D432D]" />;
      case 'PhoneCall': return <PhoneCall className="w-5 h-5 text-[#D96B43]" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-[#1D432D]" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-[#D96B43]" />;
      default: return <ShieldCheck className="w-5 h-5 text-[#D96B43]" />;
    }
  };

  return (
    <section id="vetting-standards" className="py-16 lg:py-24 bg-[#FAF7F2] relative">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0EB] text-[#D96B43] text-xs font-bold uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Forensic Trust Standard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A201C] tracking-tight font-['Outfit']">
            Our 7-Pillar Vetting Architecture
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#635E59]">
            Only <strong>13% of applicants</strong> pass our rigorous 7-stage screening protocol. 
            Here is the forensic due diligence performed before any caregiver steps through your front door.
          </p>
        </div>

        {/* Interactive Vetting Tabs & Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 7 Pillar Selector Buttons */}
          <div className="lg:col-span-5 space-y-2.5">
            {VETTING_PILLARS.map((pillar, index) => {
              const isSelected = activePillarIndex === index;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillarIndex(index)}
                  className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between border ${
                    isSelected 
                      ? 'bg-white border-[#D96B43] shadow-md shadow-[#D96B43]/10 ring-1 ring-[#D96B43]' 
                      : 'bg-white/60 hover:bg-white border-[#E8DFD3] hover:border-[#D5C9BA]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-[#FAF0EB]' : 'bg-[#F2EDE4]'
                    }`}>
                      {getIcon(pillar.iconName)}
                    </div>
                    <div>
                      <p className={`text-sm font-bold font-['Outfit'] ${
                        isSelected ? 'text-[#1A201C]' : 'text-[#4A453F]'
                      }`}>
                        {pillar.title}
                      </p>
                      <p className="text-xs text-[#7A746E] line-clamp-1">
                        {pillar.shortDesc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                    isSelected ? 'text-[#D96B43] translate-x-1' : 'text-[#A39B91]'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Pillar Inspector Box */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DFD3] shadow-lg shadow-stone-200/50 relative">
              
              {/* Pillar Number & Status Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-[#EFE9DF]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF0EB] flex items-center justify-center">
                    {getIcon(activePillar.iconName)}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D96B43]">
                      Stage {activePillarIndex + 1} of 7
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#1A201C] font-['Outfit']">
                      {activePillar.title}
                    </h3>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F0EA] text-[#1D432D]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activePillar.status === 'mandatory' ? 'Non-Negotiable Mandatory' : activePillar.status === 'annual-renew' ? 'Renewed Annually' : 'Forensic Phone Audit'}
                </span>
              </div>

              {/* Description */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-2">
                    What We Investigate & Verify
                  </h4>
                  <p className="text-base sm:text-lg text-[#2C2723] leading-relaxed">
                    {activePillar.fullDesc}
                  </p>
                </div>

                {/* Verification Method Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-[#1D432D] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#7D766D] uppercase tracking-wider">
                        Official Issuing / Testing Authority
                      </p>
                      <p className="text-sm font-semibold text-[#1A201C] mt-0.5">
                        {activePillar.issuingAuthority}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2 border-t border-[#E8DFD3]">
                    <ShieldCheck className="w-5 h-5 text-[#D96B43] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#7D766D] uppercase tracking-wider">
                        MommyCare Verification Protocol
                      </p>
                      <p className="text-sm font-semibold text-[#1A201C] mt-0.5">
                        {activePillar.verificationMethod}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Failure Rate Warning */}
                <div className="flex items-start gap-3 rounded-2xl border border-[#FAD9CE] bg-[#FFF8F5] p-4 text-xs leading-relaxed text-[#8C3419] sm:p-5 sm:text-sm">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#D96B43]" aria-hidden="true" />
                  <p className="max-w-2xl font-medium">
                    A discrepancy or expired record automatically disqualifies a candidate from the MommyCare Registry.
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
