import React from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Lock, 
  ExternalLink,
  Award
} from 'lucide-react';
import { NAIROBI_ESTATES } from '../data/estates';
import { useContent } from '../context/ContentContext';
import { MommyCareLogo } from './MommyCareLogo';

export const Footer: React.FC<{ onOpenBooking: () => void }> = ({
  onOpenBooking
}) => {
  const { siteConfig } = useContent();
  return (
    <footer className="bg-[#14261B] text-[#D0DED4] pt-16 pb-12 border-t border-[#233F2E]">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Col 1: Brand & Nairobi Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <MommyCareLogo 
              colorScheme="white" 
              size="md" 
              showTagline={true} 
              showLocationBadge={true} 
            />

            <p className="text-xs sm:text-sm text-[#A8C2B0] leading-relaxed">
              Nairobi’s gold-standard vetted childcare and homecare staff agency. Transforming domestic employment into a certified, 
              dignified profession through forensic DCI biometric screening, hospital clinical diagnostics, verified employer audits, 
              and our signature {siteConfig.replacementWarrantyDays}-day free replacement guarantee.
            </p>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-4 h-4 text-[#F4A261] shrink-0" />
                <span>{siteConfig.headquartersAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Phone className="w-4 h-4 text-[#F4A261] shrink-0" />
                <span>Hotline: {siteConfig.hotlinePhone}</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Mail className="w-4 h-4 text-[#F4A261] shrink-0" />
                <span>{siteConfig.conciergeEmail}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Domestic & Homecare Services (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4A261]">
              Homecare Professions
            </h4>
            <ul className="space-y-2 text-xs text-[#A8C2B0]">
              <li><a href="/nannies" className="hover:text-white transition-colors">Vetted Childcare & Infant Nannies</a></li>
              <li><a href="/nannies" className="hover:text-white transition-colors">Executive House Managers</a></li>
              <li><a href="/nannies" className="hover:text-white transition-colors">House Girls (Fine Housekeepers)</a></li>
              <li><a href="/nannies" className="hover:text-white transition-colors">House Boys (Domestic Stewards)</a></li>
              <li><a href="/nannies" className="hover:text-white transition-colors">Shamba Boys (Gardeners & Grounds)</a></li>
              <li><a href="/nannies" className="hover:text-white transition-colors">Compound Caretakers & Custodians</a></li>
              <li><a href="/nannies" className="hover:text-white transition-colors">Private Domestic Cooks & Chefs</a></li>
              <li><a href="/salary-guide" className="hover:text-white transition-colors">Nairobi Domestic Salary Guide</a></li>
            </ul>
          </div>

          {/* Col 3: Nairobi Estates Covered (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4A261]">
              Estates Served (SEO Geo-Targeted)
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-[#A8C2B0]">
              {NAIROBI_ESTATES.map(estate => (
                <span key={estate.name} className="hover:text-white transition-colors cursor-pointer">
                  • {estate.name}
                </span>
              ))}
              <span className="hover:text-white transition-colors">• Gigiri & UN</span>
              <span className="hover:text-white transition-colors">• Muthaiga</span>
              <span className="hover:text-white transition-colors">• Kiambu Road</span>
              <span className="hover:text-white transition-colors">• Ruaka</span>
            </div>
          </div>

          {/* Col 4: Trust, Safety & Strategy (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4A261]">
              Agency Trust
            </h4>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>DCI Biometric</span>
              </div>
              <p className="text-[11px] text-[#A8C2B0]">
                Directorate of Criminal Investigations verified certificates.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <a href="/reviews" className="block hover:text-white transition-colors">Parent Reviews</a>
              <a href="/academy" className="block hover:text-white transition-colors">Homecare Academy</a>
              <a href="/compare-care" className="block hover:text-white transition-colors">Compare Care Options</a>
            </div>

            <button
              onClick={onOpenBooking}
              className="w-full py-2.5 px-3 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white text-xs font-bold text-center transition-all shadow-md shadow-[#D96B43]/20 block"
            >
              Book 3-Day Trial
            </button>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 border-t border-[#233F2E] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8BA593]">
          <p>© {new Date().getFullYear()} MommyCare Homecare & Domestic Staff Agency Limited (Kenya). All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <a href="/contact" className="hover:text-white transition-colors">Contact us</a>
            <span>â€¢</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Terms of Placement</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Child & Household Safety Policy</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
