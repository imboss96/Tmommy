import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_CORE_SERVICE_CATEGORIES, type CoreServiceCategory } from '../src/data/coreServiceCategories';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const app = express();
const port = Number(process.env.PORT || 5000);
const appUrl = process.env.APP_URL || 'http://localhost:3000';
const configuredAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
let activeAdminPin = process.env.ADMIN_PIN || '2540';

const hasRealValue = (...values: Array<string | undefined>) =>
  values.every(value => Boolean(value && !value.includes('YOUR_')));

async function uploadImageBufferToCloudinary(imageBuffer: Buffer) {
  if (!imageBuffer.length) throw new Error('The uploaded image is empty.');
  if (!hasRealValue(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret)) {
    throw new Error('Cloudinary storage is not configured on the API server.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'mommycare';
  const signature = crypto
    .createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${cloudinaryApiSecret}`)
    .digest('hex');
  const form = new FormData();
  const fileBytes = new Uint8Array(imageBuffer.length);
  fileBytes.set(imageBuffer);
  form.append('file', new Blob([fileBytes.buffer], { type: 'image/jpeg' }), 'mommycare-image.jpg');
  form.append('api_key', cloudinaryApiKey!);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
    method: 'POST',
    body: form
  });
  const result = await response.json() as { secure_url?: string; public_id?: string; error?: { message?: string } };
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || 'Cloudinary image upload failed.');
  }

  return { url: result.secure_url, publicId: result.public_id };
}

const supabase: SupabaseClient | null = hasRealValue(supabaseUrl, supabaseServiceRoleKey)
  ? createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

let coreServiceCategories: CoreServiceCategory[] = [...DEFAULT_CORE_SERVICE_CATEGORIES];

const readCoreServiceCategories = async (): Promise<CoreServiceCategory[]> => {
  if (!supabase) return coreServiceCategories;

  const { data, error } = await supabase
    .from('core_service_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[API] Unable to read core service categories from Supabase, using in-memory fallback.', error.message);
    return coreServiceCategories;
  }

  const nextCategories = (data || []).map((item: any) => ({
    id: String(item.id),
    title: String(item.title || ''),
    description: String(item.description || ''),
    action: String(item.action || 'Learn More'),
    href: String(item.href || '/nannies'),
    image: String(item.image || '')
  }));

  if (nextCategories.length > 0) {
    coreServiceCategories = nextCategories;
  }

  return coreServiceCategories;
};

const normalizeCoreServiceCategory = (payload: Partial<CoreServiceCategory>, fallbackId?: string): CoreServiceCategory => {
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const description = typeof payload.description === 'string' ? payload.description.trim() : '';
  const action = typeof payload.action === 'string' ? payload.action.trim() : 'Learn More';
  const href = typeof payload.href === 'string' && payload.href.trim() ? payload.href.trim() : '/nannies';
  const image = typeof payload.image === 'string' ? payload.image.trim() : '';

  if (!title || !description) {
    throw new Error('Title and description are required for a core service category.');
  }

  const computedId = typeof payload.id === 'string' && payload.id.trim()
    ? payload.id.trim()
    : (fallbackId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `category-${Date.now()}`);

  return {
    id: computedId,
    title,
    description,
    action,
    href,
    image
  };
};

const allowedOrigins = new Set([
  ...configuredAllowedOrigins,
  appUrl,
  appUrl.replace(/^https?:\/\//, 'https://www.'),
  appUrl.replace(/^https?:\/\//, 'http://www.'),
  appUrl.replace(/^https?:\/\//, 'https://'),
  appUrl.replace(/^https?:\/\//, 'http://'),
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://tmommycares.com',
  'https://www.tmommycares.com',
  'http://tmommycares.com',
  'http://www.tmommycares.com',
  'https://179.198.201.64',
  'http://179.198.201.64',
  'https://179.198.201.64:3000',
  'http://179.198.201.64:3000'
]);

const isLocalDevelopmentOrigin = (origin: string) => {
  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === 'http:' && ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);
  } catch {
    return false;
  }
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.has(origin) || isLocalDevelopmentOrigin(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Pin');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startedAt}ms)`);
  });
  next();
});

const requireSupabase = (_req: Request, res: Response, next: NextFunction) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase server configuration is missing.' });
  }
  next();
};

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase server configuration is missing.' });
  }

  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authorization.slice('Bearer '.length);
  const { data, error } = await supabase.auth.getUser(token);
  const role = data.user?.app_metadata?.role;
  const email = data.user?.email?.toLowerCase();
  let isInvitedAdmin = false;
  if (email && !error) {
    const { data: admin } = await supabase
      .from('admin_users')
      .select('status')
      .eq('email', email)
      .eq('status', 'active')
      .maybeSingle();
    isInvitedAdmin = Boolean(admin);
  }

  if (error || !data.user || (role !== 'admin' && !isInvitedAdmin)) {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  next();
};

app.get('/api/admin/session', requireAdmin, async (req, res) => {
  const authorization = req.headers.authorization!;
  const token = authorization.slice('Bearer '.length);
  const { data } = await supabase!.auth.getUser(token);
  res.json({ email: data.user?.email, authenticated: true });
});

const requireAdminPin = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['x-admin-pin'] !== activeAdminPin) {
    console.warn(`[API] Admin mutation rejected: invalid or missing PIN (${req.method} ${req.originalUrl})`);
    return res.status(401).json({ error: 'Administrator PIN required.' });
  }
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase server configuration is missing.' });
  }
  next();
};

app.post('/api/admin/pin', requireAdminPin, (req, res) => {
  const newPin = typeof req.body?.newPin === 'string' ? req.body.newPin : '';
  if (!/^\d{4,6}$/.test(newPin)) {
    return res.status(400).json({ error: 'PIN must contain 4 to 6 digits.' });
  }
  activeAdminPin = newPin;
  console.log('[API] Administrator PIN updated for the current server session.');
  res.json({ updated: true });
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'mommycare-api',
    port,
    supabaseConfigured: Boolean(supabase),
    cloudinaryConfigured: hasRealValue(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret)
  });
});

app.get('/api/core-service-categories', async (_req, res) => {
  const categories = await readCoreServiceCategories();
  res.json({ categories });
});

app.get('/api/admin/core-service-categories', requireAdminPin, async (_req, res) => {
  const categories = await readCoreServiceCategories();
  res.json({ categories });
});

app.post('/api/admin/core-service-categories', requireAdminPin, async (req, res) => {
  try {
    const nextCategory = normalizeCoreServiceCategory(req.body || {});

    if (supabase) {
      const { data, error } = await supabase
        .from('core_service_categories')
        .insert({
          id: nextCategory.id,
          title: nextCategory.title,
          description: nextCategory.description,
          action: nextCategory.action,
          href: nextCategory.href,
          image: nextCategory.image,
          sort_order: coreServiceCategories.length
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'A core service category with this id already exists.' });
        }
        throw new Error(error.message);
      }

      coreServiceCategories = await readCoreServiceCategories();
      return res.status(201).json({ category: data });
    }

    if (coreServiceCategories.some(category => category.id === nextCategory.id)) {
      return res.status(409).json({ error: 'A core service category with this id already exists.' });
    }

    coreServiceCategories = [...coreServiceCategories, nextCategory];
    return res.status(201).json({ category: nextCategory });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create the core service category.';
    return res.status(400).json({ error: message });
  }
});

app.put('/api/admin/core-service-categories/:id', requireAdminPin, async (req, res) => {
  try {
    const categoryId = String(req.params.id || '');

    if (supabase) {
      const payload = normalizeCoreServiceCategory({
        ...req.body,
        id: categoryId
      }, categoryId);

      const { data, error } = await supabase
        .from('core_service_categories')
        .update({
          title: payload.title,
          description: payload.description,
          action: payload.action,
          href: payload.href,
          image: payload.image,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Core service category not found.' });
        }
        throw new Error(error.message);
      }

      coreServiceCategories = await readCoreServiceCategories();
      return res.json({ category: data });
    }

    const targetIndex = coreServiceCategories.findIndex(category => category.id === categoryId);
    if (targetIndex === -1) {
      return res.status(404).json({ error: 'Core service category not found.' });
    }

    const updatedCategory = normalizeCoreServiceCategory({
      ...coreServiceCategories[targetIndex],
      ...req.body,
      id: categoryId
    }, categoryId);

    coreServiceCategories = coreServiceCategories.map(category =>
      category.id === categoryId ? updatedCategory : category
    );

    return res.json({ category: updatedCategory });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update the core service category.';
    return res.status(400).json({ error: message });
  }
});

app.delete('/api/admin/core-service-categories/:id', requireAdminPin, async (req, res) => {
  const categoryId = String(req.params.id || '');

  if (supabase) {
    const { error } = await supabase
      .from('core_service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      throw new Error(error.message);
    }

    coreServiceCategories = await readCoreServiceCategories();
    return res.json({ deleted: true, id: categoryId });
  }

  const existing = coreServiceCategories.find(category => category.id === categoryId);
  if (!existing) {
    return res.status(404).json({ error: 'Core service category not found.' });
  }

  coreServiceCategories = coreServiceCategories.filter(category => category.id !== categoryId);
  return res.json({ deleted: true, id: categoryId });
});

app.get('/api/nannies', requireSupabase, async (_req, res) => {
  const { data, error } = await supabase!
    .from('staff_profiles')
    .select('*')
    .eq('is_available_now', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

const providerRoles = new Set(['nanny', 'house-manager', 'house-girl', 'house-boy', 'shamba-boy', 'caretaker', 'cook-chef', 'home-driver']);
const providerArrangements = new Set(['live-in', 'day-care', 'night-nurse', 'temporary-backup']);
const providerEstates = new Set(['Kilimani', 'Westlands', 'Karen', 'Lavington', 'Kileleshwa', 'Runda', 'Muthaiga', 'South C', 'Parklands', 'Gigiri', 'Kiambu Road', 'Ruaka']);

app.post('/api/provider-applications', requireSupabase, async (req, res) => {
  const { id, profile, documents } = req.body || {};
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'A valid application reference is required.' });
  }
  if (!profile || typeof profile !== 'object' || typeof profile.name !== 'string' || profile.name.trim().length < 2 ||
      typeof profile.phone !== 'string' || profile.phone.trim().length < 7 ||
      typeof profile.email !== 'string' || !profile.email.includes('@') ||
      !providerRoles.has(profile.role) || !providerArrangements.has(profile.nannyType) ||
      !providerEstates.has(profile.primaryEstate) || !Array.isArray(documents) || documents.length < 2 || documents.length > 6) {
    return res.status(400).json({ error: 'Complete the required contact, role, availability, and document fields.' });
  }
  const safeDocuments = documents.filter((doc: any) => doc && typeof doc.path === 'string' && doc.path.startsWith(`${id}/`) &&
    typeof doc.name === 'string' && typeof doc.kind === 'string');
  if (safeDocuments.length !== documents.length || !safeDocuments.some((doc: any) => doc.kind === 'identity') || !safeDocuments.some((doc: any) => doc.kind === 'good-conduct')) {
    return res.status(400).json({ error: 'Upload identity and good-conduct documents before submitting.' });
  }
  const { data: storedFiles, error: storageError } = await supabase!.storage.from('provider-documents').list(id, { limit: 10 });
  if (storageError || safeDocuments.some((doc: any) => !storedFiles?.some(file => `${id}/${file.name}` === doc.path))) {
    return res.status(400).json({ error: 'One or more uploaded documents could not be verified. Please upload them again.' });
  }

  const submittedProfile = {
    name: profile.name.trim().slice(0, 100), email: profile.email.trim().slice(0, 160), phone: profile.phone.trim().slice(0, 40),
    role: profile.role, nannyType: profile.nannyType, primaryEstate: profile.primaryEstate,
    age: Math.max(18, Math.min(75, Number(profile.age) || 18)),
    experienceYears: Math.max(0, Math.min(60, Number(profile.experienceYears) || 0)),
    monthlySalaryKsh: Math.max(0, Math.min(1000000, Number(profile.monthlySalaryKsh) || 0)),
    languages: Array.isArray(profile.languages) ? profile.languages.filter((v: unknown) => typeof v === 'string').slice(0, 10) : [],
    skills: Array.isArray(profile.skills) ? profile.skills.filter((v: unknown) => typeof v === 'string').slice(0, 20) : [],
    bio: typeof profile.bio === 'string' ? profile.bio.trim().slice(0, 1500) : '',
    dciGoodConductNumber: typeof profile.dciGoodConductNumber === 'string' ? profile.dciGoodConductNumber.trim().slice(0, 100) : ''
  };
  const { error } = await supabase!.from('provider_applications').insert({ id, profile: submittedProfile, documents: safeDocuments });
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'This application has already been submitted.' });
    console.error(`[API] Provider application save failed: ${error.message}`);
    return res.status(500).json({ error: 'We could not save your application. Please try again.' });
  }
  res.status(201).json({ id, status: 'pending' });
});

app.get('/api/admin/provider-applications', requireAdminPin, async (_req, res) => {
  const { data, error } = await supabase!.from('provider_applications').select('*').order('submitted_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const applications = await Promise.all((data || []).map(async application => {
    const docs = Array.isArray(application.documents) ? application.documents : [];
    const documents = await Promise.all(docs.map(async (doc: any) => {
      const { data: signed } = await supabase!.storage.from('provider-documents').createSignedUrl(doc.path, 900);
      return { ...doc, signedUrl: signed?.signedUrl || '' };
    }));
    return { ...application, documents };
  }));
  res.json({ applications });
});

app.post('/api/admin/provider-applications/:id/:action', requireAdminPin, async (req, res) => {
  const { id, action } = req.params;
  const allowedActions = new Set(['approve', 'reject', 'disable', 'enable', 'note']);
  if (!allowedActions.has(action)) return res.status(400).json({ error: 'Unknown application action.' });
  const { data: application, error: loadError } = await supabase!.from('provider_applications').select('*').eq('id', id).single();
  if (loadError || !application) return res.status(404).json({ error: 'Application not found.' });
  const profile = application.profile as Record<string, any>;
  let status = application.status;
  let staffProfileId = application.staff_profile_id;

  if (action === 'approve') {
    if (application.status !== 'pending' && application.status !== 'rejected') return res.status(409).json({ error: 'Only pending or rejected applications can be approved.' });
    if (req.body?.documentsReviewed !== true) return res.status(400).json({ error: 'Confirm that you reviewed the submitted documents before approval.' });
    staffProfileId = staffProfileId || `provider-${id}`;
    const roleTitle = ({ nanny: 'Nanny & Childcare Professional', 'house-manager': 'House Manager', 'house-girl': 'Housekeeper', 'house-boy': 'Domestic Steward', 'shamba-boy': 'Gardener & Groundskeeper', caretaker: 'Compound Caretaker', 'cook-chef': 'Cook & Chef', 'home-driver': 'Family Driver' } as Record<string, string>)[profile.role] || 'Homecare Professional';
    const publicStaff = {
      id: staffProfileId, name: profile.name, avatar: '', age: profile.age, role: profile.role,
      role_title: roleTitle, category_label: roleTitle, nanny_type: profile.nannyType,
      primary_estate: profile.primaryEstate, available_estates: [profile.primaryEstate],
      experience_years: profile.experienceYears, rating: 0, review_count: 0,
      monthly_salary_ksh: profile.monthlySalaryKsh, hourly_rate_ksh: 0,
      tagline: `${profile.experienceYears} years of experience. Contact MommyCare to discuss availability.`, bio: profile.bio,
      certifications: [], skills: profile.skills || [], languages: profile.languages || [], education: '',
      dci_good_conduct_number: profile.dciGoodConductNumber || '', dci_issue_date: '', first_aid_cert_number: '',
      medical_clearance_date: '', verified_reference_count: 0, is_available_now: true,
      can_swim: false, has_special_needs_training: false, can_drive: profile.role === 'home-driver'
    };
    const { error: staffError } = await supabase!.from('staff_profiles').upsert(publicStaff, { onConflict: 'id' });
    if (staffError) return res.status(500).json({ error: `Could not publish provider profile: ${staffError.message}` });
    status = 'approved';
  } else if (action === 'disable' || action === 'enable') {
    if (!application.staff_profile_id) return res.status(409).json({ error: 'This application has no published provider profile.' });
    const isEnabled = action === 'enable';
    const { error: staffError } = await supabase!.from('staff_profiles').update({ is_available_now: isEnabled }).eq('id', application.staff_profile_id);
    if (staffError) return res.status(500).json({ error: staffError.message });
    status = isEnabled ? 'approved' : 'disabled';
  } else if (action === 'reject') {
    if (application.status !== 'pending' && application.status !== 'rejected') return res.status(409).json({ error: 'Only pending applications can be rejected.' });
    status = 'rejected';
  }
  const adminNotes = typeof req.body?.adminNotes === 'string' ? req.body.adminNotes.slice(0, 2000) : application.admin_notes;
  const updates: Record<string, unknown> = { status, admin_notes: adminNotes, staff_profile_id: staffProfileId };
  if (action !== 'note') updates.reviewed_at = new Date().toISOString();
  const { error: updateError } = await supabase!.from('provider_applications').update(updates).eq('id', id);
  if (updateError) return res.status(500).json({ error: updateError.message });
  res.json({ id, status, staffProfileId, adminNotes });
});

app.get('/api/insights', requireSupabase, async (_req, res) => {
  const { data, error } = await supabase!
    .from('insights')
    .select('*')
    .eq('status', 'published')
    .order('published_date', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/media', requireSupabase, async (_req, res) => {
  const { data, error } = await supabase!
    .from('media_items')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/site-config', requireSupabase, async (_req, res) => {
  const { data, error } = await supabase!
    .from('site_config')
    .select('*')
    .eq('id', true)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/admin/submissions', requireAdmin, async (_req, res) => {
  const [bookingsResult, emergencyResult, reviewsResult] = await Promise.all([
    supabase!.from('bookings').select('*').order('submitted_at', { ascending: false }),
    supabase!.from('emergency_requests').select('*').order('submitted_at', { ascending: false }),
    supabase!.from('reviews').select('*').order('submitted_at', { ascending: false })
  ]);

  const error = bookingsResult.error || emergencyResult.error || reviewsResult.error;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ bookings: bookingsResult.data || [], emergencyRequests: emergencyResult.data || [], reviews: reviewsResult.data || [] });
});

app.get('/api/admin/reviews', requireAdminPin, async (_req, res) => {
  const { data, error } = await supabase!.from('reviews').select('*').order('submitted_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ reviews: data || [] });
});

app.post('/api/bookings', requireSupabase, async (req, res) => {
  const requiredFields = ['parentName', 'phone', 'email', 'estate', 'residenceDetails', 'nannyType', 'startDate'];
  const missingField = requiredFields.find(field => !req.body?.[field]);
  if (missingField) return res.status(400).json({ error: `${missingField} is required.` });

  const booking = req.body;
  const { data, error } = await supabase!
    .from('bookings')
    .insert({
      nanny_id: booking.nannyId || null,
      nanny_name: booking.nannyName || null,
      role: booking.role || null,
      parent_name: booking.parentName,
      phone: booking.phone,
      email: booking.email,
      estate: booking.estate,
      residence_details: booking.residenceDetails,
      residence_type: booking.residenceType || null,
      nanny_type: booking.nannyType,
      number_of_children: Number(booking.numberOfChildren || 0),
      children_ages: booking.childrenAges || '',
      start_date: booking.startDate,
      preferred_trial_days: Number(booking.preferredTrialDays || 3),
      additional_notes: booking.additionalNotes || '',
      needs_cooking: Boolean(booking.needsCooking),
      needs_pet_friendly: Boolean(booking.needsPetFriendly),
      has_garden_or_lawn: Boolean(booking.hasGardenOrLawn)
    })
    .select('id, submitted_at, status')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.post('/api/emergency-requests', requireSupabase, async (req, res) => {
  const requiredFields = ['parentName', 'phone', 'estate', 'requiredTime'];
  const missingField = requiredFields.find(field => !req.body?.[field]);
  if (missingField) return res.status(400).json({ error: `${missingField} is required.` });

  const request = req.body;
  const { data, error } = await supabase!
    .from('emergency_requests')
    .insert({
      parent_name: request.parentName,
      phone: request.phone,
      estate: request.estate,
      requested_role: request.requestedRole || null,
      required_time: request.requiredTime,
      duration_days: Number(request.durationDays || 1),
      children_count: Number(request.childrenCount || 0),
      urgent_notes: request.urgentNotes || ''
    })
    .select('id, submitted_at, status')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.post('/api/contact-inquiries', requireSupabase, async (req, res) => {
  const requiredFields = ['name', 'email', 'phone', 'message'];
  const missingField = requiredFields.find(field => !String(req.body?.[field] || '').trim());
  if (missingField) return res.status(400).json({ error: `${missingField} is required.` });

  const email = String(req.body.email).trim().toLowerCase();
  if (!email.includes('@')) return res.status(400).json({ error: 'A valid email address is required.' });

  const { data, error } = await supabase!
    .from('contact_inquiries')
    .insert({
      name: String(req.body.name).trim(),
      email,
      phone: String(req.body.phone).trim(),
      message: String(req.body.message).trim()
    })
    .select('id, submitted_at, status')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.post('/api/reviews', requireSupabase, async (req, res) => {
  const requiredFields = ['parentName', 'familyRole', 'estate', 'comment'];
  const missingField = requiredFields.find(field => !String(req.body?.[field] || '').trim());
  if (missingField) return res.status(400).json({ error: `${missingField} is required.` });

  const rating = Number(req.body.rating || 5);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be a whole number from 1 to 5.' });
  }

  const { data, error } = await supabase!
    .from('reviews')
    .insert({
      parent_name: String(req.body.parentName).trim(),
      family_role: String(req.body.familyRole).trim(),
      estate: String(req.body.estate).trim(),
      nanny_name: String(req.body.nannyName || '').trim() || null,
      comment: String(req.body.comment).trim(),
      rating,
      children_age: String(req.body.childrenAge || '').trim() || null,
      service_type: String(req.body.serviceType || '').trim() || null,
      review_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      status: 'pending'
    })
    .select('id, submitted_at, status')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.post('/api/cloudinary/signature', requireAdmin, (req, res) => {
  if (!hasRealValue(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret)) {
    return res.status(503).json({ error: 'Cloudinary server configuration is missing.' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = typeof req.body?.folder === 'string' && req.body.folder.trim()
    ? req.body.folder.trim()
    : 'mommycare';
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(`${paramsToSign}${cloudinaryApiSecret}`)
    .digest('hex');

  res.json({
    cloudName: cloudinaryCloudName,
    apiKey: cloudinaryApiKey,
    timestamp,
    folder,
    signature
  });
});

app.post('/api/admin/invite', requireAdmin, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : null;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'A valid email address is required.' });

  const authorization = req.headers.authorization!;
  const token = authorization.slice('Bearer '.length);
  const { data: inviter } = await supabase!.auth.getUser(token);
  const { error: inviteError } = await supabase!.auth.admin.inviteUserByEmail(email, {
    data: { role: 'admin', display_name: displayName }
  });
  if (inviteError && !inviteError.message.toLowerCase().includes('already')) {
    console.error(`[API] Admin invite failed: ${inviteError.message}`);
    return res.status(500).json({ error: inviteError.message });
  }

  const { error: rowError } = await supabase!.from('admin_users').upsert({
    email,
    display_name: displayName,
    invited_by: inviter.user?.email || null,
    status: 'active'
  }, { onConflict: 'email' });
  if (rowError) return res.status(500).json({ error: rowError.message });
  console.log(`[API] Admin invited: ${email}`);
  res.status(201).json({ email, invited: !inviteError });
});

const adminTables = {
  nannies: 'staff_profiles',
  insights: 'insights',
  bookings: 'bookings',
  emergencyRequests: 'emergency_requests',
  media: 'media_items',
  siteConfig: 'site_config',
  reviews: 'reviews'
} as const;

app.post('/api/admin/cloudinary/upload', requireAdminPin, express.raw({ type: 'image/jpeg', limit: '10mb' }), async (req, res) => {
  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json({ error: 'Image data is required.' });
  }

  try {
    const uploaded = await uploadImageBufferToCloudinary(req.body);
    res.json({ url: uploaded.url, cloudinary_public_id: uploaded.publicId || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image upload failed.';
    console.error(`[API] Cloudinary image upload failed: ${message}`, error);
    res.status(502).json({ error: message });
  }
});

app.post('/api/admin/content', requireAdminPin, async (req, res) => {
  const { resource, operation, id, data } = req.body || {};
  const table = adminTables[resource as keyof typeof adminTables];
  console.log(`[API] Admin content mutation: ${operation} ${resource} ${id || data?.id || ''}`);
  if (!table || !['upsert', 'update', 'delete'].includes(operation)) {
    return res.status(400).json({ error: 'Invalid content mutation.' });
  }

  const imageFields = resource === 'media'
    ? [data?.url]
    : resource === 'nannies'
      ? [data?.avatar]
      : resource === 'insights'
        ? [data?.cover_image, data?.author?.avatar]
        : [];
  if (operation !== 'delete' && imageFields.some(value => typeof value === 'string' && value.startsWith('data:'))) {
    return res.status(400).json({ error: 'Upload this image to Cloudinary before saving content.' });
  }

  const query = supabase!.from(table);
  const result = operation === 'delete'
    ? await query.delete().eq('id', id)
    : operation === 'update'
      ? await query.update(data).eq('id', data?.id || id).select().single()
      : await query.upsert(data, { onConflict: 'id' }).select().single();

  if (result.error) {
    console.error(`[API] Supabase ${operation} failed for ${table}: ${result.error.message}`);
    return res.status(500).json({ error: result.error.message });
  }
  res.json(result.data || { id });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`MommyCare API listening on http://localhost:${port}`);
  console.log(`[API] Supabase configured: ${Boolean(supabase)} | Cloudinary configured: ${hasRealValue(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret)}`);
});
