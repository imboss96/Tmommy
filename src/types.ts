export type NannyType = 'live-in' | 'day-care' | 'night-nurse' | 'temporary-backup' | 'special-needs';

export type HomecareRole = 
  | 'nanny' 
  | 'house-manager' 
  | 'house-girl' 
  | 'house-boy' 
  | 'shamba-boy' 
  | 'caretaker' 
  | 'cook-chef'
  | 'chef'
  | 'home-driver'
  | 'temporary-backup';

export type NairobiEstate = 
  | 'Kilimani' 
  | 'Westlands' 
  | 'Karen' 
  | 'Lavington' 
  | 'Kileleshwa' 
  | 'Runda' 
  | 'Muthaiga' 
  | 'South C' 
  | 'Parklands' 
  | 'Gigiri' 
  | 'Kiambu Road' 
  | 'Ruaka' 
  | 'All Nairobi';

export interface VettingPillar {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  verificationMethod: string;
  issuingAuthority: string;
  iconName: string;
  status: 'mandatory' | 'annual-renew' | 'forensic';
}

export interface NannyProfile {
  id: string;
  name: string;
  avatar: string;
  age: number;
  role: HomecareRole;
  roleTitle: string;
  categoryLabel: string;
  nannyType: NannyType;
  primaryEstate: NairobiEstate;
  availableEstates: NairobiEstate[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  monthlySalaryKsh: number;
  hourlyRateKsh: number;
  tagline: string;
  bio: string;
  certifications: string[];
  skills: string[];
  languages: string[];
  education: string;
  dciGoodConductNumber: string;
  dciIssueDate: string;
  firstAidCertNumber: string;
  medicalClearanceDate: string;
  verifiedReferenceCount: number;
  isAvailableNow: boolean;
  canSwim: boolean;
  hasSpecialNeedsTraining: boolean;
  canDrive: boolean;
}

export interface Testimonial {
  id: string;
  parentName: string;
  familyRole: string;
  estate: NairobiEstate;
  nannyName: string;
  comment: string;
  rating: number;
  childrenAge: string;
  serviceType: string;
  date: string;
}

export interface BookingFormData {
  nannyId?: string;
  nannyName?: string;
  role?: HomecareRole;
  parentName: string;
  phone: string;
  email: string;
  estate: NairobiEstate;
  residenceDetails: string;
  residenceType?: 'Apartment' | 'Townhouse' | 'Standalone Villa' | 'Country Compound';
  nannyType: NannyType;
  numberOfChildren: number;
  childrenAges: string;
  startDate: string;
  preferredTrialDays: number;
  additionalNotes: string;
  needsCooking: boolean;
  needsPetFriendly: boolean;
  hasGardenOrLawn?: boolean;
}

export interface EmergencyRequestData {
  parentName: string;
  phone: string;
  estate: NairobiEstate;
  requestedRole?: HomecareRole;
  requiredTime: string;
  durationDays: number;
  childrenCount: number;
  urgentNotes: string;
}

export interface CompetitorComparisonItem {
  feature: string;
  mommyCare: string | boolean;
  informalBrokers: string | boolean;
  generalAgencies: string | boolean;
  whatsappGroups: string | boolean;
  highlight: boolean;
}

export interface SEMCampaign {
  id: string;
  campaignName: string;
  targetAudience: string;
  targetEstates: string[];
  headlines: string[];
  descriptions: string[];
  sitelinks: { title: string; desc: string }[];
  callouts: string[];
  targetKeywords: { keyword: string; matchType: 'Exact' | 'Phrase' | 'Broad'; monthlySearches: number; avgCpcKsh: number }[];
  negativeKeywords: string[];
  estimatedMonthlyBudgetKsh: number;
  expectedCtr: string;
  conversionGoal: string;
}

export interface SEOStrategyItem {
  pillar: string;
  focusKeywords: string[];
  implementation: string;
  impactScore: number;
  status: 'Implemented' | 'Active';
}

export type BlogCategory = 
  | 'Infant Nutrition' 
  | 'Developmental Milestones' 
  | 'Childcare & Safety' 
  | 'Nanny Management'
  | 'Culinary & Nutrition'
  | 'Estate & Driver Safety'
  | 'Domestic Staff Stewardship';

export interface ParentingInsight {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  readTime: string;
  publishedDate: string;
  coverImage: string;
  tags: string[];
  keyTakeaways: string[];
  content: string[];
  relatedNairobiTopic: string;
  status?: 'published' | 'draft';
  viewsCount?: number;
  featured?: boolean;
}

export type BookingStatus = 'New' | 'Contacted' | 'Trial Scheduled' | 'Completed' | 'Archived';
export type EmergencyStatus = 'Pending Dispatch' | 'Staff Contacted' | 'Dispatched' | 'Resolved' | 'Archived';
export type ContactInquiryStatus = 'New' | 'Contacted' | 'Resolved' | 'Archived';
export type ReviewStatus = 'pending' | 'published' | 'hidden';

export interface Review {
  id: string;
  parentName: string;
  familyRole: string;
  estate: NairobiEstate;
  nannyName: string;
  comment: string;
  rating: number;
  childrenAge: string;
  serviceType: string;
  date: string;
  status: ReviewStatus;
  submittedAt: string;
}

export interface BookingSubmission extends BookingFormData {
  id: string;
  submittedAt: string;
  status: BookingStatus;
  internalNotes?: string;
  assignedCoordinator?: string;
}

export interface EmergencySubmission extends EmergencyRequestData {
  id: string;
  submittedAt: string;
  status: EmergencyStatus;
  internalNotes?: string;
  assignedStaffName?: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: ContactInquiryStatus;
  submittedAt: string;
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  category: 'staff' | 'insights' | 'estate' | 'general';
  tags: string[];
  uploadedAt: string;
  dimensions?: string;
}

export interface SiteConfig {
  hotlinePhone: string;
  emergencyDispatchPhone: string;
  whatsappPhone: string;
  whatsappMessage: string;
  notificationBanner: string;
  headquartersAddress: string;
  conciergeEmail: string;
  replacementWarrantyDays: number;
}
