import { SEMCampaign, SEOStrategyItem } from '../types';

export const SEO_STRATEGY_PILLARS: SEOStrategyItem[] = [
  {
    pillar: 'High-Intent Nairobi Commercial Keywords',
    focusKeywords: [
      'vetted nanny agency nairobi',
      'hire trained babysitter nairobi',
      'live in nanny karen westlands',
      'infant care night nurse kenya',
      'dci cleared nanny nairobi',
      'montessori childcare agency nairobi'
    ],
    implementation: 'Integrated into semantic H1/H2 hierarchy, metadata tags, image alt texts, and localized content.',
    impactScore: 98,
    status: 'Implemented'
  },
  {
    pillar: 'Local SEO & Geo-Targeting (Google Business Profile)',
    focusKeywords: [
      'nanny services kilimani',
      'childcare providers lavington',
      'babysitter near me nairobi',
      'domestic nanny agency westlands'
    ],
    implementation: 'Coordinates (-1.2618, 36.8049), Nairobi sub-counties listing, Google Map embed data, postal address.',
    impactScore: 94,
    status: 'Implemented'
  },
  {
    pillar: 'Structured Data Schema (JSON-LD)',
    focusKeywords: [
      'Schema.org ChildCare',
      'LocalBusiness Schema',
      'AggregateRating (4.94/5)',
      'FAQPage Schema',
      'Service OfferCatalog'
    ],
    implementation: 'Rich snippets pre-baked into HTML head to unlock Google Rich Results, star ratings, and price snippets.',
    impactScore: 96,
    status: 'Implemented'
  },
  {
    pillar: 'Technical Performance & Core Web Vitals',
    focusKeywords: [
      'LCP < 1.2s',
      'CLS 0.00',
      'Mobile-First Responsive Design',
      'Zero Render-Blocking Scripts'
    ],
    implementation: 'Vite lightning bundle, inline critical SVG/CSS, fast CDN image caching, lightweight client hydration.',
    impactScore: 99,
    status: 'Active'
  }
];

export const SEM_CAMPAIGNS: SEMCampaign[] = [
  {
    id: 'sem-01',
    campaignName: 'Campaign 1: Live-In & Verified Estate Nannies (Karen, Runda, Lavington)',
    targetAudience: 'Parents aged 28-48 living in affluent Nairobi gated estates seeking long-term professional childcare.',
    targetEstates: ['Karen', 'Runda', 'Lavington', 'Westlands', 'Muthaiga', 'Gigiri'],
    headlines: [
      'Vetted Nanny Agency Nairobi | MommyCare',
      'DCI Background Checked Nannies',
      '90-Day Free Replacement Warranty',
      'Red Cross CPR Certified Nannies',
      'Live-In Nannies Karen & Runda',
      'Try Risk-Free 3-Day Home Trial',
      'Ethical Domestic Childcare Kenya'
    ],
    descriptions: [
      'Connect with thoroughly vetted, hospital-screened, and CPR-certified nannies in Nairobi. 90-day replacement guarantee included.',
      'Peace of mind for your home. DCI good conduct checked, 3 verified references & Red Cross infant first aid trained. Book a trial today.',
      'Serving Karen, Runda, Westlands & Lavington. Transparent contracts and fair wages. Schedule your nanny interview in 24 hours.'
    ],
    sitelinks: [
      { title: 'Browse Vetted Nannies', desc: 'View verified profiles, DCI checks & badges' },
      { title: '7-Pillar Vetting Standards', desc: 'See how we forensically verify every caregiver' },
      { title: 'Nairobi Salary Calculator', desc: 'Check fair monthly salary for your estate' },
      { title: 'Book 3-Day Home Trial', desc: 'Interview and test compatibility risk-free' }
    ],
    callouts: [
      'DCI Good Conduct Verified',
      'Red Cross First Aid Certified',
      '90-Day Free Replacement',
      'Emergency Standby Backup',
      'Transparent M-Pesa Contracts'
    ],
    targetKeywords: [
      { keyword: 'vetted nanny agency nairobi', matchType: 'Phrase', monthlySearches: 2400, avgCpcKsh: 42 },
      { keyword: 'hire live in nanny karen', matchType: 'Exact', monthlySearches: 1300, avgCpcKsh: 58 },
      { keyword: 'house help agency westlands', matchType: 'Phrase', monthlySearches: 3100, avgCpcKsh: 35 },
      { keyword: 'best childcare agency in kenya', matchType: 'Phrase', monthlySearches: 1800, avgCpcKsh: 45 }
    ],
    negativeKeywords: [
      'free babysitter',
      'house girl funny video',
      'nanny jobs in dubai',
      'maid uniform cheap wholesale',
      'househelp scandal',
      'download cartoon nanny'
    ],
    estimatedMonthlyBudgetKsh: 45000,
    expectedCtr: '8.4%',
    conversionGoal: 'Consultation & Trial Booking Form Submissions'
  },
  {
    id: 'sem-02',
    campaignName: 'Campaign 2: Newborn Night Nurses & Postpartum Care (High Urgency)',
    targetAudience: 'Expectant mothers and parents of newborns (0-6 months) suffering from sleep deprivation in Nairobi.',
    targetEstates: ['Kilimani', 'Kileleshwa', 'Westlands', 'Parklands', 'Lavington'],
    headlines: [
      'Newborn Night Nurse Nairobi | MommyCare',
      'Sleep Soundly Tonight | Nurse Care',
      'Postpartum & Infant Care Experts',
      'Colic & Lactation Support Nairobi',
      'Registered Enrolled Nurse Nannies',
      'Gentle Infant Sleep Routines',
      'Available for Immediate Booking'
    ],
    descriptions: [
      'Exhausted with a newborn? Our registered nurses handle overnight feeds, soothing, and colic care while you sleep peacefully.',
      'Certified infant night specialists in Kilimani, Westlands & Lavington. Medically trained in SIDS prevention and newborn safety.'
    ],
    sitelinks: [
      { title: 'Night Nurse Rates', desc: 'Explore overnight care packages in Nairobi' },
      { title: 'Nurse Credentials', desc: 'KMTC & NCK certified pediatric nurses' },
      { title: 'Twin & Multiples Care', desc: 'Specialized support for parents of multiples' }
    ],
    callouts: ['Hospital-Trained Nurses', 'Overnight 7pm - 7am', 'Colic Relief Experts', 'CPR Certified'],
    targetKeywords: [
      { keyword: 'night nurse for newborn nairobi', matchType: 'Exact', monthlySearches: 980, avgCpcKsh: 62 },
      { keyword: 'baby night care specialist kenya', matchType: 'Phrase', monthlySearches: 850, avgCpcKsh: 54 },
      { keyword: 'postpartum nanny kilimani', matchType: 'Phrase', monthlySearches: 620, avgCpcKsh: 48 }
    ],
    negativeKeywords: ['hospital job vacancies', 'nursing school intake', 'free doctor advice online'],
    estimatedMonthlyBudgetKsh: 30000,
    expectedCtr: '9.8%',
    conversionGoal: 'Direct Phone Calls & Night Nurse Booking Inquiries'
  },
  {
    id: 'sem-03',
    campaignName: 'Campaign 3: Emergency Backup Childcare (2-4 Hour Dispatch)',
    targetAudience: 'Working corporate and business parents faced with sudden nanny absence, travel, or unexpected illness.',
    targetEstates: ['All Nairobi', 'Kilimani', 'Westlands', 'Upper Hill', 'CBD', 'Kileleshwa'],
    headlines: [
      'Emergency Nanny in Nairobi | 2-4 Hr Dispatch',
      'Nanny Cancelled Today? We Have You Covered',
      'On-Demand Vetted Babysitters',
      'Instant Childcare Backup Nairobi',
      'Pre-Screened & Ready Now',
      'Call +254 700 MOMMY Care'
    ],
    descriptions: [
      'Don’t miss your executive meeting. MommyCare dispatches a pre-vetted, first-aid trained emergency nanny to your door within 2-4 hours.',
      'Reliable emergency childcare across Nairobi. Fully vetted, DCI-checked, and ready on standby. Tap to dispatch immediately.'
    ],
    sitelinks: [
      { title: 'Request Immediate Dispatch', desc: 'Nanny sent to your estate within 2-4 hours' },
      { title: 'Instant WhatsApp Concierge', desc: 'Chat directly with our dispatch team' }
    ],
    callouts: ['2-4 Hour Arrival', 'Zero Advance Commitment', 'DCI Verified Standby'],
    targetKeywords: [
      { keyword: 'emergency nanny nairobi', matchType: 'Exact', monthlySearches: 1100, avgCpcKsh: 75 },
      { keyword: 'urgent babysitter nairobi today', matchType: 'Phrase', monthlySearches: 1450, avgCpcKsh: 68 },
      { keyword: 'same day childcare kenya', matchType: 'Phrase', monthlySearches: 720, avgCpcKsh: 55 }
    ],
    negativeKeywords: ['volunteer babysitter', 'free babysitting coupons', 'unpaid helper wanted'],
    estimatedMonthlyBudgetKsh: 35000,
    expectedCtr: '11.2%',
    conversionGoal: 'Urgent Emergency Dispatch Requests'
  }
];
