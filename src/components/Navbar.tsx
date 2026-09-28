import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Phone, 
  AlertCircle, 
  Menu, 
  X, 
  Search, 
  HeartHandshake, 
  Award, 
  Calculator,
  Compass,
  BookOpen,
  Users
} from 'lucide-react';
import { NairobiEstate } from '../types';
import { useContent } from '../context/ContentContext';
import { MommyCareLogo } from './MommyCareLogo';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenEmergency: () => void;
  selectedEstate: NairobiEstate;
  onSelectEstate: (estate: NairobiEstate) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenEmergency,
  selectedEstate,
  onSelectEstate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const { siteConfig } = useContent();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 4) {
      setLogoClicks(0);
      window.dispatchEvent(new CustomEvent('open-admin-gate'));
    } else {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      setTimeout(() => {
        setLogoClicks(0);
      }, 2500);
    }
  };

  return (
    <header className="site-header sticky top-0 z-40 backdrop-blur-md transition-all">
      {/* Top Notification Bar for Nairobi Residents */}
      <div className="bg-[#25D366] text-[#075E54] text-[10px] sm:text-xs lg:text-sm py-1.5 px-3 sm:px-4 font-medium">
        <div className="w-full flex items-center gap-2 sm:gap-3 overflow-hidden">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="inline-flex shrink-0 items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#128C7E] text-white text-[10px] sm:text-[11px] font-semibold tracking-wide">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" /> DCI Biometric Verified
            </span>
            <span className="hidden md:block min-w-0 truncate whitespace-nowrap text-[#075E54]">
              {siteConfig.notificationBanner}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3 xl:gap-4">
            <button 
              onClick={onOpenEmergency}
              className="inline-flex max-w-[145px] sm:max-w-[190px] items-center gap-1 text-[#075E54] hover:text-[#128C7E] font-semibold text-[10px] sm:text-xs transition-colors xl:max-w-none"
            >
              <AlertCircle className="w-3.5 h-3.5 animate-pulse text-[#128C7E]" />
              <span className="truncate whitespace-nowrap">Emergency Standby Staff (2-4h Dispatch)</span>
            </button>
            <a 
              href={`tel:${siteConfig.hotlinePhone}`} 
              className="hidden xl:inline-flex items-center gap-1 whitespace-nowrap text-[#075E54] hover:text-[#128C7E] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{siteConfig.hotlinePhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-between h-14 sm:h-16 lg:h-20 gap-1 sm:gap-2">
          
          {/* Logo & Brand Identity (4 quick clicks triggers secret admin access) */}
          <div className="shrink-0 py-1">
            <MommyCareLogo 
              onClick={handleLogoClick} 
              size="sm"
              showTagline={true}
              showLocationBadge={true}
            />
          </div>

          {/* Desktop Nav Links */}
          <nav className="main-nav hidden lg:flex ml-auto min-w-0 items-center justify-center gap-0.5 xl:gap-1 2xl:gap-1.5 overflow-hidden text-[10px] xl:text-[11px] font-semibold text-[#3D3A36]">
            <a 
              href="/nannies" 
              className="nav-link hover:text-[#D96B43] transition-colors flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-[#D96B43]" />
              <span className="whitespace-nowrap">Browse Staff</span>
            </a>
            <a
              href="/mission-vision"
              className="nav-link hover:text-[#D96B43] transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#D96B43]" />
              <span className="whitespace-nowrap">Mission & Vision</span>
            </a>
            <a
              href="/insights"
              className="nav-link hover:text-[#D96B43] transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-[#D96B43]" />
              <span>Insights</span>
            </a>
            <a href="/contact" className="nav-link hover:text-[#D96B43] transition-colors flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#1D432D]" />
              <span>Contact</span>
            </a>
            <div
              className="relative"
              onMouseEnter={() => setNavMenuOpen(true)}
              onMouseLeave={() => setNavMenuOpen(false)}
            >
              <button
                type="button"
                className="nav-link flex shrink-0 items-center gap-1.5 hover:text-[#D96B43] transition-colors"
              >
                <span className="whitespace-nowrap">More</span>
              </button>

              {navMenuOpen && (
                <div className="absolute left-1/2 top-full z-50 mt-2 w-52 -translate-x-1/2 rounded-2xl border border-[#E8DFD3] bg-white p-2 shadow-xl shadow-stone-200/80">
                  <div className="space-y-1">
                    <a href="/pricing" className="block rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#1A201C] hover:bg-[#FAF7F2] hover:text-[#D96B43]">Pricing</a>
                    <a href="/careers" className="block rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#1A201C] hover:bg-[#FAF7F2] hover:text-[#D96B43]">Careers</a>
                    <a href="/salary-guide" className="block rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#1A201C] hover:bg-[#FAF7F2] hover:text-[#D96B43]">Salary Guide</a>
                    <a href="/compare-care" className="block rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#1A201C] hover:bg-[#FAF7F2] hover:text-[#D96B43]">Compare Care</a>
                    <a href="/privacy-policy" className="block rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#1A201C] hover:bg-[#FAF7F2] hover:text-[#D96B43]">Privacy Policy</a>
                    <a href="/terms-of-placement" className="block rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#1A201C] hover:bg-[#FAF7F2] hover:text-[#D96B43]">Terms of Placement</a>
                    <a href="/safety-policy" className="block rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#1A201C] hover:bg-[#FAF7F2] hover:text-[#D96B43]">Safety Policy</a>
                  </div>
                </div>
              )}
            </div>

            <a href="/provider-apply" className="nav-link flex shrink-0 items-center gap-1.5 hover:text-[#D96B43] transition-colors">
              <Users className="w-4 h-4 text-[#1D432D]" />
              <span className="whitespace-nowrap">Apply to Work</span>
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex shrink-0 items-center pl-1.5 xl:pl-2">
            <button
              onClick={onOpenBooking}
              className="nav-cta inline-flex items-center justify-center px-3 xl:px-5 py-2.5 text-xs xl:text-sm tracking-wide whitespace-nowrap"
            >
              Hire Now
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#1A201C] hover:bg-[#EFE9DF] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8DFD3] bg-[#FAF7F2] px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <div className="space-y-1">
            <a
              href="/nannies"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-[#1A201C] hover:bg-[#F2EDE4]"
            >
              <Users className="w-5 h-5 text-[#D96B43]" />
              <span>Browse Homecare Staff</span>
            </a>
            <a
              href="/mission-vision"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-[#1A201C] hover:bg-[#F2EDE4]"
            >
              <Compass className="w-5 h-5 text-[#D96B43]" />
              <span>Mission & Vision</span>
            </a>
            <a
              href="/insights"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-[#1A201C] hover:bg-[#F2EDE4]"
            >
              <BookOpen className="w-5 h-5 text-[#D96B43]" />
              <span>Parenting & Household Insights</span>
            </a>
            <a
              href="/compare-care"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-[#1A201C] hover:bg-[#F2EDE4]"
            >
              <Award className="w-5 h-5 text-[#1D432D]" />
              <span>Compare Care Options</span>
            </a>
            <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-[#1A201C] hover:bg-[#F2EDE4]">
              <Phone className="w-5 h-5 text-[#D96B43]" />
              <span>Contact us</span>
            </a>
            <a href="/provider-apply" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-[#1A201C] hover:bg-[#F2EDE4]">
              <Users className="w-5 h-5 text-[#1D432D]" />
              <span>Apply as a Provider</span>
            </a>
          </div>

          <div className="pt-2 border-t border-[#E8DFD3] space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 rounded-xl bg-[#D96B43] text-white font-bold text-sm shadow-md"
            >
              Book 3-Day Risk-Free Trial
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEmergency();
              }}
              className="w-full py-3 rounded-xl bg-[#1D432D] text-white font-bold text-sm flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-[#F4A261]" />
              <span>Emergency Standby Dispatch</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
