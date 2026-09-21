import React from 'react';
import { ShieldCheck, XCircle, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { COMPETITOR_COMPARISON } from '../data/competitors';

export const CompetitorComparison: React.FC<{ onBookConsultation: () => void }> = ({ onBookConsultation }) => {
  return (
    <section id="why-mommycare" className="py-16 lg:py-24 bg-white border-b border-[#E8DFD3]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0EB] text-[#D96B43] text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Nairobi Market Reality</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A201C] tracking-tight font-['Outfit']">
            How MommyCare Compares With Other Care Options
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#635E59]">
            Families have different ways to find homecare support. Here is a clear, respectful comparison
            of the safeguards and services available through different care options.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-3xl border border-[#E8DFD3] shadow-md shadow-stone-200/50 bg-white">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E8DFD3] bg-[#FAF7F2]">
                <th className="p-5 font-bold text-xs uppercase tracking-wider text-[#7D766D] w-1/3">
                  Safety & Employment Standards
                </th>
                <th className="p-5 font-extrabold text-sm text-[#D96B43] bg-[#FAF0EB]/60 w-1/4">
                  <div className="flex items-center gap-1.5 font-['Outfit'] text-base">
                    <span>MommyCare Kenya</span>
                    <span className="text-[10px] bg-[#D96B43] text-white px-1.5 py-0.5 rounded font-bold uppercase">Gold Standard</span>
                  </div>
                </th>
                <th className="p-5 font-bold text-xs text-[#524D47] w-1/5">
                  Other Agencies
                </th>
                <th className="p-5 font-bold text-xs text-[#524D47] w-1/5">
                  Independent Options
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DF] text-xs sm:text-sm">
              {COMPETITOR_COMPARISON.map((item, index) => (
                <tr key={index} className="hover:bg-[#FAF7F2]/50 transition-colors">
                  <td className="p-5 font-bold text-[#1A201C]">
                    {item.feature}
                  </td>
                  
                  {/* MommyCare Column (Highlighted) */}
                  <td className="p-5 font-semibold text-[#1D432D] bg-[#FAF0EB]/20 border-x border-[#F2C2B2]/40">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item.mommyCare}</span>
                    </div>
                  </td>

                  {/* General Agencies */}
                  <td className="p-5 text-[#544F49]">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{item.generalAgencies}</span>
                    </div>
                  </td>

                  {/* Independent options */}
                  <td className="p-5 text-[#7A746E]">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{item.informalBrokers}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA Banner */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1D432D] to-[#153422] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-['Outfit']">
              Ready for Uncompromised Childcare Security?
            </h3>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              Start with our 3-Day Risk-Free Guided Trial. If the nanny is not the right fit for your home, 
              we replace them immediately at zero additional agency fee.
            </p>
          </div>
          <button
            onClick={onBookConsultation}
            className="shrink-0 px-6 py-3 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-sm tracking-wide shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>Begin 3-Day Risk-Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
