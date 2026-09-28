import React from 'react';
import { Target, Eye, Heart, Shield, Award, Users, CheckCircle } from 'lucide-react';

export const MissionVision: React.FC = () => {
  return (
    <section id="mission-vision" className="py-16 lg:py-24 bg-[#F9F5F0] border-y border-[#E8DFD3] relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDF5EE] text-[#1D432D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 border border-[#D7E6DA]">
            <Heart className="w-3.5 h-3.5 text-[#D96B43]" />
            <span>The MommyCare Difference</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[3.15rem] font-extrabold text-[#1A201C] tracking-[-0.04em] font-['Outfit'] leading-[1.04]">
            Elevating Childcare in Nairobi Through Clear, Trusted Standards
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-[#635E59] leading-relaxed">
            Nairobi parents deserve clear choices, reliable information, and support throughout the homecare journey.
            MommyCare was established to bring radical safety, institutional trust, and human dignity to Kenyan homes.
          </p>
        </div>

        {/* Mission and Vision Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-16 lg:mb-20">
          
          {/* Mission Card */}
          <div className="relative rounded-[28px] p-8 sm:p-10 bg-gradient-to-br from-[#FCF8F4] via-[#F8F4EE] to-[#F2EDE7] border border-[#E7DED4] shadow-[0_10px_30px_rgba(41,34,28,0.05)] hover:shadow-[0_18px_36px_rgba(41,34,28,0.08)] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#D96B43] flex items-center justify-center text-white mb-6 shadow-[0_12px_24px_rgba(217,107,67,0.28)]">
              <Target className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D96B43]">
              Our Sacred Purpose
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1A201C] mt-3 mb-5 font-['Outfit'] tracking-[-0.03em]">
              Our Mission
            </h3>
            <p className="text-base sm:text-lg text-[#3D3A36] leading-relaxed font-medium">
              “To provide Nairobi families with verified, uncompromised peace of mind by transforming domestic 
              childcare into a respected, certified profession—anchored in forensic criminal vetting, continuous 
              pediatric emergency training, and dignified, transparent compensation for our caregivers.”
            </p>
            <div className="mt-7 pt-6 border-t border-[#E0D5C7] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-[#544F49]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#D96B43]" />
                <span>Forensic Criminal Vetting (DCI)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#D96B43]" />
                <span>Pediatric Red Cross Life-Saving</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#D96B43]" />
                <span>Dignified Fair Kenyan Wages</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#D96B43]" />
                <span>90-Day Free Family Warranty</span>
              </div>
            </div>
          </div>

          {/* Vision Card */}
          <div className="relative rounded-[28px] p-8 sm:p-10 bg-gradient-to-br from-[#153D30] via-[#184B3D] to-[#0E2C24] text-white shadow-[0_20px_46px_rgba(12,44,34,0.35)] hover:shadow-[0_26px_54px_rgba(12,44,34,0.42)] transition-all duration-300 border border-[#D8E7E0]/20">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-[#F5C7A5]/30 flex items-center justify-center text-[#F6B37A] mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <Eye className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#F7C496]">
              The Future We Are Building
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-3 mb-5 font-['Outfit'] tracking-[-0.03em]">
              Our Vision
            </h3>
            <p className="text-base sm:text-lg text-white/94 leading-relaxed font-medium">
              “To establish East Africa’s benchmark gold standard in early childhood home care—fostering a 
              nurturing environment where every child blossoms under qualified, emotionally attuned care, 
              and every childcare professional is valued, legally protected, and empowered with sustainable career dignity.”
            </p>
            <div className="mt-7 pt-6 border-t border-[#EAF3EF]/15 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-white/85">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#F7C496]" />
                <span>East Africa’s Fast-Growing Child Safety Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#F7C496]" />
                <span>Accredited Childcare Academy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#F7C496]" />
                <span>Zero-Tolerance Domestic Abuse</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#F7C496]" />
                <span>Social Health & NSSF Inclusion</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4 Guiding Core Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] shadow-[0_8px_20px_rgba(26,32,28,0.02)]">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0EB] text-[#D96B43] flex items-center justify-center mb-4 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-[#1A201C] font-['Outfit']">Forensic Integrity</h4>
            <p className="mt-2 text-sm text-[#635E59] leading-relaxed">
              We never take shortcuts. Every identity document, police clearance, and medical report is verified directly with issuing institutions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] shadow-[0_8px_20px_rgba(26,32,28,0.02)]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0EA] text-[#1D432D] flex items-center justify-center mb-4 shadow-sm">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-[#1A201C] font-['Outfit']">Child-Centered Nurture</h4>
            <p className="mt-2 text-sm text-[#635E59] leading-relaxed">
              Childcare is more than basic babysitting. We train nannies in emotional co-regulation, Montessori sensory play, and balanced infant nutrition.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] shadow-[0_8px_20px_rgba(26,32,28,0.02)]">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0EB] text-[#D96B43] flex items-center justify-center mb-4 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-[#1A201C] font-['Outfit']">Caregiver Dignity</h4>
            <p className="mt-2 text-sm text-[#635E59] leading-relaxed">
              Happy, fairly compensated nannies take the best care of children. We mandate fair living wages, statutory benefits, and humane contracts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] shadow-[0_8px_20px_rgba(26,32,28,0.02)]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0EA] text-[#1D432D] flex items-center justify-center mb-4 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-[#1A201C] font-['Outfit']">Radical Accountability</h4>
            <p className="mt-2 text-sm text-[#635E59] leading-relaxed">
              Our 90-day free replacement guarantee and monthly welfare check-ins mean parents and nannies have continuous institutional support.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
