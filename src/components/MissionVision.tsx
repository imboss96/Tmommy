import React from 'react';
import { Target, Eye, Heart, Shield, Award, Users, CheckCircle } from 'lucide-react';

export const MissionVision: React.FC = () => {
  return (
    <section id="mission-vision" className="py-16 lg:py-24 bg-white border-y border-[#E8DFD3] relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0EA] text-[#1D432D] text-xs font-bold uppercase tracking-wider mb-3">
            <Heart className="w-3.5 h-3.5 text-[#D96B43]" />
            <span>The MommyCare Difference</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A201C] tracking-tight font-['Outfit']">
            Elevating Childcare in Nairobi Through Clear, Trusted Standards
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#635E59] leading-relaxed">
            Nairobi parents deserve clear choices, reliable information, and support throughout the homecare journey.
            MommyCare was established to bring radical safety, institutional trust, and human dignity to Kenyan homes.
          </p>
        </div>

        {/* Mission and Vision Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* Mission Card */}
          <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#FAF7F2] to-[#F5EFEB] border border-[#E8DFD3] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-[#D96B43] flex items-center justify-center text-white mb-6 shadow-md shadow-[#D96B43]/20">
              <Target className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D96B43]">
              Our Sacred Purpose
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1A201C] mt-2 mb-4 font-['Outfit']">
              Our Mission
            </h3>
            <p className="text-base sm:text-lg text-[#3D3A36] leading-relaxed font-medium">
              “To provide Nairobi families with verified, uncompromised peace of mind by transforming domestic 
              childcare into a respected, certified profession—anchored in forensic criminal vetting, continuous 
              pediatric emergency training, and dignified, transparent compensation for our caregivers.”
            </p>
            <div className="mt-6 pt-6 border-t border-[#E0D5C7] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-[#544F49]">
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
          <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#1D432D] to-[#142F1F] text-white shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#F4A261] mb-6">
              <Eye className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#F4A261]">
              The Future We Are Building
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-4 font-['Outfit']">
              Our Vision
            </h3>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed font-medium">
              “To establish East Africa’s benchmark gold standard in early childhood home care—fostering a 
              nurturing environment where every child blossoms under qualified, emotionally attuned care, 
              and every childcare professional is valued, legally protected, and empowered with sustainable career dignity.”
            </p>
            <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#F4A261]" />
                <span>East Africa’s Fast-Growing Child Safety Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#F4A261]" />
                <span>Accredited Childcare Academy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#F4A261]" />
                <span>Zero-Tolerance Domestic Abuse</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#F4A261]" />
                <span>Social Health & NSSF Inclusion</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4 Guiding Core Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3]">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0EB] text-[#D96B43] flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-[#1A201C] font-['Outfit']">Forensic Integrity</h4>
            <p className="mt-2 text-sm text-[#635E59] leading-relaxed">
              We never take shortcuts. Every identity document, police clearance, and medical report is verified directly with issuing institutions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0EA] text-[#1D432D] flex items-center justify-center mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-[#1A201C] font-['Outfit']">Child-Centered Nurture</h4>
            <p className="mt-2 text-sm text-[#635E59] leading-relaxed">
              Childcare is more than basic babysitting. We train nannies in emotional co-regulation, Montessori sensory play, and balanced infant nutrition.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3]">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0EB] text-[#D96B43] flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-[#1A201C] font-['Outfit']">Caregiver Dignity</h4>
            <p className="mt-2 text-sm text-[#635E59] leading-relaxed">
              Happy, fairly compensated nannies take the best care of children. We mandate fair living wages, statutory benefits, and humane contracts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0EA] text-[#1D432D] flex items-center justify-center mb-4">
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
