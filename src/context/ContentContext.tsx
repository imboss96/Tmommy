import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  NannyProfile, 
  ParentingInsight, 
  BookingSubmission, 
  EmergencySubmission, 
  BookingStatus, 
  EmergencyStatus, 
  MediaItem, 
  SiteConfig,
  BookingFormData,
  EmergencyRequestData
  ,ContactInquiry,
  Review,
  ReviewStatus
} from '../types';
import { VETTED_NANNIES } from '../data/nannies';
import { PARENTING_INSIGHTS } from '../data/insights';
import { DEFAULT_BOOKINGS, DEFAULT_EMERGENCY_REQUESTS, DEFAULT_SITE_CONFIG } from '../data/defaultSubmissions';
import { DEFAULT_MEDIA } from '../data/defaultMedia';
import { DEFAULT_REVIEWS } from '../data/defaultReviews';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getApiBaseUrl } from '../lib/api';

interface ContentContextType {
  // Staff / Nannies
  nannies: NannyProfile[];
  addNanny: (nanny: Partial<NannyProfile>) => void;
  updateNanny: (id: string, updates: Partial<NannyProfile>) => void;
  deleteNanny: (id: string) => void;
  resetNannies: () => void;

  // Posts / Insights
  insights: ParentingInsight[];
  addInsight: (insight: Partial<ParentingInsight>) => void;
  updateInsight: (id: string, updates: Partial<ParentingInsight>) => void;
  deleteInsight: (id: string) => void;
  resetInsights: () => void;

  // Bookings
  bookings: BookingSubmission[];
  addBooking: (booking: BookingFormData) => string;
  updateBookingStatus: (id: string, status: BookingStatus, notes?: string, coordinator?: string) => void;
  deleteBooking: (id: string) => void;

  // Emergency Dispatches
  emergencyRequests: EmergencySubmission[];
  addEmergencyRequest: (req: EmergencyRequestData) => string;
  updateEmergencyStatus: (id: string, status: EmergencyStatus, notes?: string, assignedStaffName?: string) => void;
  deleteEmergencyRequest: (id: string) => void;

  // Contact enquiries
  contactInquiries: ContactInquiry[];

  // Public reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'status' | 'submittedAt' | 'date'>) => string;
  updateReview: (id: string, updates: Partial<Review>) => void;
  deleteReview: (id: string) => void;

  // Media Library
  mediaItems: MediaItem[];
  addMediaItem: (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => void;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;
  deleteMediaItem: (id: string) => void;

  // Site Config
  siteConfig: SiteConfig;
  updateSiteConfig: (updates: Partial<SiteConfig>) => void;

  // Global reset
  resetAllData: () => void;

  // Toast / Activity alerts
  recentAlert: string | null;
  dismissAlert: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const STORAGE_KEYS = {
  NANNIES: 'mommycare_nannies_v2',
  INSIGHTS: 'mommycare_insights_v2',
  BOOKINGS: 'mommycare_bookings_v2',
  EMERGENCY: 'mommycare_emergency_v2',
  MEDIA: 'mommycare_media_v2',
  CONFIG: 'mommycare_config_v2'
  ,REVIEWS: 'mommycare_reviews_v1'
};

function safeStorageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`Error reading localStorage for key ${key}:`, e);
    return fallback;
  }
}

function safeStorageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing localStorage for key ${key}:`, e);
  }
}

function mapStaffRow(row: Record<string, unknown>): NannyProfile {
  return {
    ...(row as unknown as NannyProfile),
    roleTitle: row.role_title as string,
    categoryLabel: row.category_label as string,
    nannyType: row.nanny_type as NannyProfile['nannyType'],
    primaryEstate: row.primary_estate as NannyProfile['primaryEstate'],
    availableEstates: row.available_estates as NannyProfile['availableEstates'],
    experienceYears: row.experience_years as number,
    reviewCount: row.review_count as number,
    monthlySalaryKsh: row.monthly_salary_ksh as number,
    hourlyRateKsh: row.hourly_rate_ksh as number,
    dciGoodConductNumber: row.dci_good_conduct_number as string,
    dciIssueDate: row.dci_issue_date as string,
    firstAidCertNumber: row.first_aid_cert_number as string,
    medicalClearanceDate: row.medical_clearance_date as string,
    verifiedReferenceCount: row.verified_reference_count as number,
    isAvailableNow: row.is_available_now as boolean,
    canSwim: row.can_swim as boolean,
    hasSpecialNeedsTraining: row.has_special_needs_training as boolean,
    canDrive: row.can_drive as boolean
  };
}

function mapInsightRow(row: Record<string, unknown>): ParentingInsight {
  return {
    ...(row as unknown as ParentingInsight),
    readTime: row.read_time as string,
    coverImage: row.cover_image as string,
    keyTakeaways: row.key_takeaways as string[],
    relatedNairobiTopic: row.related_nairobi_topic as string,
    viewsCount: row.views_count as number
  };
}

function mapBookingRow(row: Record<string, unknown>): BookingSubmission {
  return {
    id: row.id as string,
    nannyId: (row.nanny_id as string | null) || '',
    nannyName: (row.nanny_name as string | null) || '',
    role: (row.role as BookingSubmission['role']) || 'nanny',
    parentName: row.parent_name as string,
    phone: row.phone as string,
    email: row.email as string,
    estate: row.estate as BookingSubmission['estate'],
    residenceDetails: row.residence_details as string,
    residenceType: (row.residence_type as BookingSubmission['residenceType']) || 'Apartment',
    nannyType: row.nanny_type as BookingSubmission['nannyType'],
    numberOfChildren: row.number_of_children as number,
    childrenAges: row.children_ages as string,
    startDate: row.start_date as string,
    preferredTrialDays: row.preferred_trial_days as number,
    additionalNotes: row.additional_notes as string,
    needsCooking: row.needs_cooking as boolean,
    needsPetFriendly: row.needs_pet_friendly as boolean,
    hasGardenOrLawn: row.has_garden_or_lawn as boolean,
    submittedAt: row.submitted_at as string,
    status: row.status as BookingSubmission['status'],
    internalNotes: (row.internal_notes as string | null) || undefined,
    assignedCoordinator: (row.assigned_coordinator as string | null) || undefined
  };
}

function mapEmergencyRow(row: Record<string, unknown>): EmergencySubmission {
  return {
    id: row.id as string,
    parentName: row.parent_name as string,
    phone: row.phone as string,
    estate: row.estate as EmergencySubmission['estate'],
    requestedRole: (row.requested_role as EmergencySubmission['requestedRole']) || undefined,
    requiredTime: row.required_time as string,
    durationDays: row.duration_days as number,
    childrenCount: row.children_count as number,
    urgentNotes: row.urgent_notes as string,
    submittedAt: row.submitted_at as string,
    status: row.status as EmergencySubmission['status'],
    internalNotes: (row.internal_notes as string | null) || undefined,
    assignedStaffName: (row.assigned_staff_name as string | null) || undefined
  };
}

function mapContactInquiryRow(row: Record<string, unknown>): ContactInquiry {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    message: row.message as string,
    status: row.status as ContactInquiry['status'],
    submittedAt: row.submitted_at as string
  };
}

function mapReviewRow(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    parentName: row.parent_name as string,
    familyRole: row.family_role as string,
    estate: row.estate as Review['estate'],
    nannyName: (row.nanny_name as string | null) || '',
    comment: row.comment as string,
    rating: Number(row.rating || 5),
    childrenAge: (row.children_age as string | null) || '',
    serviceType: (row.service_type as string | null) || '',
    date: row.review_date as string,
    status: row.status as ReviewStatus,
    submittedAt: row.submitted_at as string
  };
}

function mapMediaRow(row: Record<string, unknown>): MediaItem {
  return {
    ...(row as unknown as MediaItem),
    uploadedAt: row.uploaded_at as string
  };
}

const apiUrl = getApiBaseUrl();

async function submitToApi(path: string, payload: unknown) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed with status ${response.status}`);
  return body;
}

function adminMutation(resource: string, operation: 'upsert' | 'update' | 'delete', data?: unknown, id?: string) {
  const mutationId = id || (data as { id?: string } | undefined)?.id || '';
  console.info(`[API] Sending admin ${operation}: ${resource} ${mutationId}`);
  return fetch(`${apiUrl}/api/admin/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': localStorage.getItem('mommycare_admin_pin') || sessionStorage.getItem('mommycare_admin_pin') || ''
    },
    body: JSON.stringify({ resource, operation, data, id })
  }).then(async response => {
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error(`[API] Admin ${operation} failed:`, response.status, body);
      throw new Error(body.error || 'Live save failed');
    }
    console.info(`[API] Admin ${operation} succeeded: ${resource} ${mutationId}`);
  });
}

function staffRow(staff: NannyProfile) {
  return {
    id: staff.id, name: staff.name, avatar: staff.avatar, age: staff.age, role: staff.role,
    role_title: staff.roleTitle, category_label: staff.categoryLabel, nanny_type: staff.nannyType,
    primary_estate: staff.primaryEstate, available_estates: staff.availableEstates,
    experience_years: staff.experienceYears, rating: staff.rating, review_count: staff.reviewCount,
    monthly_salary_ksh: staff.monthlySalaryKsh, hourly_rate_ksh: staff.hourlyRateKsh,
    tagline: staff.tagline, bio: staff.bio, certifications: staff.certifications, skills: staff.skills,
    languages: staff.languages, education: staff.education, dci_good_conduct_number: staff.dciGoodConductNumber,
    dci_issue_date: staff.dciIssueDate, first_aid_cert_number: staff.firstAidCertNumber,
    medical_clearance_date: staff.medicalClearanceDate, verified_reference_count: staff.verifiedReferenceCount,
    is_available_now: staff.isAvailableNow, can_swim: staff.canSwim,
    has_special_needs_training: staff.hasSpecialNeedsTraining, can_drive: staff.canDrive
  };
}

function insightRow(post: ParentingInsight) {
  return {
    id: post.id, slug: post.slug, title: post.title, excerpt: post.excerpt, category: post.category,
    author: post.author, read_time: post.readTime, published_date: post.publishedDate,
    cover_image: post.coverImage, tags: post.tags, key_takeaways: post.keyTakeaways, content: post.content,
    related_nairobi_topic: post.relatedNairobiTopic, status: post.status || 'published',
    views_count: post.viewsCount || 0, featured: post.featured || false
  };
}

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nannies, setNannies] = useState<NannyProfile[]>(() => 
    isSupabaseConfigured ? [] : safeStorageGet(STORAGE_KEYS.NANNIES, VETTED_NANNIES)
  );

  const [insights, setInsights] = useState<ParentingInsight[]>(() => 
    isSupabaseConfigured ? [] : safeStorageGet(STORAGE_KEYS.INSIGHTS, PARENTING_INSIGHTS)
  );

  const [bookings, setBookings] = useState<BookingSubmission[]>(() => 
    isSupabaseConfigured ? [] : safeStorageGet(STORAGE_KEYS.BOOKINGS, DEFAULT_BOOKINGS)
  );

  const [emergencyRequests, setEmergencyRequests] = useState<EmergencySubmission[]>(() => 
    isSupabaseConfigured ? [] : safeStorageGet(STORAGE_KEYS.EMERGENCY, DEFAULT_EMERGENCY_REQUESTS)
  );

  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);

  const [reviews, setReviews] = useState<Review[]>(() =>
    isSupabaseConfigured ? [] : safeStorageGet(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS)
  );

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => 
    isSupabaseConfigured
      ? DEFAULT_SITE_CONFIG
      : { ...DEFAULT_SITE_CONFIG, ...safeStorageGet(STORAGE_KEYS.CONFIG, {}) }
  );

  const [recentAlert, setRecentAlert] = useState<string | null>(null);

  // Keep the local fallback for development, but never let it override live data.
  useEffect(() => {
    if (!isSupabaseConfigured) safeStorageSet(STORAGE_KEYS.NANNIES, nannies);
  }, [nannies]);

  useEffect(() => {
    if (!isSupabaseConfigured) safeStorageSet(STORAGE_KEYS.INSIGHTS, insights);
  }, [insights]);

  useEffect(() => {
    if (!isSupabaseConfigured) safeStorageSet(STORAGE_KEYS.BOOKINGS, bookings);
  }, [bookings]);

  useEffect(() => {
    if (!isSupabaseConfigured) safeStorageSet(STORAGE_KEYS.EMERGENCY, emergencyRequests);
  }, [emergencyRequests]);

  useEffect(() => {
    if (!isSupabaseConfigured) safeStorageSet(STORAGE_KEYS.CONFIG, siteConfig);
  }, [siteConfig]);

  useEffect(() => {
    if (!isSupabaseConfigured) safeStorageSet(STORAGE_KEYS.REVIEWS, reviews);
  }, [reviews]);

  useEffect(() => {
    let isActive = true;

    const loadMedia = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/media`);
        if (!response.ok) throw new Error(`Media request failed with status ${response.status}`);
        const rows = await response.json() as Record<string, unknown>[];
        if (isActive) setMediaItems(rows.map(mapMediaRow));
      } catch (error) {
        console.error('Unable to load media from the backend:', error);
      }
    };

    void loadMedia();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    let isActive = true;

    const loadAdminSubmissions = async (accessToken: string) => {
      const submissionsResponse = await fetch(`${apiUrl}/api/admin/submissions`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!submissionsResponse.ok) return;

      const submissions = await submissionsResponse.json() as {
        bookings?: Record<string, unknown>[];
        emergencyRequests?: Record<string, unknown>[];
        contactInquiries?: Record<string, unknown>[];
        reviews?: Record<string, unknown>[];
      };
      if (isActive) {
        setBookings((submissions.bookings || []).map(mapBookingRow));
        setEmergencyRequests((submissions.emergencyRequests || []).map(mapEmergencyRow));
        setContactInquiries((submissions.contactInquiries || []).map(mapContactInquiryRow));
        setReviews((submissions.reviews || []).map(mapReviewRow));
      }
    };

    const loadLiveContent = async () => {
      const [staffResult, insightsResult, configResult, reviewsResult] = await Promise.all([
        client.from('staff_profiles').select('*').eq('is_available_now', true).order('created_at', { ascending: false }),
        client.from('insights').select('*').eq('status', 'published').order('published_date', { ascending: false }),
        client.from('site_config').select('*').eq('id', true).maybeSingle()
        ,client.from('reviews').select('*').eq('status', 'published').order('submitted_at', { ascending: false })
      ]);

      const firstError = staffResult.error || insightsResult.error || configResult.error || reviewsResult.error;
      if (firstError) {
        console.error('Unable to load live content from Supabase:', firstError);
        return;
      }

      if (!isActive) return;
      if (staffResult.data) setNannies(staffResult.data.map(row => mapStaffRow(row)));
      if (insightsResult.data) setInsights(insightsResult.data.map(row => mapInsightRow(row)));
      if (configResult.data) {
        setSiteConfig({
          hotlinePhone: configResult.data.hotline_phone,
          emergencyDispatchPhone: configResult.data.emergency_dispatch_phone,
          whatsappPhone: configResult.data.whatsapp_phone || configResult.data.hotline_phone,
          whatsappMessage: configResult.data.whatsapp_message || 'Hello MommyCare, I would like help finding vetted homecare staff.',
          notificationBanner: configResult.data.notification_banner,
          headquartersAddress: configResult.data.headquarters_address,
          conciergeEmail: configResult.data.concierge_email,
          replacementWarrantyDays: configResult.data.replacement_warranty_days
        });
      }
      if (reviewsResult.data) setReviews(reviewsResult.data.map(row => mapReviewRow(row)));

      const { data: sessionData } = await client.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!isActive) return;
      if (accessToken) {
        await loadAdminSubmissions(accessToken);
      } else {
        const reviewResponse = await fetch(`${apiUrl}/api/admin/reviews`, {
          headers: {
            'x-admin-pin': localStorage.getItem('mommycare_admin_pin') || sessionStorage.getItem('mommycare_admin_pin') || ''
          }
        });
        if (reviewResponse.ok) {
          const reviewPayload = await reviewResponse.json() as { reviews?: Record<string, unknown>[] };
          if (isActive) setReviews((reviewPayload.reviews || []).map(mapReviewRow));
        }
      }
    };

    void loadLiveContent();
    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) void loadAdminSubmissions(session.access_token);
    });
    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const triggerAlert = (message: string) => {
    setRecentAlert(message);
    setTimeout(() => {
      setRecentAlert(prev => prev === message ? null : prev);
    }, 4000);
  };

  const dismissAlert = () => setRecentAlert(null);

  // Staff operations
  const addNanny = (newNannyData: Partial<NannyProfile>) => {
    const id = `staff-${Date.now()}`;
    const newNanny: NannyProfile = {
      id,
      name: newNannyData.name || 'New Staff Member',
      avatar: newNannyData.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
      age: newNannyData.age || 28,
      role: newNannyData.role || 'nanny',
      roleTitle: newNannyData.roleTitle || 'Domestic Professional',
      categoryLabel: newNannyData.categoryLabel || 'Homecare Specialist',
      nannyType: newNannyData.nannyType || 'live-in',
      primaryEstate: newNannyData.primaryEstate || 'Kilimani',
      availableEstates: newNannyData.availableEstates || [newNannyData.primaryEstate || 'Kilimani'],
      experienceYears: newNannyData.experienceYears || 3,
      rating: newNannyData.rating || 4.9,
      reviewCount: newNannyData.reviewCount || 1,
      monthlySalaryKsh: newNannyData.monthlySalaryKsh || 25000,
      hourlyRateKsh: newNannyData.hourlyRateKsh || 350,
      tagline: newNannyData.tagline || 'Dedicated and thoroughly vetted domestic professional.',
      bio: newNannyData.bio || 'Experienced household staff with exemplary conduct and positive references.',
      certifications: newNannyData.certifications || ['DCI Certificate of Good Conduct', 'Red Cross First Aid'],
      skills: newNannyData.skills || ['Household care', 'Child supervision', 'Hygiene protocols'],
      languages: newNannyData.languages || ['English', 'Swahili'],
      education: newNannyData.education || 'Certificate in Hospitality / Childcare',
      dciGoodConductNumber: newNannyData.dciGoodConductNumber || `DCI-NBO-${Math.floor(100000 + Math.random() * 900000)}`,
      dciIssueDate: newNannyData.dciIssueDate || '2025-01-10',
      firstAidCertNumber: newNannyData.firstAidCertNumber || `FA-KE-${Math.floor(10000 + Math.random() * 90000)}`,
      medicalClearanceDate: newNannyData.medicalClearanceDate || '2025-01-20',
      verifiedReferenceCount: newNannyData.verifiedReferenceCount || 2,
      isAvailableNow: newNannyData.isAvailableNow ?? true,
      canSwim: newNannyData.canSwim ?? false,
      hasSpecialNeedsTraining: newNannyData.hasSpecialNeedsTraining ?? false,
      canDrive: newNannyData.canDrive ?? false
    };

    setNannies(prev => [newNanny, ...prev]);
    if (supabase) void adminMutation('nannies', 'upsert', staffRow(newNanny)).catch(error => triggerAlert(error.message));
    triggerAlert(`Added staff profile for ${newNanny.name}`);
  };

  const updateNanny = (id: string, updates: Partial<NannyProfile>) => {
    setNannies(prev => {
      const current = prev.find(n => n.id === id);
      const updated = current ? { ...current, ...updates } : null;
      if (updated && supabase) void adminMutation('nannies', 'upsert', staffRow(updated)).catch(error => triggerAlert(error.message));
      return prev.map(n => n.id === id ? { ...n, ...updates } : n);
    });
    triggerAlert(`Updated staff profile: ${updates.name || 'Saved'}`);
  };

  const deleteNanny = (id: string) => {
    setNannies(prev => prev.filter(n => n.id !== id));
    if (supabase) void adminMutation('nannies', 'delete', undefined, id).catch(error => triggerAlert(error.message));
    triggerAlert('Staff profile removed from registry');
  };

  const resetNannies = () => {
    setNannies(VETTED_NANNIES);
    triggerAlert('Reset staff profiles to initial vetted directory');
  };

  // Insights / Posts operations
  const addInsight = (data: Partial<ParentingInsight>) => {
    const id = `post-${Date.now()}`;
    const slug = data.slug || (data.title ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `insight-${Date.now()}`);
    const newPost: ParentingInsight = {
      id,
      slug,
      title: data.title || 'Untitled Post',
      excerpt: data.excerpt || 'Insight overview and household guidance for Nairobi parents and estates.',
      category: data.category || 'Childcare & Safety',
      author: data.author || {
        name: 'Dr. Stella Njoki, MD',
        role: 'Consultant Pediatrician & Child Health Advisor',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop'
      },
      readTime: data.readTime || '5 min read',
      publishedDate: data.publishedDate || new Date().toISOString().split('T')[0],
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop',
      tags: data.tags && data.tags.length > 0 ? data.tags : ['Nairobi Parenting', 'Household Safety'],
      keyTakeaways: data.keyTakeaways && data.keyTakeaways.length > 0 ? data.keyTakeaways : [
        'Establish standard operating procedures for household staff.',
        'Prioritize certified pediatric first aid and verified background checks.'
      ],
      content: data.content && data.content.length > 0 ? data.content : [
        'Providing clear guidelines and proper training for domestic staff is the cornerstone of a peaceful home in Nairobi.'
      ],
      relatedNairobiTopic: data.relatedNairobiTopic || 'Nairobi Household Management & Child Wellbeing'
    };

    setInsights(prev => [newPost, ...prev]);
    if (supabase) void adminMutation('insights', 'upsert', insightRow(newPost)).catch(error => triggerAlert(error.message));
    triggerAlert(`Published new post: "${newPost.title}"`);
  };

  const updateInsight = (id: string, updates: Partial<ParentingInsight>) => {
    setInsights(prev => {
      const current = prev.find(p => p.id === id);
      const updated = current ? { ...current, ...updates } : null;
      if (updated && supabase) void adminMutation('insights', 'upsert', insightRow(updated)).catch(error => triggerAlert(error.message));
      return prev.map(p => p.id === id ? { ...p, ...updates } : p);
    });
    triggerAlert(`Updated post: "${updates.title || 'Saved'}"`);
  };

  const deleteInsight = (id: string) => {
    setInsights(prev => prev.filter(p => p.id !== id));
    if (supabase) void adminMutation('insights', 'delete', undefined, id).catch(error => triggerAlert(error.message));
    triggerAlert('Post deleted successfully');
  };

  const resetInsights = () => {
    setInsights(PARENTING_INSIGHTS);
    triggerAlert('Reset parenting insights to original articles');
  };

  // Form Submissions operations
  const addBooking = (formData: BookingFormData): string => {
    const id = `book-${Date.now()}`;
    const newSubmission: BookingSubmission = {
      ...formData,
      id,
      submittedAt: new Date().toISOString(),
      status: 'New',
      internalNotes: `Submitted from web form for ${formData.parentName} (${formData.estate}).`
    };

    setBookings(prev => [newSubmission, ...prev]);
    void submitToApi('/api/bookings', formData).then(() => {
      console.info('[API] Booking saved successfully:', id);
    }).catch(error => {
      console.error('[API] Booking save failed:', error);
      setBookings(prev => prev.filter(booking => booking.id !== id));
      triggerAlert(`Booking was not saved: ${error.message}`);
    });
    triggerAlert(`New booking received from ${formData.parentName}!`);
    return id;
  };

  const updateBookingStatus = (id: string, status: BookingStatus, notes?: string, coordinator?: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      const updated = {
        ...b,
        status,
        internalNotes: notes !== undefined ? notes : b.internalNotes,
        assignedCoordinator: coordinator !== undefined ? coordinator : b.assignedCoordinator
      };
      if (supabase) void adminMutation('bookings', 'update', {
        id: updated.id, status: updated.status, internal_notes: updated.internalNotes || null,
        assigned_coordinator: updated.assignedCoordinator || null
      }).catch(error => triggerAlert(error.message));
      return updated;
    }));
    triggerAlert(`Booking ${id} status updated to: ${status}`);
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    if (supabase) void adminMutation('bookings', 'delete', undefined, id).catch(error => triggerAlert(error.message));
    triggerAlert('Booking record removed');
  };

  // Emergency Dispatch operations
  const addEmergencyRequest = (formData: EmergencyRequestData): string => {
    const id = `emg-${Date.now()}`;
    const newEmergency: EmergencySubmission = {
      ...formData,
      id,
      submittedAt: new Date().toISOString(),
      status: 'Pending Dispatch',
      internalNotes: `Immediate standby request for ${formData.estate}. Phone: ${formData.phone}`
    };

    setEmergencyRequests(prev => [newEmergency, ...prev]);
    void submitToApi('/api/emergency-requests', formData).then(() => {
      console.info('[API] Emergency request saved successfully:', id);
    }).catch(error => {
      console.error('[API] Emergency request save failed:', error);
      setEmergencyRequests(prev => prev.filter(request => request.id !== id));
      triggerAlert(`Emergency request was not saved: ${error.message}`);
    });
    triggerAlert(`URGENT: Emergency dispatch request from ${formData.parentName} (${formData.estate})!`);
    return id;
  };

  const updateEmergencyStatus = (id: string, status: EmergencyStatus, notes?: string, assignedStaffName?: string) => {
    setEmergencyRequests(prev => prev.map(e => {
      if (e.id !== id) return e;
      const updated = {
        ...e,
        status,
        internalNotes: notes !== undefined ? notes : e.internalNotes,
        assignedStaffName: assignedStaffName !== undefined ? assignedStaffName : e.assignedStaffName
      };
      if (supabase) void adminMutation('emergencyRequests', 'update', {
        id: updated.id, status: updated.status, internal_notes: updated.internalNotes || null,
        assigned_staff_name: updated.assignedStaffName || null
      }).catch(error => triggerAlert(error.message));
      return updated;
    }));
    triggerAlert(`Emergency dispatch ${id} status updated to: ${status}`);
  };

  const deleteEmergencyRequest = (id: string) => {
    setEmergencyRequests(prev => prev.filter(e => e.id !== id));
    if (supabase) void adminMutation('emergencyRequests', 'delete', undefined, id).catch(error => triggerAlert(error.message));
    triggerAlert('Emergency dispatch record removed');
  };

  // Review operations
  const addReview = (reviewData: Omit<Review, 'id' | 'status' | 'submittedAt' | 'date'>): string => {
    const id = `review-${Date.now()}`;
    const newReview: Review = {
      ...reviewData,
      id,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    setReviews(prev => [newReview, ...prev]);
    if (supabase) {
      void submitToApi('/api/reviews', reviewData).catch(error => {
        setReviews(prev => prev.filter(review => review.id !== id));
        triggerAlert(`Review was not saved: ${error.message}`);
      });
    }
    triggerAlert('Thank you. Your review is awaiting moderation.');
    return id;
  };

  const updateReview = (id: string, updates: Partial<Review>) => {
    setReviews(prev => {
      const current = prev.find(review => review.id === id);
      if (!current) return prev;
      const updated = { ...current, ...updates };
      if (supabase) void adminMutation('reviews', 'upsert', {
        id: updated.id, parent_name: updated.parentName, family_role: updated.familyRole,
        estate: updated.estate, nanny_name: updated.nannyName || null, comment: updated.comment,
        rating: updated.rating, children_age: updated.childrenAge || null, service_type: updated.serviceType || null,
        review_date: updated.date, status: updated.status, submitted_at: updated.submittedAt
      }).catch(error => triggerAlert(error.message));
      return prev.map(review => review.id === id ? updated : review);
    });
    triggerAlert('Review updated');
  };

  const deleteReview = (id: string) => {
    setReviews(prev => prev.filter(review => review.id !== id));
    if (supabase) void adminMutation('reviews', 'delete', undefined, id).catch(error => triggerAlert(error.message));
    triggerAlert('Review removed');
  };

  // Media Library operations
  const addMediaItem = (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => {
    const id = `media-${Date.now()}`;
    const newMedia: MediaItem = {
      ...item,
      id,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setMediaItems(prev => [newMedia, ...prev]);
    void adminMutation('media', 'upsert', {
      id: newMedia.id, title: newMedia.title, url: newMedia.url, category: newMedia.category,
      tags: newMedia.tags, dimensions: newMedia.dimensions, uploaded_at: newMedia.uploadedAt
    }).then(() => {
      triggerAlert(`Added photo "${item.title}" to media library`);
    }).catch(error => {
      setMediaItems(prev => prev.filter(media => media.id !== newMedia.id));
      triggerAlert(`Photo was not saved: ${error.message}`);
    });
  };

  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    const current = mediaItems.find(item => item.id === id);
    const updated: MediaItem = {
      id,
      title: updates.title || current?.title || 'Homepage Hero Slide',
      url: updates.url || current?.url || '',
      category: updates.category || current?.category || 'general',
      tags: updates.tags || current?.tags || ['hero-slider', 'homepage'],
      uploadedAt: current?.uploadedAt || new Date().toISOString().split('T')[0],
      dimensions: updates.dimensions || current?.dimensions
    };
    setMediaItems(prev => current
      ? prev.map(item => item.id === id ? { ...item, ...updated } : item)
      : [updated, ...prev]);

    void adminMutation('media', 'upsert', {
      id: updated.id, title: updated.title, url: updated.url, category: updated.category,
      tags: updated.tags, dimensions: updated.dimensions, uploaded_at: updated.uploadedAt
    }).then(() => {
      triggerAlert('Hero slider image updated');
    }).catch(error => {
      setMediaItems(prev => current
        ? prev.map(item => item.id === id ? current : item)
        : prev.filter(item => item.id !== id));
      triggerAlert(`Media update was not saved: ${error.message}`);
    });
  };

  const deleteMediaItem = (id: string) => {
    const deleted = mediaItems.find(item => item.id === id);
    setMediaItems(prev => prev.filter(m => m.id !== id));
    void adminMutation('media', 'delete', undefined, id).then(() => {
      triggerAlert('Media item removed');
    }).catch(error => {
      if (deleted) setMediaItems(prev => [deleted, ...prev]);
      triggerAlert(`Media removal was not saved: ${error.message}`);
    });
  };

  // Site Config operations
  const updateSiteConfig = (updates: Partial<SiteConfig>) => {
    setSiteConfig(prev => {
      const updated = { ...prev, ...updates };
      if (supabase) void adminMutation('siteConfig', 'upsert', {
        id: true, hotline_phone: updated.hotlinePhone, emergency_dispatch_phone: updated.emergencyDispatchPhone,
        whatsapp_phone: updated.whatsappPhone, whatsapp_message: updated.whatsappMessage,
        notification_banner: updated.notificationBanner, headquarters_address: updated.headquartersAddress,
        concierge_email: updated.conciergeEmail, replacement_warranty_days: updated.replacementWarrantyDays
      }).catch(error => triggerAlert(error.message));
      return updated;
    });
    triggerAlert('Site settings updated');
  };

  // Global reset
  const resetAllData = () => {
    setNannies(VETTED_NANNIES);
    setInsights(PARENTING_INSIGHTS);
    setBookings(DEFAULT_BOOKINGS);
    setEmergencyRequests(DEFAULT_EMERGENCY_REQUESTS);
    setMediaItems(DEFAULT_MEDIA);
    setReviews(DEFAULT_REVIEWS);
    setSiteConfig(DEFAULT_SITE_CONFIG);
    triggerAlert('All frontend data and submissions restored to initial state');
  };

  return (
    <ContentContext.Provider value={{
      nannies,
      addNanny,
      updateNanny,
      deleteNanny,
      resetNannies,

      insights,
      addInsight,
      updateInsight,
      deleteInsight,
      resetInsights,

      bookings,
      addBooking,
      updateBookingStatus,
      deleteBooking,

      emergencyRequests,
      addEmergencyRequest,
      updateEmergencyStatus,
      deleteEmergencyRequest,

      contactInquiries,

      reviews,
      addReview,
      updateReview,
      deleteReview,

      mediaItems,
      addMediaItem,
      updateMediaItem,
      deleteMediaItem,

      siteConfig,
      updateSiteConfig,

      resetAllData,

      recentAlert,
      dismissAlert
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
