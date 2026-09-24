import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const app = express();
const port = Number(process.env.PORT || 5000);
const appUrl = process.env.APP_URL || 'http://localhost:3000';
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
let activeAdminPin = process.env.ADMIN_PIN || '2540';

const hasRealValue = (...values: Array<string | undefined>) =>
  values.every(value => Boolean(value && !value.includes('YOUR_')));

const supabase: SupabaseClient | null = hasRealValue(supabaseUrl, supabaseServiceRoleKey)
  ? createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

const allowedOrigins = new Set([
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
  'http://www.tmommycares.com'
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
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

app.get('/api/nannies', requireSupabase, async (_req, res) => {
  const { data, error } = await supabase!
    .from('staff_profiles')
    .select('*')
    .eq('is_available_now', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
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

app.post('/api/admin/content', requireAdminPin, async (req, res) => {
  const { resource, operation, id, data } = req.body || {};
  const table = adminTables[resource as keyof typeof adminTables];
  console.log(`[API] Admin content mutation: ${operation} ${resource} ${id || data?.id || ''}`);
  if (!table || !['upsert', 'update', 'delete'].includes(operation)) {
    return res.status(400).json({ error: 'Invalid content mutation.' });
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
