import React, { useState } from 'react';
import { 
  Calculator, 
  MapPin, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Briefcase,
  Layers,
  Baby,
  Home,
  Trees,
  Wrench,
  UtensilsCrossed,
  Shirt,
  UserCheck,
  Car
} from 'lucide-react';
import { NairobiEstate, HomecareRole, NannyType } from '../types';
import { NAIROBI_ESTATES } from '../data/estates';

export const SalaryCalculator: React.FC<{ onBookConsultation: () => void }> = ({ onBookConsultation }) => {
  const [estate, setEstate] = useState<NairobiEstate>('Kilimani');
  const [role, setRole] = useState<HomecareRole>('nanny');
  const [arrangement, setArrangement] = useState<NannyType>('live-in');
  
  // Custom role-specific toggles
  const [childrenCount, setChildrenCount] = useState<number>(1);
  const [includesCooking, setIncludesCooking] = useState<boolean>(true);
  const [includesInfantCare, setIncludesInfantCare] = useState<boolean>(false);
  const [compoundSize, setCompoundSize] = useState<'quarter' | 'half' | 'one-plus'>('quarter');
  const [includesDriving, setIncludesDriving] = useState<boolean>(false);

  return (
    <section id="salary-calculator" className="py-16 lg:py-24 bg-[#FAF7F2] border-b border-[#E8DFD3]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0EA] text-[#1D432D] text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Kenyan Labor Market & Transparency Estimator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A201C] tracking-tight font-['Outfit']">
            Nairobi Domestic & Homecare Salary Estimator
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#635E59]">
            Fair compensation retains trustworthy staff. Calculate prevailing wage benchmarks across 
            Nairobi estates, private placement rates, and contract terms with zero guesswork.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Form Column */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-[#1A201C] font-['Outfit'] flex items-center gap-2">
              <Building className="w-5 h-5 text-[#D96B43]" />
              <span>Household Requirements</span>
            </h3>

            {/* Profession Select */}
            <div>
              <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-2 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-[#1D432D]" />
                Profession / Position
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as HomecareRole)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold text-[#1A201C] focus:ring-2 focus:ring-[#D96B43]"
              >
                <option value="nanny">Vetted Nanny & Childcare Specialist</option>
                <option value="nanny">Au Pairs / Elite Nannies</option>
                <option value="temporary-backup">Holiday Relievers</option>
                <option value="house-manager">Executive House Manager</option>
                <option value="chef">Executive Private Chef</option>
                <option value="home-driver">Professional Home & Family Driver</option>
                <option value="cook-chef">Private Domestic Cook</option>
                <option value="house-girl">House Girl (Professional Housekeeper)</option>
                <option value="house-boy">House Boy (Domestic Steward)</option>
                <option value="shamba-boy">Shamba Boy (Groundskeeper & Gardener)</option>
                <option value="caretaker">Compound Caretaker & Property Custodian</option>
              </select>
            </div>

            {/* Estate Select */}
            <div>
              <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-2">
                Your Nairobi Neighborhood
              </label>
              <select
                value={estate}
                onChange={(e) => setEstate(e.target.value as NairobiEstate)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold text-[#1A201C] focus:ring-2 focus:ring-[#D96B43]"
              >
                {NAIROBI_ESTATES.map(e => (
                  <option key={e.name} value={e.name}>
                    {e.name} ({e.subCounty})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#7D766D] mt-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#D96B43]" />
                <span>Pricing is tailored to your household requirements and shared after consultation.</span>
              </p>
            </div>

            {/* Living Arrangement */}
            <div>
              <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-2">
                Living Arrangement
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setArrangement('live-in')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    arrangement === 'live-in'
                      ? 'border-[#1D432D] bg-[#E8F0EA] text-[#1D432D]'
                      : 'border-[#D5C9BA] bg-white text-[#635E59]'
                  }`}
                >
                  Full-Time Live-In
                </button>
                <button
                  type="button"
                  onClick={() => setArrangement('day-care')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    arrangement === 'day-care'
                      ? 'border-[#1D432D] bg-[#E8F0EA] text-[#1D432D]'
                      : 'border-[#D5C9BA] bg-white text-[#635E59]'
                  }`}
                >
                  Day Staff (8am - 5pm)
                </button>
              </div>
            </div>

            {/* Role specific dynamic fields */}
            {role === 'nanny' && (
              <div className="space-y-4 pt-2 border-t border-[#EFE9DF]">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs uppercase font-bold text-[#7D766D] tracking-wider">
                      Number of Children
                    </label>
                    <span className="text-sm font-extrabold text-[#1D432D]">{childrenCount} Child{childrenCount > 1 ? 'ren' : ''}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(parseInt(e.target.value))}
                    className="w-full accent-[#D96B43]"
                  />
                </div>

                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#4A453F]">
                    <input
                      type="checkbox"
                      checked={includesInfantCare}
                      onChange={(e) => setIncludesInfantCare(e.target.checked)}
                      className="rounded text-[#D96B43] focus:ring-[#D96B43]"
                    />
                    <span>Infant under 12 months</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#4A453F]">
                    <input
                      type="checkbox"
                      checked={includesCooking}
                      onChange={(e) => setIncludesCooking(e.target.checked)}
                      className="rounded text-[#D96B43] focus:ring-[#D96B43]"
                    />
                    <span>Family Cooking Duties</span>
                  </label>
                </div>
              </div>
            )}

            {role === 'shamba-boy' && (
              <div className="space-y-3 pt-2 border-t border-[#EFE9DF]">
                <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider">
                  Compound & Garden Size
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCompoundSize('quarter')}
                    className={`py-2 px-2 rounded-xl border ${compoundSize === 'quarter' ? 'bg-[#1D432D] text-white' : 'bg-white text-[#635E59] border-[#D5C9BA]'}`}
                  >
                    1/8 to 1/4 Acre
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompoundSize('half')}
                    className={`py-2 px-2 rounded-xl border ${compoundSize === 'half' ? 'bg-[#1D432D] text-white' : 'bg-white text-[#635E59] border-[#D5C9BA]'}`}
                  >
                    1/2 Acre
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompoundSize('one-plus')}
                    className={`py-2 px-2 rounded-xl border ${compoundSize === 'one-plus' ? 'bg-[#1D432D] text-white' : 'bg-white text-[#635E59] border-[#D5C9BA]'}`}
                  >
                    1+ Acre Compound
                  </button>
                </div>
              </div>
            )}

            {(role === 'house-manager' || role === 'caretaker' || role === 'house-boy') && (
              <div className="pt-2 border-t border-[#EFE9DF]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#4A453F]">
                  <input
                    type="checkbox"
                    checked={includesDriving}
                    onChange={(e) => setIncludesDriving(e.target.checked)}
                    className="rounded text-[#D96B43] focus:ring-[#D96B43]"
                  />
                  <span>Includes Errands & Driving with Valid NTSA DL</span>
                </label>
              </div>
            )}

          </div>

          {/* Breakdown Output Column */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Main Total Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#1D432D] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#1D432D] text-white text-[11px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                Fair Market Standard
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs uppercase font-bold text-[#7D766D] tracking-wider block">
                    Private Placement Pricing
                  </span>
                  <p className="text-2xl font-extrabold text-[#1A201C] font-['Outfit'] mt-1">
                    Contact us for a tailored quote
                  </p>
                </div>

                {/* Line Items Table */}
                <div className="border-t border-[#EFE9DF] pt-4 space-y-2.5 text-xs text-[#4A453F]">
                  <div className="py-1.5 bg-[#FAF7F2] px-3 rounded-xl font-bold text-sm text-[#1A201C]">
                    Final pricing depends on role, schedule, duties, and household requirements.
                  </div>
                </div>

                {/* MommyCare Assurance Note */}
                <div className="p-4 rounded-2xl bg-[#FAF0EB] border border-[#F2C2B2] text-xs text-[#2C2723] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#D96B43]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Private Agreement Terms</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    No payroll deductions from the agreed rate. Full labor contract template, 3-day paid trial, 
                    and our signature <strong>90-Day Free Replacement Guarantee</strong> included.
                  </p>
                </div>

                <button
                  onClick={onBookConsultation}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D96B43]/20 transition-all hover:scale-[1.01]"
                >
                  <span>Contact us for staff pricing</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
