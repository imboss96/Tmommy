import React, { useEffect, useRef, useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  HeartHandshake, 
  Users, 
  Search, 
  ArrowRight,
  Briefcase,
  Star,
  Home,
  UserCheck
} from 'lucide-react';
import { NairobiEstate, HomecareRole } from '../types';
import { useContent } from '../context/ContentContext';

interface HeroProps {
  onSearch: (estate: NairobiEstate | 'All Nairobi', role: string) => void;
  onOpenBooking: () => void;
  onOpenEmergency: () => void;
}

const heroSlides = [
  {
    eyebrow: 'Trusted homecare for Nairobi families',
    headline: 'Vetted, Trained, Trusted and Experienced',
    highlight: 'Homecare Professionals in the City',
    description: 'Protect your home and family with trusted care from professionals selected around your household needs.',
    points: ['DCI Biometric Clearance', 'Reference Verified', '90-Day Replacement Support'],
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=max',
    alt: 'MommyCare vetted homecare professional in Nairobi',
    caption: 'Care matched to your household',
    captionDetail: 'Nannies, household staff, and emergency cover'
  },
  {
    eyebrow: 'Professional childcare and family support',
    headline: 'Reliable Care for',
    highlight: 'Every Family Routine',
    description: 'Meet trained nannies and household professionals who bring calm, capable support to busy Nairobi homes.',
    points: ['Infant and Childcare', 'CPR and First Aid', 'Experienced Professionals'],
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1000&auto=format&fit=max',
    alt: 'Trusted care professional ready to support Nairobi families',
    caption: 'Support that fits your family',
    captionDetail: 'Childcare, household routines, and family care'
  },
  {
    eyebrow: 'Flexible household support across Nairobi',
    headline: 'Ready Help for',
    highlight: 'Home, Holidays and Busy Days',
    description: 'Choose dependable professionals for daily care, holiday cover, household management, and urgent support.',
    points: ['Holiday Relievers', 'Household Management', 'Emergency Availability'],
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=max',
    alt: 'Experienced homecare professional for Nairobi households',
    caption: 'Practical support when needed',
    captionDetail: 'Holiday relievers, household staff, and cover'
  }
];

export const Hero: React.FC<HeroProps> = ({
  onSearch,
  onOpenBooking,
  onOpenEmergency
}) => {
  const { mediaItems } = useContent();
  const [selectedEstate, setSelectedEstate] = useState<NairobiEstate | 'All Nairobi'>('All Nairobi');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [activeSlide, setActiveSlide] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const activeHeroSlide = {
    ...heroSlides[activeSlide],
    image: mediaItems.find(item => item.id === `hero-slide-${activeSlide + 1}`)?.url || heroSlides[activeSlide].image
  };
  const getSlideImage = (index: number) => mediaItems.find(item => item.id === `hero-slide-${index + 1}`)?.url || heroSlides[index].image;

  useEffect(() => {
    const autoplay = window.setInterval(() => {
      setActiveSlide(current => (current + 1) % heroSlides.length);
    }, 8000);

    return () => window.clearInterval(autoplay);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return;
    const distance = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(distance) < 40) return;

    setActiveSlide(current => (
      distance < 0
        ? (current + 1) % heroSlides.length
        : (current - 1 + heroSlides.length) % heroSlides.length
    ));
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(selectedEstate, selectedRole);
    const element = document.getElementById('nanny-directory');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-14 lg:pb-24">
      {/* Subtle organic background glow */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-[#E76F51]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-[#1D432D]/10 blur-3xl pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">
          
          {/* Left Column: Heading & Value Proposition */}
          <div key={activeSlide} className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left animate-in fade-in duration-[4000ms]" aria-live="polite">
            
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0EB] border border-[#F2C2B2] text-[#D96B43] text-xs sm:text-sm font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#D96B43]" aria-hidden="true" />
              <span>{activeHeroSlide.eyebrow}</span>
              <span className="inline-flex items-center rounded-full border border-[#1D432D]/20 bg-[#E8F0EA] px-2.5 py-1 text-xs font-extrabold text-[#1D432D] shadow-sm">
                90-Day Guarantee
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl xl:text-6xl font-extrabold text-[#1A201C] tracking-tight leading-[1.12] sm:leading-[1.15] font-['Outfit']">
              {activeHeroSlide.headline} <br className="hidden sm:inline" />
              <span className="text-[#D96B43] underline decoration-[#F4A261]/40 decoration-wavy decoration-2">
                {activeHeroSlide.highlight}
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-xl text-[#4A453F] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {activeHeroSlide.description} Enjoy our signature <span className="font-bold text-[#D96B43]">90-day free replacement guarantee</span>.
            </p>

            {/* Key Trust Pillars Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left max-w-xl mx-auto lg:mx-0 text-sm font-semibold text-[#2C2723]">
              {activeHeroSlide.points.map(point => (
                <div key={point} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2F80ED] shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Instant Match Search Box */}
            <div className="pt-4">
              <form 
                onSubmit={handleHeroSearch}
                className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl shadow-stone-200/60 border border-[#E8DFD3] grid grid-cols-1 sm:grid-cols-12 gap-3"
              >
                {/* Role / Profession Select */}
                <div className="sm:col-span-5 text-left">
                  <label className="block text-[11px] uppercase font-bold text-[#7D766D] tracking-wider mb-1 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#1D432D]" />
                    Homecare Profession
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#D96B43]/50"
                  >
                    <option value="all">All Homecare Professionals</option>
                    <option value="nanny">Vetted Nannies & Night Nurses</option>
                    <option value="nanny">Au Pairs / Elite Nannies</option>
                    <option value="temporary-backup">Holiday Relievers</option>
                    <option value="house-manager">House Managers (Executive)</option>
                    <option value="chef">Executive Private Chefs & Cooks</option>
                    <option value="home-driver">Professional Home & Family Drivers</option>
                    <option value="house-girl">House Girls / Housekeepers</option>
                    <option value="house-boy">House Boys / Domestic Stewards</option>
                    <option value="shamba-boy">Shamba Boys (Gardeners & Landscaping)</option>
                    <option value="caretaker">Compound Caretakers & Custodians</option>
                  </select>
                </div>

                {/* Estate Select */}
                <div className="sm:col-span-4 text-left">
                  <label className="block text-[11px] uppercase font-bold text-[#7D766D] tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D96B43]" />
                    Nairobi Estate
                  </label>
                  <select
                    value={selectedEstate}
                    onChange={(e) => setSelectedEstate(e.target.value as NairobiEstate | 'All Nairobi')}
                    className="w-full bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#D96B43]/50"
                  >
                    <option value="All Nairobi">All Nairobi Estates</option>
                    <option value="Kilimani">Kilimani</option>
                    <option value="Westlands">Westlands</option>
                    <option value="Karen">Karen</option>
                    <option value="Lavington">Lavington</option>
                    <option value="Kileleshwa">Kileleshwa</option>
                    <option value="Runda">Runda</option>
                    <option value="Muthaiga">Muthaiga</option>
                    <option value="South C">South C</option>
                    <option value="Parklands">Parklands</option>
                    <option value="Gigiri">Gigiri</option>
                    <option value="Kiambu Road">Kiambu Road</option>
                    <option value="Ruaka">Ruaka</option>
                  </select>
                </div>

                {/* Search CTA */}
                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#D96B43]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Search className="w-4 h-4" />
                    <span>Hire Now</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Emergency & Trial Secondary Links */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 text-xs sm:text-sm">
              <span className="text-[#635E59]">Need emergency backup staff or weekend coverage?</span>
              <button 
                onClick={onOpenEmergency}
                className="text-[#D96B43] hover:text-[#B8532F] font-bold underline inline-flex items-center gap-1"
              >
                <span>Dispatch Backup in 2-4 Hours</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div key={`visual-${activeSlide}`} className="lg:col-span-5 relative w-full animate-in slide-in-from-right duration-[4000ms]">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Visual Image Card */}
              <div
                className="relative aspect-[4/3] cursor-grab overflow-hidden bg-transparent active:cursor-grabbing touch-pan-y"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => { pointerStartX.current = null; }}
              >
                {heroSlides.map((slide, index) => (
                  <img
                    key={slide.image}
                    src={getSlideImage(index)}
                    alt={slide.alt}
                    draggable="false"
                    className={`absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-[4000ms] ease-in-out ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Overlay Caption with Multiple Roles Tagged */}
                <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="font-bold text-sm font-['Outfit']">{activeHeroSlide.caption}</p>
                        <p className="text-[11px] text-white/90">{activeHeroSlide.captionDetail}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Vetted
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5" aria-label="Hero carousel slides">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.image}
                      type="button"
                      aria-label={`Show slide ${index + 1}`}
                      aria-pressed={index === activeSlide}
                      onClick={() => setActiveSlide(index)}
                      className={`h-1.5 rounded-full transition-all ${index === activeSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/60'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Badge 1: 90-Day Free Replacement Guarantee */}
              <div className="absolute -top-3 left-2 sm:-top-4 sm:-left-6 bg-white p-2.5 sm:p-3.5 rounded-2xl shadow-xl border border-[#E8DFD3] flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#FAF0EB] flex items-center justify-center text-[#D96B43]">
                  <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-[#1A201C] font-['Outfit']">90-Day Guarantee</p>
                  <p className="text-[10px] sm:text-[11px] text-[#635E59]">Free Immediate Replacement</p>
                </div>
              </div>

              {/* Floating Badge 2: Verified Family Rating */}
              <div className="absolute -bottom-4 right-2 sm:-bottom-6 sm:-right-6 bg-white p-2.5 sm:p-3.5 rounded-2xl shadow-xl border border-[#E8DFD3] flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#E8F0EA] flex items-center justify-center text-[#1D432D]">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-[#1D432D]" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-xs sm:text-sm text-[#1A201C]">4.96 / 5.0</span>
                    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} className="w-3 h-3 fill-current" />
                      ))}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#635E59]">380+ Nairobi Estates</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Nairobi Stats Counter Bar */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-[#E8DFD3] grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
          <div className="p-3 sm:p-4 rounded-2xl bg-white/70 border border-[#EFE9DF]">
            <p className="text-xl sm:text-3xl font-extrabold text-[#1D432D] font-['Outfit']">1,200+</p>
            <p className="text-[11px] sm:text-sm font-semibold text-[#635E59] mt-0.5">Vetted Domestic Professionals</p>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white/70 border border-[#EFE9DF]">
            <p className="text-xl sm:text-3xl font-extrabold text-[#D96B43] font-['Outfit']">100%</p>
            <p className="text-[11px] sm:text-sm font-semibold text-[#635E59] mt-0.5">DCI Criminal & Medically Cleared</p>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white/70 border border-[#EFE9DF]">
            <p className="text-xl sm:text-3xl font-extrabold text-[#1D432D] font-['Outfit']">99.2%</p>
            <p className="text-[11px] sm:text-sm font-semibold text-[#635E59] mt-0.5">Trial-to-Placement Success Rate</p>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white/70 border border-[#EFE9DF]">
            <p className="text-xl sm:text-3xl font-extrabold text-[#D96B43] font-['Outfit']">&lt; 3 Hours</p>
            <p className="text-[11px] sm:text-sm font-semibold text-[#635E59] mt-0.5">Emergency Standby Dispatch</p>
          </div>
        </div>

      </div>
    </section>
  );
};
