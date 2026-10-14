import React, { useState, useEffect } from 'react';
import { ContentProvider } from './context/ContentContext';
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard';
import { AdminOtpGate } from './components/AdminDashboard/AdminOtpGate';
import { supabase } from './lib/supabase';
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
import { HiringGuide } from './components/HiringGuide';
import { ProviderApplicationPage } from './components/ProviderApplicationPage';
import { ProviderPaymentPage } from './components/ProviderPaymentPage';
import { InfoPage } from './components/InfoPage';
import { NairobiEstate, NannyProfile, NannyType } from './types';

function MainWebsite() {
  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isVettingBadgeOpen, setIsVettingBadgeOpen] = useState(false);

  // Selected staff for booking or inspection
  const [activeNanny, setActiveNanny] = useState<NannyProfile | null>(null);

  // Global search filters passed from Hero to Directory
  const [globalEstate, setGlobalEstate] = useState<NairobiEstate | 'All Nairobi'>('All Nairobi');
  const [globalRole, setGlobalRole] = useState<string>('all');

  // Admin route; each session is verified with an email one-time code.
  const checkIsAdminPath = () => {
    return window.location.pathname.toLowerCase().startsWith('/admin') || window.location.hash.toLowerCase() === '#admin';
  };

  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminPath);
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('Tmommycare_admin_authenticated') === 'true');
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
    const routeSeo: Record<string, { title: string; description: string; robots?: string }> = {
      '/': {
        title: 'Tmommycare Nairobi | Nannies & Homecare Professionals',
        description: 'Find nannies, house managers, caregivers, and domestic professionals in Nairobi with guided placement support and replacement options.'
      },
      '/nannies': {
        title: 'Nannies & Domestic Staff in Nairobi | Tmommycare',
        description: 'Browse nannies, house managers, housekeepers, cooks, drivers, gardeners, and caretakers serving Nairobi.'
      },
      '/vetting': {
        title: 'Nanny Care Standards in Nairobi | Tmommycare',
        description: 'See how Tmommycare supports quality care through thoughtful screening, reference checks, training, and household support.'
      },
      '/salary-guide': {
        title: 'Nairobi Nanny Salary Guide & Take-Home Calculator | Tmommycare',
        description: 'Estimate fair private-agreement take-home salaries for nannies, house managers, cooks, drivers, gardeners, and other domestic professionals in Nairobi.'
      },
      '/mission-vision': {
        title: 'Our Mission & Vision | Tmommycare Nairobi',
        description: 'Learn how Tmommycare is raising the standard for trusted childcare, dignified domestic employment, and safer Nairobi homes.'
      },
      '/insights': {
        title: 'Nairobi Parenting & Childcare Insights | Tmommycare',
        description: 'Read practical Nairobi childcare, infant nutrition, safety, developmental milestone, and nanny-management guides.'
      },
      '/reviews': {
        title: 'Parent Reviews of Tmommycare Nairobi | Trusted Homecare',
        description: 'Read verified family reviews about Tmommycare nanny placement, newborn care, household support, and domestic staffing in Nairobi.'
      },
      '/compare-care': {
        title: 'Tmommycare vs Other Nanny Options in Nairobi',
        description: 'Compare managed nanny placement, household support, first aid training, replacement support, and informal childcare options.'
      },
      '/academy': {
        title: 'Tmommycare Domestic & Homecare Academy | Nairobi',
        description: 'Explore professional training and continuous learning for nannies, house managers, housekeepers, cooks, gardeners, and homecare staff.'
      },
      '/contact': {
        title: 'Contact Tmommycare Nairobi | Nanny & Homecare Placement',
        description: 'Contact Tmommycare for nanny placement, emergency backup staff, newborn care, house managers, and domestic professionals in Nairobi.'
      },
      '/pricing': {
        title: 'Private Placement Pricing | Tmommycare Nairobi',
        description: 'Learn how Tmommycare structures private placement pricing and tailored household staffing quotes.'
      },
      '/careers': {
        title: 'Careers at Tmommycare | Domestic Staffing & Homecare Jobs',
        description: 'Explore domestic staffing and homecare career opportunities with Tmommycare in Nairobi and beyond.'
      },
      '/privacy-policy': {
        title: 'Privacy Policy | Tmommycare Nairobi',
        description: 'Read how Tmommycare protects your personal data, householder information, and staff records.'
      },
      '/terms-of-placement': {
        title: 'Terms of Placement | Tmommycare Nairobi',
        description: 'Review the placement, replacement, and service terms for nannies, household staff, and homecare professionals.'
      },
      '/safety-policy': {
        title: 'Child & Household Safety Policy | Tmommycare Nairobi',
        description: 'Learn about Tmommycare’s safety commitments, vetting standards, and household care policies.'
      },
      '/provider-apply': {
        title: 'Apply as a Homecare Provider | Tmommycare Nairobi',
        description: 'Apply to be considered for the Tmommycare public directory. Submit your professional details and supporting documents for admin review.'
      },
      '/provider-payment': {
        title: 'Provider Payment | Tmommycare Nairobi',
        description: 'Complete your Tmommycare provider registration payment.',
        robots: 'noindex, nofollow'
      }
    };
    const seo = routeSeo[pathname] || routeSeo['/'];
    const canonicalUrl = `https://tmommycare.co.ke${pathname}`;
    document.title = seo.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description);
    document.querySelector('meta[name="title"]')?.setAttribute('content', seo.title);
    document.querySelector('meta[name="robots"]')?.setAttribute('content', seo.robots || 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', seo.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', seo.description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', seo.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', seo.description);
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
    sessionStorage.removeItem('Tmommycare_admin_authenticated');
    sessionStorage.removeItem('Tmommycare_admin_access_token');
    void supabase?.auth.signOut();
    setIsAuthenticated(false);
    setIsAdminRoute(false);
    if (checkIsAdminPath()) {
      window.history.pushState(null, '', '/');
    }
  };

  const handleLockDashboard = () => {
    handleReturnToWebsite();
  };

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (sessionStorage.getItem('Tmommycare_admin_authenticated') === 'true' && session) {
        sessionStorage.setItem('Tmommycare_admin_access_token', session.access_token);
      } else if (!session) {
        sessionStorage.removeItem('Tmommycare_admin_access_token');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
        <AdminOtpGate
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

    if (pathname === '/provider-apply') {
      return <ProviderApplicationPage />;
    }

    if (pathname === '/provider-payment') {
      return <ProviderPaymentPage />;
    }

    if (pathname === '/pricing') {
      return (
        <InfoPage
          kicker="Pricing"
          title="Private placement pricing"
          intro="Every household is different, so our pricing is tailored to the role, number of responsibilities, schedule, required experience, and the level of live-in or live-out support needed."
          items={[
            'Placement and short-term coverage pricing is discussed after a consultation with our team.',
            'Live-in roles, child-specific care, household management, and specialist roles are quoted individually.',
            'All pricing is confirmed in writing before placement or onboarding is finalised.',
            'Replacement guarantee conditions and terms are outlined in your placement agreement before onboarding.'
          ]}
        />
      );
    }

    if (pathname === '/careers') {
      return (
        <InfoPage
          kicker="Careers"
          title="Work with Tmommycare"
          intro="We are building a more dignified, better-trained future for domestic and homecare professionals across Nairobi."
          items={[
            'We hire vetted household professionals, nannies, caregivers, housekeepers, gardeners, cooks, and home managers.',
            'We look for professionalism, reliability, warmth, communication, and a commitment to family wellbeing.',
            'If you are experienced and ready to work in a structured, trained environment, we would love to hear from you.',
            'Send your details and supporting documents through the provider application form or contact our team directly.'
          ]}
        />
      );
    }

    if (pathname === '/privacy-policy') {
      return (
        <InfoPage
          kicker="Privacy"
          title="Privacy policy"
          intro="We treat your personal and household information with strict care. We only use it to assess your needs, arrange suitable staff, and provide safe service support."
          items={[
            'Contact details are used only to arrange staff placement, communication, and support.',
            'Uploaded documents are reviewed privately by the admin team only and not shared publicly.',
            'Your information is not sold to third parties for unrelated commercial purposes.',
            'We retain records only as long as needed for service, compliance, or operational requirements.'
          ]}
        />
      );
    }

    if (pathname === '/terms-of-placement') {
      return (
        <InfoPage
          kicker="Terms"
          title="Terms of placement"
          intro="Our placements are structured to help families and professionals work with clarity and confidence from the start."
          items={[
            'Placement and replacement support terms are confirmed before onboarding begins.',
            'Working hours, duties, leave, salary expectations, and role scope should be agreed in writing.',
            'Our team supports transparent communication between families and staff to reduce confusion and protect both sides.',
            'Replacement, suspension, or termination conditions are governed by the agreed placement terms and communication between the parties.'
          ]}
        />
      );
    }

    if (pathname === '/safety-policy') {
      return (
        <InfoPage
          kicker="Safety"
          title="Child & household safety policy"
          intro="Safety is at the centre of every placement we arrange. We screen and verify staff before they are introduced into your home."
          items={[
            'Every candidate is reviewed for identity and reference integrity before admission to the registry.',
            'We do not place staff whose records are inconsistent, expired, or incomplete.',
            'Families are encouraged to communicate clearly about duties, routines, boundaries, and household expectations.',
            'We maintain a high standard for professionalism, discretion, and respectful family support.'
          ]}
        />
      );
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
            <HiringGuide onOpenBooking={handleOpenGeneralBooking} />
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
      {/* 1. Direct Booking Request Modal */}
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
        onBookNow={handleSelectNannyForBooking}
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
