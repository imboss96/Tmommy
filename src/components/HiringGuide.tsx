import React from 'react';
import { ArrowRight, BadgeCheck, ClipboardList, MessageCircle, SearchCheck } from 'lucide-react';

interface HiringGuideProps {
  onOpenBooking: () => void;
}

const steps = [
  {
    number: '01',
    title: 'Tell us what your household needs',
    description: 'Choose a role and share your Nairobi area, preferred live-in or day arrangement, start date, and any important skills or duties.'
  },
  {
    number: '02',
    title: 'Discuss suitable candidates',
    description: 'Our team can confirm availability and talk through the experience, references, and verification information relevant to your request.'
  },
  {
    number: '03',
    title: 'Review the terms before a trial',
    description: 'Before making a commitment, ask us to confirm the placement fee, trial arrangements, salary, duties, working hours, and replacement guarantee terms in writing.'
  },
  {
    number: '04',
    title: 'Meet and decide on the match',
    description: 'The booking form offers a three-day home trial. Use the time to assess how the professional and your household routines fit before deciding on placement.'
  }
];

export const HiringGuide: React.FC<HiringGuideProps> = ({ onOpenBooking }) => (
  <section className="border-y border-[#E8DFD3] bg-[#FAF7F2] py-16 sm:py-20" aria-labelledby="hiring-guide-title">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1D432D]">
          <ClipboardList className="h-4 w-4" /> A clear path to placement
        </div>
        <h2 id="hiring-guide-title" className="font-['Outfit'] text-3xl font-extrabold tracking-tight text-[#1A201C] sm:text-4xl">How hiring through MommyCare works</h2>
        <p className="mt-4 text-base leading-relaxed text-[#635E59]">Start with your household needs, get the details confirmed, then decide whether a candidate is the right fit.</p>
      </div>

      <ol className="mt-10 grid gap-4 md:grid-cols-2">
        {steps.map((step) => (
          <li key={step.number} className="flex gap-4 rounded-2xl border border-[#E8DFD3] bg-white p-5 sm:p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F0EA] font-['Outfit'] text-sm font-extrabold text-[#1D432D]">{step.number}</span>
            <div>
              <h3 className="font-['Outfit'] text-lg font-bold text-[#1A201C]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#635E59]">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-4 rounded-3xl bg-[#1D432D] p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex gap-4">
          <BadgeCheck className="mt-1 h-6 w-6 shrink-0 text-[#F4A261]" />
          <div>
            <h3 className="font-['Outfit'] text-xl font-bold">Get the costs and terms before you commit</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/80">Placement pricing is discussed after consultation. Ask for the full fee, what it covers, any trial costs, and the written conditions for the 90-day replacement guarantee. Agree on the worker’s salary, duties, hours, leave, and statutory contributions directly with the placement team before confirming.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <button onClick={onOpenBooking} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D96B43] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#C25832]">Discuss a placement <ArrowRight className="h-4 w-4" /></button>
          <a href="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"><MessageCircle className="h-4 w-4" /> Ask a question</a>
        </div>
      </div>
      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-[#635E59]"><SearchCheck className="h-4 w-4 shrink-0" /> Verification documents and candidate availability are confirmed with the placement team for each request.</p>
    </div>
  </section>
);
