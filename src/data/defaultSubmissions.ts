import { BookingSubmission, EmergencySubmission, SiteConfig } from '../types';

export const DEFAULT_BOOKINGS: BookingSubmission[] = [
  {
    id: 'book-101',
    submittedAt: '2026-09-18T14:32:00Z',
    status: 'New',
    nannyId: 'nanny-1',
    nannyName: 'Grace Wambui',
    role: 'nanny',
    parentName: 'Dr. Caroline Njeri',
    phone: '+254 722 891 445',
    email: 'caroline.njeri@agakhan.org',
    estate: 'Kilimani',
    residenceDetails: 'Denis Pritt Road, Lenana Court, Apt 4B',
    residenceType: 'Apartment',
    nannyType: 'live-in',
    numberOfChildren: 2,
    childrenAges: '7 months and 3 years',
    startDate: '2026-09-22',
    preferredTrialDays: 3,
    additionalNotes: 'Need experienced nanny who knows baby weaning with Kenyan porridge and infant sleep schedules. Both parents are doctors.',
    needsCooking: true,
    needsPetFriendly: false,
    hasGardenOrLawn: false,
    internalNotes: 'VIP doctor family in Kilimani. Assigned coordinator: Beatrice. Needs Grace Wambui for immediate 3-day trial.'
  },
  {
    id: 'book-102',
    submittedAt: '2026-09-17T09:15:00Z',
    status: 'Contacted',
    nannyId: 'staff-2',
    nannyName: 'Margaret Muthoni',
    role: 'house-manager',
    parentName: 'James Mwangi Gitau',
    phone: '+254 733 456 789',
    email: 'j.gitau@kenyaairways.com',
    estate: 'Karen',
    residenceDetails: 'Miotoni Road, Villa 12, Karen Country Club vicinity',
    residenceType: 'Country Compound',
    nannyType: 'live-in',
    numberOfChildren: 3,
    childrenAges: '5, 8, and 12 years',
    startDate: '2026-09-25',
    preferredTrialDays: 3,
    additionalNotes: 'Large 1.5-acre property with gardener and cook. Looking for a firm, diplomatic house manager to run inventory, grocery budgets, and staff supervision.',
    needsCooking: false,
    needsPetFriendly: true,
    hasGardenOrLawn: true,
    internalNotes: 'Called by Coordinator Davis. Client confirmed trial starting Sept 25th. Waiting on gate security clearance form.'
  },
  {
    id: 'book-103',
    submittedAt: '2026-09-16T17:45:00Z',
    status: 'Trial Scheduled',
    nannyId: 'staff-3',
    nannyName: 'Faith Achieng',
    role: 'house-girl',
    parentName: 'Amina Hassan',
    phone: '+254 711 234 567',
    email: 'amina.hassan@un.org',
    estate: 'Westlands',
    residenceDetails: 'Brookside Drive, The Azure Apartments, Penthouse 8',
    residenceType: 'Apartment',
    nannyType: 'day-care',
    numberOfChildren: 1,
    childrenAges: '4 years',
    startDate: '2026-09-20',
    preferredTrialDays: 3,
    additionalNotes: 'Needs deep cleaning expertise for wood and marble flooring, steam ironing, and gentle handling of silk fabrics.',
    needsCooking: true,
    needsPetFriendly: false,
    hasGardenOrLawn: false,
    internalNotes: 'Trial confirmed for Faith Achieng. DCI and clinical panel sent to UN security desk.'
  }
];

export const DEFAULT_EMERGENCY_REQUESTS: EmergencySubmission[] = [
  {
    id: 'emg-501',
    submittedAt: '2026-09-19T06:10:00Z',
    status: 'Pending Dispatch',
    parentName: 'Wanjiku Kamau',
    phone: '+254 720 998 811',
    estate: 'Kileleshwa',
    requestedRole: 'nanny',
    requiredTime: 'Immediate (Within 2-3 Hours)',
    durationDays: 2,
    childrenCount: 2,
    urgentNotes: 'Our regular nanny had a sudden family emergency in Nakuru this morning. I have board presentations in Upper Hill from 9 AM. Need reliable standby infant care immediately!',
    assignedStaffName: 'Candidate queued in Kilimani hub'
  },
  {
    id: 'emg-502',
    submittedAt: '2026-09-18T18:20:00Z',
    status: 'Dispatched',
    parentName: 'Patrick Kibet',
    phone: '+254 721 345 678',
    estate: 'Runda',
    requestedRole: 'cook-chef',
    requiredTime: 'Today Evening (After 5 PM)',
    durationDays: 1,
    childrenCount: 0,
    urgentNotes: 'Hosting visiting international delegates for dinner at our residence. Regular caterer cancelled last minute. Need private chef for continental & Kenyan fusion dinner.',
    assignedStaffName: 'Chef Evans Kiprop',
    internalNotes: 'Dispatched Chef Evans at 4:15 PM with sanitised knife kit. Client called to confirm arrival.'
  }
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  hotlinePhone: '+254 700 666 227',
  emergencyDispatchPhone: '+254 700 666 227',
  whatsappPhone: '+254 700 666 227',
  whatsappMessage: 'Hello MommyCare, I would like help finding vetted homecare staff.',
  notificationBanner: 'Serving Karen, Westlands, Kilimani, Lavington, Runda, Muthaiga & Greater Nairobi',
  headquartersAddress: 'The Promenade, General Mathenge Drive, Westlands, Nairobi',
  conciergeEmail: 'concierge@mommycare.co.ke',
  replacementWarrantyDays: 90
};
