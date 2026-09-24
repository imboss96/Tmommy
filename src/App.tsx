import React, { useState, useEffect } from 'react';
import { ContentProvider } from './context/ContentContext';
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard';
import { AdminPinGate } from './components/AdminDashboard/AdminOtpGate';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MissionVision } from './components/MissionVision';
import { VettingProcess } from './components/VettingProcess';
import { NannyDirectory } from './components/NannyDirectory';
import { SalaryCalculator } from './components/SalaryCalculator';
import { CompetitorComparison } from './components/CompetitorComparison';
import { ParentingInsightsSection } from './components/ParentingInsightsSection';
import { Testimonials } from './components/Testimonials';
import { NannyAcademySection } from './components/NannyAcademySection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { VettingBadgeModal } from './components/VettingBadgeModal';
import { EmergencyBackupModal } from './components/EmergencyBackupModal';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { ContactPage } from './components/ContactPage';
import { CoreServiceCategories } from './components/CoreServiceCategories';
import { NairobiEstate, NannyProfile, NannyType } from './types';

function MainWebsite() {
  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isVettingBadgeOpen, setIsVettingBadgeOpen] = useState(false);

  // Selected Staff for Trial or Inspection
  const [activeNanny, setActiveNanny] = useState<NannyProfile | null>(null);

  // Global search filters passed from Hero to Directory
  const [globalEstate, setGlobalEstate] = useState<NairobiEstate | 'All Nairobi'>('All Nairobi');
  const [globalRole, setGlobalRole] = useState<string>('all');

  // Secret Admin Route & PIN Authentication
  const checkIsAdminPath = () => {
    return window.location.pathname.toLowerCase().startsWith('/admin') || window.location.hash.toLowerCase() === '#admin';
  };

  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminPath);
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('mommycare_admin_authenticated') === 'true');
  const [, setRouteVersion] = useState(0);
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  const requestedRole = new URLSearchParams(window.location.search).get('role') || 'all';

  useEffect(() => {
    const requestedSection = new URLSearchParams(window.location.search).get('section');
    if (requestedSection) {
      requestAnimationFrame(() => {
        document.getElementById(requestedSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', window.location.pathname);
      });
      return;
    }

    if (pathname !== '/nannies') return;

    const scrollToDirectory = () => {
      document.getElementById('nanny-directory')?.scrollIntoView({ block: 'start' });
    };

    requestAnimationFrame(scrollToDirectory);
  }, [pathname]);

  useEffect(() => {
    const routeSeo: Record<string, { title: string; description: string }> = {
      '/': {
        title: 'MommyCare Nairobi | Vetted Nannies & Homecare Professionals',
        description: 'Find DCI-verified nannies, house managers, caregivers, and domestic professionals in Nairobi with a guided trial and replacement guarantee.'
      },
      '/nannies': {
        title: 'Vetted Nannies & Domestic Staff in Nairobi | MommyCare',
        description: 'Browse vetted nannies, house managers, housekeepers, cooks, drivers, gardeners, and caretakers serving Nairobi estates.'
      },
      '/vetting': {
        title: '7-Pillar Nanny Vetting in Nairobi | MommyCare',
        description: 'See how MommyCare verifies Nairobi domestic staff through DCI clearance, identity checks, medical screening, references, training, and integrity assessment.'
      },
      '/salary-guide': {
        title: 'Nairobi Nanny Salary Guide & Take-Home Calculator | MommyCare',
        description: 'Estimate fair private-agreement take-home salaries for nannies, house managers, cooks, drivers, gardeners, and other domestic professionals in Nairobi.'
      },
      '/mission-vision': {
        title: 'Our Mission & Vision | MommyCare Nairobi',
        description: 'Learn how MommyCare is raising the standard for trusted childcare, dignified domestic employment, and safer Nairobi homes.'
      },
      '/insights': {
        title: 'Nairobi Parenting & Childcare Insights | MommyCare',
        description: 'Read practical Nairobi childcare, infant nutrition, safety, developmental milestone, and nanny-management guides.'
      },
      '/reviews': {
        title: 'Parent Reviews of MommyCare Nairobi | Trusted Homecare',
        description: 'Read verified family reviews about MommyCare nanny placement, newborn care, household support, and domestic staffing in Nairobi.'
      },
      '/compare-care': {
        title: 'MommyCare vs Other Nanny Options in Nairobi',
        description: 'Compare managed nanny placement, DCI verification, first aid training, trial periods, replacement support, and informal childcare options.'
      },
      '/academy': {
        title: 'MommyCare Domestic & Homecare Academy | Nairobi',
        description: 'Explore professional training and continuous learning for nannies, house managers, housekeepers, cooks, gardeners, and homecare staff.'
      },
      '/contact': {
        title: 'Contact MommyCare Nairobi | Nanny & Homecare Placement',
        description: 'Contact MommyCare for vetted nanny placement, emergency backup staff, newborn care, house managers, and domestic professionals in Nairobi.'
      }
    };
    const seo = routeSeo[pathname] || routeSeo['/'];
    document.title = seo.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description);
  }, [pathname]);

  useEffect(() => {
    const handleRouteCheck = () => {
      setIsAdminRoute(checkIsAdminPath());
      setRouteVersion(version => version + 1);
    };

    const handleCustomTrigger = () => {
      setIsAdminRoute(true);
      window.history.pushState(null, '', '/admin');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey: Ctrl+Shift+A or Cmd+Shift+A or Alt+A
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        handleCustomTrigger();
      }
    };

    window.addEventListener('popstate', handleRouteCheck);
    window.addEventListener('hashchange', handleRouteCheck);
    window.addEventListener('open-admin-gate', handleCustomTrigger);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleRouteCheck);
      window.removeEventListener('hashchange', handleRouteCheck);
      window.removeEventListener('open-admin-gate', handleCustomTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleReturnToWebsite = () => {
    setIsAdminRoute(false);
    if (checkIsAdminPath()) {
      window.history.pushState(null, '', '/');
    }
  };

  const handleLockDashboard = () => {
    sessionStorage.removeItem('mommycare_admin_authenticated');
    sessionStorage.removeItem('mommycare_admin_pin');
    localStorage.removeItem('mommycare_admin_pin');
    setIsAuthenticated(false);
    handleReturnToWebsite();
  };

  const handleHeroSearch = (estate: NairobiEstate | 'All Nairobi', role: string) => {
    setGlobalEstate(estate);
    setGlobalRole(role);
  };

  const handleSelectNannyForBooking = (nanny: NannyProfile) => {
    setActiveNanny(nanny);
    setIsBookingOpen(true);
  };

  const handleInspectNannyVetting = (nanny: NannyProfile) => {
    setActiveNanny(nanny);
    setIsVettingBadgeOpen(true);
  };

  const handleOpenGeneralBooking = () => {
    setActiveNanny(null);
    setIsBookingOpen(true);
  };

  // If visiting secret /admin or /#admin:
  if (isAdminRoute) {
    if (!isAuthenticated) {
      return (
        <AdminPinGate
          onSuccess={() => setIsAuthenticated(true)}
          onCancel={handleReturnToWebsite}
        />
      );
    }

    return (
      <AdminDashboard 
        onBackToWebsite={handleReturnToWebsite} 
        onLockDashboard={handleLockDashboard}
      />
    );
  }

  const renderPage = () => {
    if (pathname === '/contact') {
      return <ContactPage onOpenBooking={handleOpenGeneralBooking} onOpenEmergency={() => setIsEmergencyOpen(true)} />;
    }

    if (pathname === '/nannies') {
      return (
        <NannyDirectory
          initialEstate={globalEstate}
          initialRole={globalRole === 'all' ? requestedRole : globalRole}
          onSelectNannyForBooking={handleSelectNannyForBooking}
          onInspectNannyVetting={handleInspectNannyVetting}
        />
      );
    }

    switch (pathname) {
      case '/vetting':
        return <VettingProcess />;
      case '/salary-guide':
        return <SalaryCalculator onBookConsultation={handleOpenGeneralBooking} />;
      case '/mission-vision':
        return <MissionVision />;
      case '/insights':
        return <ParentingInsightsSection onOpenBooking={handleOpenGeneralBooking} />;
      case '/reviews':
        return <Testimonials />;
      case '/compare-care':
        return <CompetitorComparison onBookConsultation={handleOpenGeneralBooking} />;
      case '/academy':
        return <NannyAcademySection />;
      default:
        return (
          <>
            <Hero
              onSearch={handleHeroSearch}
              onOpenBooking={handleOpenGeneralBooking}
              onOpenEmergency={() => setIsEmergencyOpen(true)}
            />
            <CoreServiceCategories />
            <VettingProcess />
            <NannyDirectory
              initialEstate={globalEstate}
              initialRole={globalRole === 'all' ? requestedRole : globalRole}
              onSelectNannyForBooking={handleSelectNannyForBooking}
              onInspectNannyVetting={handleInspectNannyVetting}
            />
            <SalaryCalculator onBookConsultation={handleOpenGeneralBooking} />
            <MissionVision />
            <CompetitorComparison onBookConsultation={handleOpenGeneralBooking} />
            <ParentingInsightsSection onOpenBooking={handleOpenGeneralBooking} />
            <Testimonials />
            <NannyAcademySection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1A201C] font-['Plus_Jakarta_Sans']">
      
      {/* Navigation Bar (Clean public navigation - no admin buttons) */}
      <Navbar
        onOpenBooking={handleOpenGeneralBooking}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        selectedEstate={globalEstate === 'All Nairobi' ? 'Kilimani' : globalEstate}
        onSelectEstate={(est) => setGlobalEstate(est)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">{renderPage()}</main>

      {/* Footer (Clean public footer - no admin links) */}
      <Footer
        onOpenBooking={handleOpenGeneralBooking}
      />

      <FloatingWhatsAppButton />

      {/* MODALS */}
      {/* 1. Schedule 3-Day Risk-Free Trial Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preSelectedNanny={activeNanny}
      />

      {/* 2. Official Vetting File & Credentials Inspector */}
      <VettingBadgeModal
        isOpen={isVettingBadgeOpen}
        onClose={() => setIsVettingBadgeOpen(false)}
        nanny={activeNanny}
        onBookTrial={handleSelectNannyForBooking}
      />

      {/* 3. Emergency Backup 2-4h Dispatch Modal */}
      <EmergencyBackupModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <MainWebsite />
    </ContentProvider>
  );
}
