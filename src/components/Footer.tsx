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
import { TmommycareLogo } from './TmommycareLogo';

export const Footer: React.FC<{ onOpenBooking: () => void }> = ({
  onOpenBooking
}) => {
  const { siteConfig } = useContent();
  return (
    <footer className="relative overflow-hidden border-t border-[#D8E5D9] bg-gradient-to-br from-[#F6F7F1] via-[#E8F0E8] to-[#F3F4EC] pt-16 pb-12 font-['Plus_Jakarta_Sans'] text-[#34483A] shadow-[0_-14px_36px_rgba(29,67,45,0.12)]">
      <div className="relative w-full space-y-8 px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Col 1: Brand & Kenya-wide service (4 cols) */}
          <div className="space-y-4 rounded-2xl border border-white/70 bg-white/45 p-5 shadow-[0_10px_30px_rgba(29,67,45,0.07)] backdrop-blur-xl lg:col-span-4">
            <div className="inline-flex rounded-2xl border border-white/60 bg-white/95 px-2 py-1 shadow-sm">
              <TmommycareLogo 
                colorScheme="white" 
                size="md" 
                showTagline={true} 
                showLocationBadge={true} 
              />
            </div>

            <p className="text-xs sm:text-sm text-[#5D7061] leading-relaxed">
              A Kenyan homecare placement agency supporting families across the country. We help build a dignified profession through documented DCI background checks, verified employer references, and optional health screening arranged only with a candidate’s consent when requested for a placement. We also offer our signature {siteConfig.replacementWarrantyDays}-day free replacement guarantee.
            </p>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center gap-2 text-[#34483A]">
                <MapPin className="w-4 h-4 text-[#D96B43] shrink-0" />
                <span>{siteConfig.headquartersAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-[#34483A]">
                <Phone className="w-4 h-4 text-[#D96B43] shrink-0" />
                <span>Hotline: {siteConfig.hotlinePhone}</span>
              </div>
              <div className="flex items-center gap-2 text-[#34483A]">
                <Mail className="w-4 h-4 text-[#D96B43] shrink-0" />
                <span>{siteConfig.conciergeEmail}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Domestic & Homecare Services (3 cols) */}
          <div className="space-y-3 rounded-2xl border border-white/70 bg-white/45 p-5 shadow-[0_10px_30px_rgba(29,67,45,0.07)] backdrop-blur-xl lg:col-span-3">
            <h4 className="font-['Outfit'] text-xs font-bold uppercase tracking-widest text-[#B85A36]">
              Homecare Professions
            </h4>
            <ul className="space-y-2 text-xs text-[#5D7061]">
              <li><a href="/nannies" className="transition-colors hover:text-[#1D432D]">Vetted Childcare & Infant Nannies</a></li>
              <li><a href="/nannies" className="transition-colors hover:text-[#1D432D]">Executive House Managers</a></li>
              <li><a href="/nannies" className="transition-colors hover:text-[#1D432D]">House Girls (Fine Housekeepers)</a></li>
              <li><a href="/nannies" className="transition-colors hover:text-[#1D432D]">House Boys (Domestic Stewards)</a></li>
              <li><a href="/nannies" className="transition-colors hover:text-[#1D432D]">Shamba Boys (Gardeners & Grounds)</a></li>
              <li><a href="/nannies" className="transition-colors hover:text-[#1D432D]">Caretakers & Custodians</a></li>
              <li><a href="/nannies" className="transition-colors hover:text-[#1D432D]">Private Domestic Cooks & Chefs</a></li>
              <li><a href="/salary-guide" className="transition-colors hover:text-[#1D432D]">Nairobi Domestic Salary Guide</a></li>
            </ul>
          </div>

          {/* Col 3: Locations Covered (3 cols) */}
          <div className="space-y-3 rounded-2xl border border-white/70 bg-white/45 p-5 shadow-[0_10px_30px_rgba(29,67,45,0.07)] backdrop-blur-xl lg:col-span-3">
            <h4 className="font-['Outfit'] text-xs font-bold uppercase tracking-widest text-[#B85A36]">
              Areas We Cover
            </h4>
            <p className="text-[11px] leading-relaxed text-[#5D7061]">
              Placement enquiries are welcome from across Kenya. Availability is confirmed by area.
            </p>
            <p className="text-[11px] font-bold text-[#34483A]">Current Nairobi service areas:</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-[#5D7061]">
              {NAIROBI_ESTATES.map(estate => (
                <span key={estate.name} className="cursor-pointer transition-colors hover:text-[#1D432D]">
                  • {estate.name}
                </span>
              ))}
              <span className="transition-colors hover:text-[#1D432D]">• Gigiri & UN</span>
              <span className="transition-colors hover:text-[#1D432D]">• Muthaiga</span>
              <span className="transition-colors hover:text-[#1D432D]">• Kiambu Road</span>
              <span className="transition-colors hover:text-[#1D432D]">• Ruaka</span>
            </div>
          </div>

          {/* Col 4: Trust, Safety & Strategy (2 cols) */}
          <div className="space-y-3 rounded-2xl border border-white/70 bg-white/45 p-5 shadow-[0_10px_30px_rgba(29,67,45,0.07)] backdrop-blur-xl lg:col-span-2">
            <h4 className="font-['Outfit'] text-xs font-bold uppercase tracking-widest text-[#B85A36]">
              Agency Trust
            </h4>
            <div className="space-y-2 rounded-xl border border-white/70 bg-white/55 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#34483A]">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>DCI Biometric</span>
              </div>
              <p className="text-[11px] text-[#5D7061]">
                Directorate of Criminal Investigations verified certificates.
              </p>
            </div>

            <div className="space-y-2 text-xs text-[#5D7061]">
              <a href="/reviews" className="block transition-colors hover:text-[#1D432D]">Parent Reviews</a>
              <a href="/academy" className="block transition-colors hover:text-[#1D432D]">Homecare Academy</a>
              <a href="/compare-care" className="block transition-colors hover:text-[#1D432D]">Compare Care Options</a>
              <a href="/provider-apply" className="block transition-colors hover:text-[#1D432D]">Apply as a Homecare Provider</a>
            </div>

            <button
              onClick={onOpenBooking}
              className="block w-full rounded-xl bg-[#D96B43] px-3 py-2.5 text-center text-xs font-bold text-white shadow-md shadow-[#D96B43]/20 transition-all hover:bg-[#C25832]"
            >
              Book now
            </button>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#CCDCCF] pt-8 text-xs text-[#687A6C] sm:flex-row">
          <p>© {new Date().getFullYear()} Tmommycare Homecare & Domestic Staff Agency Limited (Kenya). All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <a href="/contact" className="transition-colors hover:text-[#1D432D]">Contact us</a>
            <span aria-hidden="true">&bull;</span>
            <span className="cursor-pointer transition-colors hover:text-[#1D432D]">Privacy Policy</span>
            <span>•</span>
            <span className="cursor-pointer transition-colors hover:text-[#1D432D]">Terms of Placement</span>
            <span>•</span>
            <span className="cursor-pointer transition-colors hover:text-[#1D432D]">Child & Household Safety Policy</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
