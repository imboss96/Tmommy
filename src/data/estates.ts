import { NairobiEstate } from '../types';

export interface EstateInfo {
  name: NairobiEstate;
  subCounty: string;
  recommendedLiveInSalaryRange: string;
  recommendedDayNannySalaryRange: string;
  typicalFamilyProfile: string;
  securityProtocol: string;
  commuteEase: string;
  popularServices: string[];
}

export const NAIROBI_ESTATES: EstateInfo[] = [
  {
    name: 'Kilimani',
    subCounty: 'Dagoretti North',
    recommendedLiveInSalaryRange: 'KES 22,000 - 28,000',
    recommendedDayNannySalaryRange: 'KES 20,000 - 25,000',
    typicalFamilyProfile: 'Young tech, banking, and creative professionals in high-rise apartments with toddlers and infants.',
    securityProtocol: 'Access-controlled apartments, biometric gate clearance, visitor intercom verification.',
    commuteEase: 'Excellent matatu access along Argwings Kodhek, Dennis Pritt, and Ngong Road.',
    popularServices: ['Day Nanny (8am - 5pm)', 'Newborn Night Nurse', 'Emergency Backup Care']
  },
  {
    name: 'Westlands',
    subCounty: 'Westlands',
    recommendedLiveInSalaryRange: 'KES 24,000 - 30,000',
    recommendedDayNannySalaryRange: 'KES 22,000 - 26,000',
    typicalFamilyProfile: 'Corporate executives, expatriates, and busy dual-income couples near Sarit & Westgate.',
    securityProtocol: 'High-density compound security with CCTV and registered housekeeper identity badges.',
    commuteEase: 'Direct highway connectivity via Waiyaki Way & Ring Road Westlands.',
    popularServices: ['Infant Care Specialist', 'Day Nanny', 'Weekend Babysitting']
  },
  {
    name: 'Karen',
    subCounty: 'Lang’ata',
    recommendedLiveInSalaryRange: 'KES 26,000 - 35,000',
    recommendedDayNannySalaryRange: 'KES 25,000 - 30,000',
    typicalFamilyProfile: 'Gated acre compounds, international school families (Banda, Hillcrest), diplomatic staff.',
    securityProtocol: 'Rigid Barrier gates, KPS/KK Guards barrier vetting, employer gate-pass letters.',
    commuteEase: 'Boda/uber required from Karen Roundabout / Dagoretti Road. Live-in strongly preferred.',
    popularServices: ['Full-Time Live-In Nanny', 'Special Needs & Tutor Nanny', 'Bilingual Caregiver']
  },
  {
    name: 'Lavington',
    subCounty: 'Dagoretti North',
    recommendedLiveInSalaryRange: 'KES 25,000 - 32,000',
    recommendedDayNannySalaryRange: 'KES 22,000 - 27,000',
    typicalFamilyProfile: 'Family townhouses near James Gichuru, St. Austin’s, Braeburn with multiple young children.',
    securityProtocol: 'Estate barrier gates with guard barrier phone confirmations.',
    commuteEase: 'Smooth matatu connectivity via Gitanga and James Gichuru roads.',
    popularServices: ['Live-In Toddler Nanny', 'Montessori-Trained Nanny', 'After-School Care']
  },
  {
    name: 'Kileleshwa',
    subCounty: 'Dagoretti North',
    recommendedLiveInSalaryRange: 'KES 22,000 - 28,000',
    recommendedDayNannySalaryRange: 'KES 20,000 - 24,000',
    typicalFamilyProfile: 'Young urban families and new parents needing gentle newborn and weaning support.',
    securityProtocol: 'Guard stations with visitor ID logging and tenant sign-offs.',
    commuteEase: 'Convenient access to Kasuku Centre and Ring Road Kileleshwa.',
    popularServices: ['Day Nanny', 'Newborn Night Nurse', 'Emergency Backup']
  },
  {
    name: 'Runda',
    subCounty: 'Westlands / Kiambu Border',
    recommendedLiveInSalaryRange: 'KES 28,000 - 38,000',
    recommendedDayNannySalaryRange: 'KES 26,000 - 32,000',
    typicalFamilyProfile: 'UN/Diplomatic personnel and high-net-worth families near UN Gigiri compound.',
    securityProtocol: 'Runda Water Association / UN security strict gate vetting, mandatory biometric passes.',
    commuteEase: 'Restricted public transport inside estate. Employer transport subsidy or Live-in essential.',
    popularServices: ['Certified Live-In House Manager Nanny', 'Infant Care Specialist', 'Swimming-Certified Nanny']
  },
  {
    name: 'South C',
    subCounty: 'Lang’ata',
    recommendedLiveInSalaryRange: 'KES 20,000 - 25,000',
    recommendedDayNannySalaryRange: 'KES 18,000 - 22,000',
    typicalFamilyProfile: 'Close-knit community estates with school-going children requiring warm, family-oriented support.',
    securityProtocol: 'Estate court barriers with neighborhood watch security.',
    commuteEase: 'Direct access from Mombasa Road and Lang’ata Road.',
    popularServices: ['Day Nanny', 'School Pick-Up & Homework Nanny', 'Weekend Babysitting']
  },
  {
    name: 'Parklands',
    subCounty: 'Westlands',
    recommendedLiveInSalaryRange: 'KES 22,000 - 28,000',
    recommendedDayNannySalaryRange: 'KES 20,000 - 25,000',
    typicalFamilyProfile: 'Multi-generational families, vegetarians, and medical doctors at Aga Khan & MP Shah.',
    securityProtocol: 'Controlled building entrances with dedicated staff verification.',
    commuteEase: 'Easy commute from Limuru Road and Forest Road.',
    popularServices: ['Vegetarian/Jain Dietary Nanny', 'Infant Care', 'Day Nanny']
  }
];
