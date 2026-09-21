import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { VETTED_NANNIES } from '../src/data/nannies';
import { PARENTING_INSIGHTS } from '../src/data/insights';
import { DEFAULT_MEDIA } from '../src/data/defaultMedia';
import {
  DEFAULT_BOOKINGS,
  DEFAULT_EMERGENCY_REQUESTS,
  DEFAULT_SITE_CONFIG
} from '../src/data/defaultSubmissions';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('YOUR_') || serviceRoleKey.includes('YOUR_')) {
  throw new Error('Set real SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY values in .env.local before seeding.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const staffRows = VETTED_NANNIES.map(staff => ({
  id: staff.id,
  name: staff.name,
  avatar: staff.avatar,
  age: staff.age,
  role: staff.role,
  role_title: staff.roleTitle,
  category_label: staff.categoryLabel,
  nanny_type: staff.nannyType,
  primary_estate: staff.primaryEstate,
  available_estates: staff.availableEstates,
  experience_years: staff.experienceYears,
  rating: staff.rating,
  review_count: staff.reviewCount,
  monthly_salary_ksh: staff.monthlySalaryKsh,
  hourly_rate_ksh: staff.hourlyRateKsh,
  tagline: staff.tagline,
  bio: staff.bio,
  certifications: staff.certifications,
  skills: staff.skills,
  languages: staff.languages,
  education: staff.education,
  dci_good_conduct_number: staff.dciGoodConductNumber,
  dci_issue_date: staff.dciIssueDate,
  first_aid_cert_number: staff.firstAidCertNumber,
  medical_clearance_date: staff.medicalClearanceDate,
  verified_reference_count: staff.verifiedReferenceCount,
  is_available_now: staff.isAvailableNow,
  can_swim: staff.canSwim,
  has_special_needs_training: staff.hasSpecialNeedsTraining,
  can_drive: staff.canDrive
}));

const insightRows = PARENTING_INSIGHTS.map(insight => ({
  id: insight.id,
  slug: insight.slug,
  title: insight.title,
  excerpt: insight.excerpt,
  category: insight.category,
  author: insight.author,
  read_time: insight.readTime,
  published_date: insight.publishedDate,
  cover_image: insight.coverImage,
  tags: insight.tags,
  key_takeaways: insight.keyTakeaways,
  content: insight.content,
  related_nairobi_topic: insight.relatedNairobiTopic,
  status: insight.status || 'published',
  views_count: insight.viewsCount || 0,
  featured: insight.featured || false
}));

const mediaRows = DEFAULT_MEDIA.map(media => ({
  id: media.id,
  title: media.title,
  url: media.url,
  category: media.category,
  tags: media.tags,
  dimensions: media.dimensions,
  uploaded_at: media.uploadedAt
}));

const bookingRows = DEFAULT_BOOKINGS.map(booking => ({
  id: booking.id,
  nanny_id: VETTED_NANNIES.some(staff => staff.id === booking.nannyId) ? booking.nannyId : null,
  nanny_name: booking.nannyName || null,
  role: booking.role || null,
  parent_name: booking.parentName,
  phone: booking.phone,
  email: booking.email,
  estate: booking.estate,
  residence_details: booking.residenceDetails,
  residence_type: booking.residenceType || null,
  nanny_type: booking.nannyType,
  number_of_children: booking.numberOfChildren,
  children_ages: booking.childrenAges,
  start_date: booking.startDate,
  preferred_trial_days: booking.preferredTrialDays,
  additional_notes: booking.additionalNotes,
  needs_cooking: booking.needsCooking,
  needs_pet_friendly: booking.needsPetFriendly,
  has_garden_or_lawn: booking.hasGardenOrLawn || false,
  status: booking.status,
  internal_notes: booking.internalNotes || null,
  assigned_coordinator: booking.assignedCoordinator || null,
  submitted_at: booking.submittedAt
}));

const emergencyRows = DEFAULT_EMERGENCY_REQUESTS.map(request => ({
  id: request.id,
  parent_name: request.parentName,
  phone: request.phone,
  estate: request.estate,
  requested_role: request.requestedRole || null,
  required_time: request.requiredTime,
  duration_days: request.durationDays,
  children_count: request.childrenCount,
  urgent_notes: request.urgentNotes,
  status: request.status,
  internal_notes: request.internalNotes || null,
  assigned_staff_name: request.assignedStaffName || null,
  submitted_at: request.submittedAt
}));

async function upsertTable(table: string, rows: unknown[]) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`Seeded ${rows.length} ${table} record(s).`);
}

async function seed() {
  await upsertTable('staff_profiles', staffRows);
  await upsertTable('insights', insightRows);
  await upsertTable('media_items', mediaRows);
  await upsertTable('bookings', bookingRows);
  await upsertTable('emergency_requests', emergencyRows);

  const { error: configError } = await supabase.from('site_config').upsert({
    id: true,
    hotline_phone: DEFAULT_SITE_CONFIG.hotlinePhone,
    emergency_dispatch_phone: DEFAULT_SITE_CONFIG.emergencyDispatchPhone,
    notification_banner: DEFAULT_SITE_CONFIG.notificationBanner,
    headquarters_address: DEFAULT_SITE_CONFIG.headquartersAddress,
    concierge_email: DEFAULT_SITE_CONFIG.conciergeEmail,
    replacement_warranty_days: DEFAULT_SITE_CONFIG.replacementWarrantyDays
  }, { onConflict: 'id' });

  if (configError) throw new Error(`site_config: ${configError.message}`);
  console.log('Seeded site_config record.');
  console.log('Supabase seed completed successfully.');
}

void seed().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
