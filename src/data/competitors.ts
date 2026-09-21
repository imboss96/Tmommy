import { CompetitorComparisonItem } from '../types';

export const COMPETITOR_COMPARISON: CompetitorComparisonItem[] = [
  {
    feature: 'DCI Criminal Background Check (Directorate of Criminal Investigations)',
    mommyCare: 'Verified biometric fingerprint check renewed every 12 months with online proof for all staff',
    informalBrokers: 'May rely on informal references or document copies',
    generalAgencies: 'Verification practices and renewal schedules vary',
    whatsappGroups: 'Profile information may vary and should be confirmed',
    highlight: true
  },
  {
    feature: 'Certified First Aid & CPR (Red Cross / St. John Ambulance)',
    mommyCare: '100% Mandatory hands-on practical certification (Infant CPR, burn care, choking)',
    informalBrokers: 'Training availability varies by individual',
    generalAgencies: 'May be available depending on the provider',
    whatsappGroups: 'Training information should be confirmed',
    highlight: true
  },
  {
    feature: 'Comprehensive Medical Screening (TB, Hep B, Stool & Blood Analysis)',
    mommyCare: 'Partner hospital verified panel (Gertrude’s, Aga Khan, Nairobi Hospital, MP Shah)',
    informalBrokers: 'Screening arrangements vary by individual',
    generalAgencies: 'Screening scope and coordination vary',
    whatsappGroups: 'Health information should be confirmed',
    highlight: true
  },
  {
    feature: 'Roles Covered & Specialized Skills Verification',
    mommyCare: 'Complete staff roster: Nannies, House Managers, House Girls, House Boys, Shamba Boys & Caretakers',
    informalBrokers: 'Skills and credentials vary by individual',
    generalAgencies: 'Role coverage and specialist training vary',
    whatsappGroups: 'Role details should be confirmed directly',
    highlight: true
  },
  {
    feature: 'Trial Period Before Full Placement',
    mommyCare: '3-Day Risk-Free Guided Paid Trial in your home before commitment',
    informalBrokers: 'Trial arrangements vary by individual agreement',
    generalAgencies: 'Trial terms vary by provider',
    whatsappGroups: 'Trial terms should be agreed in advance',
    highlight: true
  },
  {
    feature: 'Free Replacement Guarantee Period',
    mommyCare: '90-Day Hassle-Free Free Replacement Warranty across all professions',
    informalBrokers: 'Replacement terms vary by individual agreement',
    generalAgencies: 'Coverage periods and processes vary',
    whatsappGroups: 'Any replacement terms should be agreed in advance',
    highlight: true
  },
  {
    feature: 'Fair Wages & Dignified Employment Contract (Statutory NSSF/SHA guidance)',
    mommyCare: 'Transparent salary bands, formal contracts & labor law compliance with 0% staff commission',
    informalBrokers: 'Payment and contract terms vary by arrangement',
    generalAgencies: 'Contract and payment structures vary',
    whatsappGroups: 'Payment terms should be agreed clearly in advance',
    highlight: true
  },
  {
    feature: 'Emergency 2-4 Hour Backup Staff Dispatch in Nairobi',
    mommyCare: 'Guaranteed standby dispatch for sudden illness, family travel, or urgent cover',
    informalBrokers: 'Availability varies by individual network',
    generalAgencies: 'Response times vary by provider and availability',
    whatsappGroups: 'Availability should be confirmed directly',
    highlight: true
  }
];

export const VETTING_PILLARS = [
  {
    id: 'dci',
    title: '1. Forensic DCI Criminal Clearance',
    shortDesc: 'Biometric fingerprint vetting through the Directorate of Criminal Investigations Kenya.',
    fullDesc: 'We verify the authenticity of every domestic professional’s Certificate of Good Conduct directly with the DCI database in Nairobi, screening for criminal history, property theft, domestic violence, child welfare violations, and identity impersonation.',
    verificationMethod: 'Biometric fingerprint matching & eCitizen government certificate validation',
    issuingAuthority: 'DCI Headquarters, Mazingira Complex, Kiambu Road',
    iconName: 'ShieldCheck',
    status: 'mandatory' as const
  },
  {
    id: 'id-chief',
    title: '2. National ID & Chief’s Residence Verification',
    shortDesc: 'Certified Kenyan National ID and verified local Chief’s recommendation letter.',
    fullDesc: 'We verify original Kenyan National Identification Cards with IPIS/Civil Registration and mandate physical verification letters from the local Chief or Assistant County Commissioner of the candidate’s home sub-county to ensure full traceability.',
    verificationMethod: 'Physical chief letter authentication & Kenyan IPIS identification confirmation',
    issuingAuthority: 'Ministry of Interior & National Administration Kenya',
    iconName: 'FileCheck',
    status: 'mandatory' as const
  },
  {
    id: 'medical',
    title: '3. Rigorous Clinical Health Screen',
    shortDesc: 'Certified diagnostic health check at accredited Nairobi partner hospitals.',
    fullDesc: 'Before entering any home, candidates complete a full clinical panel including Pulmonary Tuberculosis (Chest X-Ray / Sputum), Hepatitis B, Food Handler Salmonellosis, and sensory assessments at partner hospitals (Gertrude’s Children’s Hospital, Aga Khan, Nairobi Hospital, or MP Shah).',
    verificationMethod: 'Certified laboratory panel stamped by registered medical officers',
    issuingAuthority: 'Accredited Nairobi Hospital Laboratories',
    iconName: 'Activity',
    status: 'annual-renew' as const
  },
  {
    id: 'first-aid',
    title: '4. Red Cross Infant CPR & First Aid',
    shortDesc: 'Practical, hands-on pediatric life-saving, fire safety, and emergency response.',
    fullDesc: 'All MommyCare homecare professionals receive training in Pediatric & Workplace First Aid, Infant Choking Management, Burn Response, Fire Extinguisher Safety, and Emergency Dispatch Protocols through the Kenya Red Cross Society or St. John Ambulance.',
    verificationMethod: 'Practical simulation assessment & official certification registry number',
    issuingAuthority: 'Kenya Red Cross Society Training Institute',
    iconName: 'HeartPulse',
    status: 'annual-renew' as const
  },
  {
    id: 'reference',
    title: '5. Deep Traceable Employer Reference Audit',
    shortDesc: 'In-depth phone and in-person interviews with at least 3 previous Nairobi employers.',
    fullDesc: 'Our placement team conducts thorough 30-minute structured reference interviews with past homeowners and expatriates, probing honesty, integrity with household valuables, work ethic, punctuality, compound vigilance, and reasons for departure.',
    verificationMethod: 'Direct phone & verified residential employer audit by MommyCare senior coordinators',
    issuingAuthority: 'MommyCare Verification Integrity Board',
    iconName: 'PhoneCall',
    status: 'forensic' as const
  },
  {
    id: 'psychometric',
    title: '6. Psychometric & Integrity Assessment',
    shortDesc: 'Structured evaluation of emotional regulation, household honesty, and reliability.',
    fullDesc: 'Domestic stewardship requires trust and emotional balance. Candidates complete our proprietary situational test: handling emergencies, conflict resolution, property confidentiality, and ethical family privacy boundaries.',
    verificationMethod: 'In-person behavioral simulation and scenario-based psychometric scoring',
    issuingAuthority: 'MommyCare Domestic Academy Evaluators',
    iconName: 'Sparkles',
    status: 'mandatory' as const
  },
  {
    id: 'academy',
    title: '7. MommyCare Domestic & Homecare Academy',
    shortDesc: 'Intensive upskilling in hygiene, modern equipment, estate security, and hospitality.',
    fullDesc: 'Candidates receive specialized training by profession: pediatric nutrition and Montessori milestones for Nannies; fine linen and steam cleaning for Housekeepers; organic horticulture and irrigation for Shamba Boys; technical facility upkeep for Caretakers; and executive estate supervision for House Managers.',
    verificationMethod: 'Graduation capstone exam and ongoing quarterly continuous learning credits',
    issuingAuthority: 'MommyCare Domestic Training Academy',
    iconName: 'GraduationCap',
    status: 'mandatory' as const
  }
];
