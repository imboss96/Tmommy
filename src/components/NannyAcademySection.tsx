import React, { useState } from 'react';
import { 
  GraduationCap, 
  HeartHandshake, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Award
} from 'lucide-react';

export const NannyAcademySection: React.FC = () => {
  const [applied, setApplied] = useState(false);
  const [nannyName, setNannyName] = useState('');
  const [phone, setPhone] = useState('');
  const [yearsExp, setYearsExp] = useState('3-5 Years');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#F1F5EF] py-16 text-[#1A201C] lg:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[28rem] top-[72%] h-[42rem] w-[42rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_32%_35%,#3A7950_0%,#25603C_48%,#133C28_100%)] sm:-right-[25rem] sm:top-1/2 sm:h-[62rem] sm:w-[62rem]"
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E4ECE4] text-[#31513E] text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Tmommycare Professional Academy • Fast-Growing Care Network</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] leading-tight text-[#1A201C]">
              Are You a Passionate Childcare Professional in Kenya? <br />
              <span className="text-[#F4A261]">Join East Africa's Fast-Growing Childcare Network.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#4D5A50] leading-relaxed max-w-2xl">
              Tmommycare is building a professional homecare network across Kenya.
              We never deduct commissions from a nanny’s hard-earned salary. We provide free Red Cross infant CPR 
              training, fair living wages, written legal contracts with paid leave days,
              statutory NSSF/SHA medical cover, and direct placements with verified, respectful families.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-[#34463A] pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F4A261]" />
                    <span>No Placement Deductions from Salary</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F4A261]" />
                <span>Free Red Cross Infant CPR Certification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F4A261]" />
                <span>Growing Care Network Across Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F4A261]" />
                <span>Written Legal Contracts & Paid Leave</span>
              </div>
            </div>
          </div>

          {/* Right Application Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 text-[#1A201C] shadow-2xl border border-white/20">
              {applied ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold font-['Outfit']">Application Received!</h3>
                  <p className="text-xs sm:text-sm text-[#524D47] leading-relaxed">
                    Thank you <strong>{nannyName}</strong>. Our academy intake officer will reach out via WhatsApp on 
                    <strong> {phone}</strong> for your preliminary screening and Red Cross training intake.
                  </p>
                  <button
                    onClick={() => setApplied(false)}
                    className="px-6 py-2 rounded-xl bg-[#1D432D] text-white text-xs font-bold"
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div className="border-b border-[#EFE9DF] pb-3">
                    <h3 className="font-bold text-base font-['Outfit']">
                      Quick Nanny & Caregiver Registration
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={nannyName}
                      onChange={(e) => setNannyName(e.target.value)}
                      placeholder="e.g. Mary Wanjiku"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#D96B43]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                      Phone Number (M-Pesa / WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 7..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#D96B43]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                      Years of Childcare Experience
                    </label>
                    <select
                      value={yearsExp}
                      onChange={(e) => setYearsExp(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#D96B43]"
                    >
                      <option value="1-2 Years">1 - 2 Years</option>
                      <option value="3-5 Years">3 - 5 Years</option>
                      <option value="6-10 Years">6 - 10 Years</option>
                      <option value="10+ Years">Over 10 Years</option>
                    </select>
                  </div>

                  <p className="text-[11px] text-[#7A746E] leading-tight">
                    * Requirements: Original Kenyan National ID, DCI Certificate of Good Conduct (or willingness to obtain with our guidance), and past employer references.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Apply for Academy Certification</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
