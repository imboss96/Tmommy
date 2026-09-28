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
    <section id="vetting-standards" className="relative overflow-hidden py-16 lg:py-24 bg-[#F7F2EE]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,214,178,0.55),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(122,170,158,0.24),transparent_32%),linear-gradient(135deg,_rgba(255,255,255,0.82),_rgba(245,238,232,0.9))]" />
      <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(120deg,rgba(217,107,67,0.18),rgba(46,130,115,0.08),rgba(255,255,255,0.12))]" />
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F5D7C9] bg-white/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D96B43] shadow-[0_8px_24px_rgba(217,107,67,0.08)] backdrop-blur-xl">
            <Lock className="w-3.5 h-3.5" />
            <span>Forensic Trust Standard</span>
          </div>
          <h2 className="font-['Outfit'] text-3xl font-extrabold tracking-[-0.04em] text-[#1A201C] sm:text-4xl lg:text-[3rem]">
            Our 7-Pillar Vetting Architecture
          </h2>
          <p className="mt-4 text-base text-[#635E59] sm:text-lg">
            Only <strong>13% of applicants</strong> pass our rigorous 7-stage screening protocol. 
            Here is the forensic due diligence performed before any caregiver steps through your front door.
          </p>
        </div>

        {/* Interactive Vetting Tabs & Detail View */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          
          {/* Left Column: 7 Pillar Selector Buttons */}
          <div className="space-y-2.5 lg:col-span-5">
            {VETTING_PILLARS.map((pillar, index) => {
              const isSelected = activePillarIndex === index;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillarIndex(index)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-300 backdrop-blur-xl ${
                    isSelected 
                      ? 'border-[#D96B43] bg-white/70 shadow-[0_18px_30px_rgba(217,107,67,0.12)] ring-1 ring-[#D96B43]/80' 
                      : 'border-white/60 bg-white/35 hover:border-[#D8C7B5] hover:bg-white/55'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isSelected ? 'bg-[#FAF0EB]' : 'bg-[#F2EDE4]'
                    }`}>
                      {getIcon(pillar.iconName)}
                    </div>
                    <div>
                      <p className={`font-['Outfit'] text-sm font-bold ${
                        isSelected ? 'text-[#1A201C]' : 'text-[#4A453F]'
                      }`}>
                        {pillar.title}
                      </p>
                      <p className="line-clamp-1 text-xs text-[#7A746E]">
                        {pillar.shortDesc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${
                    isSelected ? 'translate-x-1 text-[#D96B43]' : 'text-[#A39B91]'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Pillar Inspector Box */}
          <div className="lg:col-span-7">
            <div className="relative rounded-[28px] border border-white/60 bg-white/55 p-6 shadow-[0_30px_60px_rgba(43,32,24,0.10)] backdrop-blur-2xl sm:p-10">
              <div className="absolute inset-0 rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(255,255,255,0.12))]" />
              <div className="relative">
                {/* Pillar Number & Status Badge */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE9DF] pb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF0EB] shadow-inner shadow-[#D96B43]/10">
                      {getIcon(activePillar.iconName)}
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D96B43]">
                        Stage {activePillarIndex + 1} of 7
                      </span>
                      <h3 className="font-['Outfit'] text-xl font-bold text-[#1A201C] sm:text-2xl">
                        {activePillar.title}
                      </h3>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0EA] px-3 py-1 text-xs font-bold text-[#1D432D]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {activePillar.status === 'mandatory' ? 'Non-Negotiable Mandatory' : activePillar.status === 'annual-renew' ? 'Renewed Annually' : 'Forensic Phone Audit'}
                  </span>
                </div>

                {/* Description */}
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7D766D]">
                      What We Investigate & Verify
                    </h4>
                    <p className="text-base leading-relaxed text-[#2C2723] sm:text-lg">
                      {activePillar.fullDesc}
                    </p>
                  </div>

                  {/* Verification Method Box */}
                  <div className="space-y-3 rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2]/90 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1D432D]" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7D766D]">
                          Official Issuing / Testing Authority
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-[#1A201C]">
                          {activePillar.issuingAuthority}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 border-t border-[#E8DFD3] pt-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#D96B43]" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7D766D]">
                          MommyCare Verification Protocol
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-[#1A201C]">
                          {activePillar.verificationMethod}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
