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
const appUrl = process.env.APP_URL || 'https://www.tmommycares.com';
const publicAppUrl = (() => {
  try {
    const configuredUrl = new URL(appUrl);
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(configuredUrl.hostname)) {
      return 'https://www.tmommycares.com';
    }
    return configuredUrl.origin;
  } catch {
    return 'https://www.tmommycares.com';
  }
})();
const configuredAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
const paymentConfigEncryptionKey = process.env.PAYMENT_CONFIG_ENCRYPTION_KEY || process.env.MPESA_CONFIG_ENCRYPTION_KEY || '';
const paymentCallbackUrl = process.env.PAYMENT_CALLBACK_URL || process.env.MPESA_CALLBACK_URL || '';
const tinyPesaApiUrl = (process.env.TINYPESA_API_URL || 'https://api.tinypesa.com/api/v1').trim().replace(/\/+$/, '');
const tinyPesaSandboxApiUrl = (process.env.TINYPESA_SANDBOX_API_URL || tinyPesaApiUrl).trim().replace(/\/+$/, '');
const brevoApiKey = process.env.BREVO_API_KEY;
const notificationEmail = process.env.NOTIFICATION_EMAIL || 'info@tmommycares.com';
const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'app@tmommycares.com';
const brevoSenderName = process.env.BREVO_SENDER_NAME || 'Tmommycare';

const hasRealValue = (...values: Array<string | undefined>) =>
  values.every(value => Boolean(value && !value.includes('YOUR_')));

const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, character => htmlEscapes[character]);

async function sendSubmissionNotification(
  submissionType: string,
  details: Record<string, string | number | boolean | null | undefined>
) {
  if (!brevoApiKey || brevoApiKey.includes('YOUR_') ||
      !notificationEmail || notificationEmail.includes('YOUR_') ||
      !brevoSenderEmail || brevoSenderEmail.includes('YOUR_')) {
    console.error(`[API] Email notification for ${submissionType} was not sent: configure BREVO_API_KEY and BREVO_SENDER_EMAIL.`);
    return;
  }

  const fields = Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => [label, String(value).slice(0, 2000)] as const);
  const htmlRows = fields
    .map(([label, value]) => `<tr><td style="width:38%;padding:12px 14px;border-bottom:1px solid #eee7df;color:#635e59;font-size:13px;font-weight:700;vertical-align:top">${escapeHtml(label)}</td><td style="padding:12px 14px;border-bottom:1px solid #eee7df;color:#1a201c;font-size:14px;line-height:1.5;vertical-align:top;white-space:pre-wrap;word-break:break-word">${escapeHtml(value)}</td></tr>`)
    .join('');
  const textDetails = fields.map(([label, value]) => `${label}: ${value}`).join('\n');
  const logoUrl = `${publicAppUrl}/tmommycare-logo-transparent.png`;
  const htmlContent = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f7f3ef;font-family:Arial,Helvetica,sans-serif;color:#1a201c">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f7f3ef;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background-color:#ffffff;border:1px solid #e8dfd3;border-radius:16px;overflow:hidden">
        <tr><td style="height:8px;background-color:#1d432d;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td align="center" style="padding:26px 28px 20px;background-color:#fff">
          <img src="${escapeHtml(logoUrl)}" width="190" alt="Tmommycare - Quality Care. Safer Homes." style="display:block;width:190px;max-width:80%;height:auto;border:0;outline:none;text-decoration:none">
        </td></tr>
        <tr><td style="padding:26px 30px;background-color:#faf7f2;border-top:1px solid #eee7df;border-bottom:1px solid #eee7df">
          <p style="margin:0 0 8px;color:#d96b43;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">New submission</p>
          <h1 style="margin:0;color:#1d432d;font-size:24px;line-height:1.3">${escapeHtml(submissionType)}</h1>
          <p style="margin:9px 0 0;color:#635e59;font-size:14px;line-height:1.6">A new submission has been received and is ready for your team to review.</p>
        </td></tr>
        <tr><td style="padding:20px 22px 26px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #eee7df;border-collapse:separate;border-spacing:0;border-radius:10px;overflow:hidden">${htmlRows}</table>
        </td></tr>
        <tr><td align="center" style="padding:18px 24px;background-color:#1d432d;color:#e8f0ea;font-size:12px;line-height:1.6">
          Tmommycare <span style="color:#f4a261">&bull;</span> Quality Care. Safer Homes.<br>
          <a href="${escapeHtml(publicAppUrl)}" style="color:#ffffff;text-decoration:underline">Visit Tmommycare</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: brevoSenderName, email: brevoSenderEmail },
        to: [{ email: notificationEmail }],
        subject: `New Tmommycare ${submissionType}`,
        htmlContent,
        textContent: `New ${submissionType}\n\n${textDetails}`
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const errorDetails = (await response.text()).slice(0, 500);
      throw new Error(`Brevo returned ${response.status}: ${errorDetails}`);
    }

    console.info(`[API] Email notification sent for ${submissionType}.`);
  } catch (error) {
    console.error(`[API] Email notification for ${submissionType} failed:`, error);
  }
}

async function uploadImageBufferToCloudinary(imageBuffer: Buffer, contentType: 'image/jpeg' | 'image/png' = 'image/jpeg') {
  if (!imageBuffer.length) throw new Error('The uploaded image is empty.');
  if (!hasRealValue(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret)) {
    throw new Error('Cloudinary storage is not configured on the API server.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'Tmommycare';
  const signature = crypto
    .createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${cloudinaryApiSecret}`)
    .digest('hex');
  const form = new FormData();
  const fileBytes = new Uint8Array(imageBuffer.length);
  fileBytes.set(imageBuffer);
  const extension = contentType === 'image/png' ? 'png' : 'jpg';
  form.append('file', new Blob([fileBytes.buffer], { type: contentType }), `Tmommycare-image.${extension}`);
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

const findAuthUserByEmail = async (email: string) => {
  if (!supabase) throw new Error('Supabase server configuration is missing.');
  const normalizedEmail = email.toLowerCase();
  const perPage = 1000;
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const user = data.users.find(candidate => candidate.email?.toLowerCase() === normalizedEmail);
    if (user) return user;
    if (data.users.length < perPage) return null;
  }
};

const getPaymentEncryptionKey = () => {
  if (!/^[0-9a-f]{64}$/i.test(paymentConfigEncryptionKey)) {
    throw new Error('PAYMENT_CONFIG_ENCRYPTION_KEY (or MPESA_CONFIG_ENCRYPTION_KEY) must be a 64-character hexadecimal key.');
  }
  return Buffer.from(paymentConfigEncryptionKey, 'hex');
};

const encryptPaymentSecret = (value: string) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getPaymentEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `v1:${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`;
};

const decryptPaymentSecret = (value: string) => {
  const [version, ivHex, tagHex, encryptedHex] = value.split(':');
  if (version !== 'v1' || !/^[0-9a-f]{24}$/i.test(ivHex || '') ||
      !/^[0-9a-f]{32}$/i.test(tagHex || '') || !encryptedHex || !/^(?:[0-9a-f]{2})+$/i.test(encryptedHex)) {
    throw new Error('Stored M-Pesa credentials have an invalid encrypted format.');
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', getPaymentEncryptionKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]).toString('utf8');
};

const normalizePaymentPhoneNumber = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const digits = value.replace(/[\s()+-]/g, '');
  const normalized = digits.startsWith('0') ? `254${digits.slice(1)}` : digits;
  return /^254[17]\d{8}$/.test(normalized) ? normalized : null;
};

const normalizeProviderLookupEmail = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeProviderLookupPhone = (value: unknown) => {
  if (typeof value !== 'string') return '';
  const normalized = normalizePaymentPhoneNumber(value);
  if (normalized) return normalized;
  const digits = value.replace(/\D/g, '');
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  return '';
};

const providerReferenceAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const buildProviderReferencePrefix = () => {
  const bytes = crypto.randomBytes(4);
  return Array.from(bytes).map(byte => providerReferenceAlphabet[byte % providerReferenceAlphabet.length]).join('');
};

const allocateProviderReferenceCode = async (createdAt: Date) => {
  const dateIso = createdAt.toISOString().slice(0, 10);
  const day = createdAt.getUTCDate().toString().padStart(2, '0');
  const month = (createdAt.getUTCMonth() + 1).toString().padStart(2, '0');
  const { data, error } = await supabase!.rpc('next_provider_reference_no', { p_date: dateIso });
  if (error || typeof data !== 'number' || !Number.isInteger(data) || data <= 0) {
    throw new Error(error?.message || 'Could not allocate a provider reference number.');
  }
  if (data > 9999) {
    throw new Error('Daily provider reference limit reached. Please try again tomorrow.');
  }
  const sequence = String(data).padStart(4, '0');
  return `${buildProviderReferencePrefix()}${day}${month}${sequence}`;
};

const getTinyPesaBaseUrl = (environment: string) =>
  environment === 'production' ? tinyPesaApiUrl : tinyPesaSandboxApiUrl;

const isPaymentCallbackConfigured = () => {
  try {
    const url = new URL(paymentCallbackUrl);
    return url.protocol === 'https:' && !['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname);
  } catch {
    return false;
  }
};

const isMissingPaymentSchema = (error: { code?: string; message?: string }) =>
  error.code === 'PGRST205' || error.code === '42P01' ||
  Boolean(
    error.message?.includes('payment_settings') ||
    error.message?.includes('mpesa_settings') ||
    error.message?.includes('provider_payment_attempts') ||
    error.message?.includes('provider_applications') ||
    error.message?.includes('provider_reference_sequences') ||
    error.message?.includes('next_provider_reference_no') ||
    error.message?.includes('reference_code') ||
    error.message?.includes('provider_phone')
  );

const reportPaymentSchemaError = (operation: string, error: { code?: string; message?: string }, res: Response) => {
  console.error(`[API] ${operation} failed (${error.code || 'unknown'}): ${error.message || 'Unknown database error'}`);
  if (!isMissingPaymentSchema(error)) return false;
  res.status(503).json({
    error: 'Provider payments are not initialized in Supabase. Apply migrations 008_provider_registration_mpesa.sql through 012_provider_reference_codes.sql, then retry.'
  });
  return true;
};

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

const getBearerToken = (request: Request) => {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return null;
  return authorization.slice('Bearer '.length);
};

const getAuthenticatedUserFromRequest = async (request: Request) => {
  const token = getBearerToken(request);
  if (!token) return null;
  const { data, error } = await supabase!.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
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
  let adminStatus: string | null = null;
  if (email && !error) {
    const { data: admin, error: adminLookupError } = await supabase
      .from('admin_users')
      .select('status')
      .eq('email', email)
      .maybeSingle();
    if (adminLookupError) {
      console.error(`[API] Admin access lookup failed: ${adminLookupError.message}`);
      return res.status(500).json({ error: 'Unable to verify administrator access.' });
    }
    adminStatus = admin?.status || null;
  }

  const isInvitedAdmin = adminStatus === 'active';
  const isSuspendedAdmin = adminStatus === 'disabled';
  if (error || !data.user || isSuspendedAdmin || (role !== 'admin' && !isInvitedAdmin)) {
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

app.post('/api/admin/contract-number', requireAdmin, async (_req, res) => {
  const { data, error } = await supabase!.rpc('next_contract_number', {
    p_year: new Date().getFullYear()
  });
  if (error || typeof data !== 'string') {
    console.error(`[API] Contract number allocation failed: ${error?.message || 'Invalid response from contract numbering function.'}`);
    return res.status(500).json({ error: 'Could not assign a contract number. Ensure the latest database migrations are applied.' });
  }
  res.json({ contractNumber: data });
});

app.get('/api/provider-payment-settings', requireSupabase, async (_req, res) => {
  const { data, error } = await supabase!.from('payment_settings').select('*').eq('id', true).maybeSingle();
  if (error) {
    if (reportPaymentSchemaError('Public M-Pesa settings lookup', error, res)) return;
    return res.status(500).json({ error: 'Could not load provider payment settings.' });
  }
  const encryptionConfigured = /^[0-9a-f]{64}$/i.test(paymentConfigEncryptionKey);
  const callbackConfigured = isPaymentCallbackConfigured();
  res.json({
    available: Boolean(data?.enabled && data.consumer_key_ciphertext && data.consumer_secret_ciphertext &&
      encryptionConfigured && callbackConfigured)
  });
});

app.get('/api/provider-payments/:id', requireSupabase, async (req, res) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) {
    return res.status(400).json({ error: 'A valid payment reference is required.' });
  }
  const { data, error } = await supabase!.from('provider_payment_attempts')
    .select('*')
    .eq('id', req.params.id).maybeSingle();
  if (error) {
    if (reportPaymentSchemaError('Provider payment status lookup', error, res)) return;
    return res.status(500).json({ error: 'Could not check payment status.' });
  }
  if (!data) return res.status(404).json({ error: 'Payment request was not found.' });
  if (data.status === 'pending' && data.result_code === 0 && data.payment_receipt_number) {
    try {
      await verifyMpesaPaymentAndCreateApplication(data);
      const { data: confirmed, error: confirmError } = await supabase!.from('provider_payment_attempts')
        .select('status, amount_kes, payment_receipt_number, result_description').eq('id', req.params.id).single();
      if (confirmError) return res.status(500).json({ error: 'Payment confirmation was saved but could not be loaded.' });
      return res.json({
        status: confirmed.status,
        amountKes: confirmed.amount_kes,
        receiptNumber: confirmed.payment_receipt_number,
        monthlySalaryRange: typeof (data.profile as Record<string, any> | null)?.monthlySalaryRange === 'string'
          ? (data.profile as Record<string, any>).monthlySalaryRange
          : null,
        message: confirmed.status === 'failed' ? confirmed.result_description : undefined
      });
    } catch (verificationError) {
      const message = verificationError instanceof Error ? verificationError.message : 'Payment verification is still pending.';
      console.error(`[API] M-Pesa payment status verification pending for ${req.params.id}: ${message}`);
    }
  }
  res.json({
    status: data.status,
    amountKes: data.amount_kes,
    receiptNumber: data.payment_receipt_number,
    monthlySalaryRange: typeof (data.profile as Record<string, any> | null)?.monthlySalaryRange === 'string'
      ? (data.profile as Record<string, any>).monthlySalaryRange
      : null,
    message: data.status === 'failed' ? data.result_description : undefined
  });
});

app.post('/api/provider/my-applications', requireSupabase, async (req, res) => {
  const providerEmail = normalizeProviderLookupEmail(req.body?.email);
  const providerPhone = normalizeProviderLookupPhone(req.body?.phone);
  if (!providerEmail && !providerPhone) {
    return res.status(400).json({ error: 'Enter the email or phone number used when submitting your application.' });
  }

  const applicationMap = new Map<string, Record<string, any>>();
  const draftMap = new Map<string, Record<string, any>>();

  const mergeById = (rows: Record<string, any>[] | null | undefined, target: Map<string, Record<string, any>>) => {
    (rows || []).forEach(row => {
      if (typeof row?.id === 'string' && !target.has(row.id)) target.set(row.id, row);
    });
  };

  const loadApplications = async (field: 'provider_email' | 'provider_phone', value: string) => {
    const { data, error } = await supabase!
      .from('provider_applications')
      .select('id, reference_code, status, admin_notes, submitted_at, reviewed_at, profile')
      .eq(field, value)
      .order('submitted_at', { ascending: false });
    if (error) {
      if (reportPaymentSchemaError('Provider applications self-serve lookup', error, res)) return false;
      res.status(500).json({ error: 'Could not load your applications.' });
      return false;
    }
    mergeById(data as Record<string, any>[], applicationMap);
    return true;
  };

  const loadDrafts = async (field: 'provider_email' | 'provider_phone', value: string) => {
    const { data, error } = await supabase!
      .from('provider_payment_attempts')
      .select('id, reference_code, status, amount_kes, result_description, created_at, updated_at, profile')
      .eq(field, value)
      .in('status', ['awaiting_payment', 'initiating', 'pending', 'failed'])
      .order('created_at', { ascending: false });
    if (error) {
      if (reportPaymentSchemaError('Provider payment draft self-serve lookup', error, res)) return false;
      res.status(500).json({ error: 'Could not load your payment drafts.' });
      return false;
    }
    mergeById(data as Record<string, any>[], draftMap);
    return true;
  };

  if (providerEmail) {
    if (!(await loadApplications('provider_email', providerEmail))) return;
    if (!(await loadDrafts('provider_email', providerEmail))) return;
  }
  if (providerPhone) {
    if (!(await loadApplications('provider_phone', providerPhone))) return;
    if (!(await loadDrafts('provider_phone', providerPhone))) return;
  }

  const applications = Array.from(applicationMap.values()).sort((a, b) =>
    String(b.submitted_at || '').localeCompare(String(a.submitted_at || ''))
  );
  const paymentDrafts = Array.from(draftMap.values()).sort((a, b) =>
    String(b.created_at || '').localeCompare(String(a.created_at || ''))
  );

  return res.json({
    applications: applications.map((application: Record<string, any>) => ({
      id: application.id,
      referenceCode: typeof application.reference_code === 'string' ? application.reference_code : application.id,
      status: application.status,
      notes: application.admin_notes || '',
      submittedAt: application.submitted_at || null,
      reviewedAt: application.reviewed_at || null,
      monthlySalaryRange: typeof application.profile?.monthlySalaryRange === 'string' ? application.profile.monthlySalaryRange : null
    })),
    paymentDrafts: paymentDrafts.map((draft: Record<string, any>) => ({
      id: draft.id,
      referenceCode: typeof draft.reference_code === 'string' ? draft.reference_code : draft.id,
      status: draft.status,
      amountKes: Number(draft.amount_kes) || 0,
      message: draft.result_description || '',
      createdAt: draft.created_at || null,
      updatedAt: draft.updated_at || null,
      monthlySalaryRange: typeof draft.profile?.monthlySalaryRange === 'string' ? draft.profile.monthlySalaryRange : null
    }))
  });
});

app.post('/api/provider-payments/:id/cancel', requireSupabase, async (req, res) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) {
    return res.status(400).json({ error: 'A valid payment reference is required.' });
  }
  const { data: attempt, error: loadError } = await supabase!.from('provider_payment_attempts')
    .select('id, status')
    .eq('id', req.params.id)
    .maybeSingle();
  if (loadError) {
    if (reportPaymentSchemaError('Provider payment cancel lookup', loadError, res)) return;
    return res.status(500).json({ error: 'Could not cancel payment request.' });
  }
  if (!attempt) return res.status(404).json({ error: 'Payment request was not found.' });
  if (attempt.status === 'paid') {
    return res.status(409).json({ error: 'This payment has already been confirmed and cannot be cancelled.' });
  }
  if (attempt.status === 'awaiting_payment' || attempt.status === 'failed') {
    return res.json({ status: attempt.status, message: 'No active payment request was running. You can retry now.' });
  }
  const { error: cancelError } = await supabase!.from('provider_payment_attempts').update({
    status: 'failed',
    result_code: null,
    result_description: 'Payment prompt was cancelled. You can retry now.',
    payment_receipt_number: null,
    merchant_request_id: null,
    checkout_request_id: null,
    payment_config_snapshot: {},
    updated_at: new Date().toISOString()
  }).eq('id', req.params.id).in('status', ['initiating', 'pending']);
  if (cancelError) {
    console.error(`[API] Provider payment cancel failed for ${req.params.id}: ${cancelError.message}`);
    return res.status(500).json({ error: 'Could not cancel payment request.' });
  }
  return res.json({ status: 'failed', message: 'Payment prompt cancelled. You can retry now.' });
});

app.get(['/api/admin/payment-settings', '/api/admin/mpesa-settings'], requireAdmin, async (_req, res) => {
  const { data, error } = await supabase!.from('payment_settings').select('*').eq('id', true).maybeSingle();
  if (error) {
    if (reportPaymentSchemaError('Admin M-Pesa settings lookup', error, res)) return;
    return res.status(500).json({ error: 'Could not load M-Pesa settings.' });
  }
  const baseFeeKes = Number.isInteger(Number(data?.fee_kes)) ? Number(data?.fee_kes) : 0;
  res.json({
    enabled: data?.enabled || false,
    feeKes: baseFeeKes,
    salaryBandFees: normalizeSalaryBandFees(data?.salary_band_fees, baseFeeKes),
    environment: data?.environment || 'sandbox',
    merchantType: data?.merchant_type || 'paybill',
    shortcode: data?.shortcode || '',
    accountReference: data?.account_reference || 'Tmommycare',
    credentialsConfigured: Boolean(data?.consumer_key_ciphertext && data?.consumer_secret_ciphertext),
    encryptionKeyConfigured: /^[0-9a-f]{64}$/i.test(paymentConfigEncryptionKey),
    callbackConfigured: isPaymentCallbackConfigured()
  });
});

app.put(['/api/admin/payment-settings', '/api/admin/mpesa-settings'], requireAdmin, async (req, res) => {
  const input = req.body || {};
  const environment = input.environment;
  const merchantType = input.merchantType;
  const feeKes = Number(input.feeKes);
  const shortcode = typeof input.shortcode === 'string' ? input.shortcode.trim() : '';
  const accountReference = typeof input.accountReference === 'string' ? input.accountReference.trim() : '';
  if (typeof input.enabled !== 'boolean' || !Number.isInteger(feeKes) || feeKes < 0 || feeKes > 1000000 ||
      !['sandbox', 'production'].includes(environment) || !['paybill', 'till'].includes(merchantType) ||
      !/^\d{5,7}$/.test(shortcode) || !/^[A-Za-z0-9]{1,12}$/.test(accountReference)) {
    return res.status(400).json({ error: 'Enter a valid fee, environment, merchant type, shortcode, and account reference (up to 12 letters or digits).' });
  }
  if (input.salaryBandFees !== undefined && (!input.salaryBandFees || typeof input.salaryBandFees !== 'object' || Array.isArray(input.salaryBandFees))) {
    return res.status(400).json({ error: 'Salary-band fees must be provided as an object.' });
  }
  if (input.salaryBandFees && providerSalaryBandLabels.some(band => {
    const value = input.salaryBandFees[band];
    return value !== undefined && (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 1000000);
  })) {
    return res.status(400).json({ error: 'Each salary-band fee must be a whole number between 0 and 1,000,000.' });
  }
  if ([input.consumerKey, input.consumerSecret, input.passkey].some(value => value !== undefined &&
      (typeof value !== 'string' || value.length > 512))) {
    return res.status(400).json({ error: 'TinyPesa credential fields must be text no longer than 512 characters.' });
  }
  if (input.enabled) {
    if (!isPaymentCallbackConfigured()) {
      return res.status(400).json({ error: 'Configure PAYMENT_CALLBACK_URL (or MPESA_CALLBACK_URL) as a public HTTPS callback URL on the API server before enabling payments.' });
    }
  }
  try { getPaymentEncryptionKey(); }
  catch (keyError) {
    const message = keyError instanceof Error ? keyError.message : 'Payment credential encryption is not configured.';
    return res.status(503).json({ error: message });
  }
  const { data: existing, error: loadError } = await supabase!.from('payment_settings').select('*').eq('id', true).maybeSingle();
  if (loadError) {
    if (reportPaymentSchemaError('Admin M-Pesa credential lookup', loadError, res)) return;
    return res.status(500).json({ error: 'Could not load existing M-Pesa credentials.' });
  }
  const credentialValues = ['consumerKey', 'consumerSecret', 'passkey'] as const;
  const cipherFields = ['consumer_key_ciphertext', 'consumer_secret_ciphertext', 'passkey_ciphertext'] as const;
  const encrypted: Record<string, string> = {};
  for (let index = 0; index < credentialValues.length; index += 1) {
    const field = credentialValues[index];
    const cipherField = cipherFields[index];
    const value = input[field];
    if (typeof value === 'string' && value.trim()) encrypted[cipherField] = encryptPaymentSecret(value.trim());
    else encrypted[cipherField] = existing?.[cipherField] || '';
  }
  if (input.enabled && (!encrypted.consumer_key_ciphertext || !encrypted.consumer_secret_ciphertext)) {
    return res.status(400).json({ error: 'Enter the TinyPesa Username and Link API Key before enabling payments.' });
  }
  const { error } = await supabase!.from('payment_settings').upsert({
    id: true, enabled: input.enabled, fee_kes: feeKes, environment, merchant_type: merchantType,
    salary_band_fees: normalizeSalaryBandFees(input.salaryBandFees, feeKes),
    shortcode, account_reference: accountReference, ...encrypted, updated_at: new Date().toISOString()
  }, { onConflict: 'id' });
  if (error) {
    console.error(`[API] M-Pesa settings save failed: ${error.message}`);
    return res.status(500).json({ error: 'Could not save M-Pesa settings.' });
  }
  res.json({ saved: true });
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'Tmommycare-api',
    port,
    supabaseConfigured: Boolean(supabase),
    cloudinaryConfigured: hasRealValue(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret)
  });
});

app.get('/api/core-service-categories', async (_req, res) => {
  const categories = await readCoreServiceCategories();
  res.json({ categories });
});

app.get('/api/admin/core-service-categories', requireAdmin, async (_req, res) => {
  const categories = await readCoreServiceCategories();
  res.json({ categories });
});

app.post('/api/admin/core-service-categories', requireAdmin, async (req, res) => {
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

app.put('/api/admin/core-service-categories/:id', requireAdmin, async (req, res) => {
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

app.delete('/api/admin/core-service-categories/:id', requireAdmin, async (req, res) => {
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

const providerRoles = new Set(['nanny', 'babysitter', 'house-manager', 'house-girl', 'mamafua', 'house-boy', 'shamba-boy', 'caretaker', 'cook-chef', 'home-driver']);
const providerArrangements = new Set(['live-in', 'day-care', 'night-nurse', 'temporary-backup']);
const providerSalaryRanges: Record<string, { monthlySalaryKsh: number; registrationFeeIncrementKes: number }> = {
  'KES 6,000–8,000': { monthlySalaryKsh: 7000, registrationFeeIncrementKes: 0 },
  'KES 8,001–12,000': { monthlySalaryKsh: 10000, registrationFeeIncrementKes: 200 },
  'KES 12,001–15,000': { monthlySalaryKsh: 13500, registrationFeeIncrementKes: 250 },
  'KES 15,001–20,000': { monthlySalaryKsh: 17500, registrationFeeIncrementKes: 300 },
  'Above KES 20,000': { monthlySalaryKsh: 25000, registrationFeeIncrementKes: 500 }
};
const providerSalaryBandLabels = Object.keys(providerSalaryRanges);

const getDefaultSalaryBandFees = (baseFeeKes: number) => providerSalaryBandLabels.reduce<Record<string, number>>((fees, band) => {
  fees[band] = Math.max(0, baseFeeKes + providerSalaryRanges[band].registrationFeeIncrementKes);
  return fees;
}, {});

const normalizeSalaryBandFees = (rawFees: unknown, baseFeeKes: number) => {
  const defaults = getDefaultSalaryBandFees(baseFeeKes);
  if (!rawFees || typeof rawFees !== 'object' || Array.isArray(rawFees)) return defaults;
  const source = rawFees as Record<string, unknown>;
  return providerSalaryBandLabels.reduce<Record<string, number>>((fees, band) => {
    const value = source[band];
    fees[band] = Number.isInteger(value) && Number(value) >= 0 ? Number(value) : defaults[band];
    return fees;
  }, {});
};

app.post('/api/provider-applications/draft', requireSupabase, async (req, res) => {
  const { id, profile, documents } = req.body || {};
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'A valid application reference is required.' });
  }
  if (!profile || typeof profile !== 'object' || typeof profile.name !== 'string' || profile.name.trim().length < 2 ||
      typeof profile.phone !== 'string' || profile.phone.trim().length < 7 ||
      typeof profile.email !== 'string' || !profile.email.includes('@') ||
      typeof profile.contactAddress !== 'string' || profile.contactAddress.trim().length < 5 ||
      typeof profile.emergencyContactName !== 'string' || profile.emergencyContactName.trim().length < 2 ||
      typeof profile.emergencyContactPhone !== 'string' || profile.emergencyContactPhone.trim().length < 7 ||
      !['male', 'female'].includes(profile.gender) ||
      !providerRoles.has(profile.role) || !providerArrangements.has(profile.nannyType) ||
      typeof profile.primaryEstate !== 'string' || profile.primaryEstate.trim().length < 2 ||
      profile.primaryEstate.trim().length > 100 || !Array.isArray(documents) || documents.length < 2 || documents.length > 6) {
    return res.status(400).json({ error: 'Complete the required contact address, emergency contact, gender, role, availability, and document fields.' });
  }
  const referenceName = typeof profile.referenceName === 'string' ? profile.referenceName.trim() : '';
  const referenceRelationship = typeof profile.referenceRelationship === 'string' ? profile.referenceRelationship.trim() : '';
  const referencePhone = typeof profile.referencePhone === 'string' ? profile.referencePhone.trim() : '';
  if ((profile.referenceName !== undefined && typeof profile.referenceName !== 'string') ||
      (profile.referenceRelationship !== undefined && typeof profile.referenceRelationship !== 'string') ||
      (profile.referencePhone !== undefined && typeof profile.referencePhone !== 'string') ||
      referenceName.length > 100 || referenceRelationship.length > 100 || referencePhone.length > 40) {
    return res.status(400).json({ error: 'Reference details must be valid text within the allowed length.' });
  }
  if ((referenceName || referenceRelationship || referencePhone) &&
      (referenceName.length < 2 || referencePhone.length < 7)) {
    return res.status(400).json({ error: 'If you add a reference, enter their full name and a valid phone number.' });
  }
  if (profile.termsAccepted !== true || typeof profile.signatureDataUrl !== 'string') {
    return res.status(400).json({ error: 'Agree to the provider terms and provide your signature before submitting.' });
  }
  const signatureMatch = /^data:image\/png;base64,([A-Za-z0-9+/]+={0,2})$/.exec(profile.signatureDataUrl);
  if (!signatureMatch || signatureMatch[1].length > 350000) {
    return res.status(400).json({ error: 'The signature is invalid. Please clear it, sign again, and resubmit.' });
  }
  const signatureBytes = Buffer.from(signatureMatch[1], 'base64');
  if (signatureBytes.length < 24 || signatureBytes.length > 256 * 1024 ||
      !signatureBytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      signatureBytes.toString('ascii', 12, 16) !== 'IHDR' ||
      signatureBytes.readUInt32BE(16) !== 700 || signatureBytes.readUInt32BE(20) !== 180) {
    return res.status(400).json({ error: 'The signature is invalid. Please clear it, sign again, and resubmit.' });
  }
  const monthlySalaryRange = profile.monthlySalaryRange;
  if (typeof monthlySalaryRange !== 'string' || !Object.prototype.hasOwnProperty.call(providerSalaryRanges, monthlySalaryRange)) {
    return res.status(400).json({ error: 'Select a valid expected salary range.' });
  }
  const salaryBand = providerSalaryRanges[monthlySalaryRange];
  let registrationFeeKes = 0;
  const { data: paymentSettings, error: paymentSettingsError } = await supabase!.from('payment_settings').select('*').eq('id', true).maybeSingle();
  if (paymentSettingsError) {
    if (reportPaymentSchemaError('Provider application payment setup lookup', paymentSettingsError, res)) return;
    return res.status(500).json({ error: 'Could not prepare provider registration payment.' });
  }
  const baseFeeKes = Number(paymentSettings?.fee_kes);
  const configuredBandFees = normalizeSalaryBandFees(paymentSettings?.salary_band_fees, Number.isInteger(baseFeeKes) ? baseFeeKes : 0);
  registrationFeeKes = configuredBandFees[monthlySalaryRange];
  if (!Number.isInteger(registrationFeeKes) || registrationFeeKes < 0) {
    return res.status(503).json({ error: 'Provider registration fees are not configured for the selected salary band. Please contact Tmommycare.' });
  }
  const isFreeRegistration = registrationFeeKes === 0;
  if (!isFreeRegistration) {
    if (!paymentSettings?.enabled || !paymentSettings.consumer_key_ciphertext || !paymentSettings.consumer_secret_ciphertext ||
        !isPaymentCallbackConfigured()) {
      return res.status(503).json({ error: 'Provider registration payments are not configured yet. Please contact Tmommycare.' });
    }
    try {
      decryptPaymentSecret(paymentSettings.consumer_key_ciphertext);
      decryptPaymentSecret(paymentSettings.consumer_secret_ciphertext);
    } catch (configurationError) {
      const message = configurationError instanceof Error ? configurationError.message : 'M-Pesa credentials cannot be read.';
      console.error(`[API] Provider application draft blocked by M-Pesa configuration: ${message}`);
      return res.status(503).json({ error: 'M-Pesa settings need administrator attention. Please contact Tmommycare.' });
    }
  }
  const safeDocuments = documents.filter((doc: any) => doc && typeof doc.path === 'string' && doc.path.startsWith(`${id}/`) &&
    typeof doc.name === 'string' && typeof doc.kind === 'string');
  const allowedDocumentKinds = new Set(['profile-photo', 'identity', 'good-conduct', 'training', 'cv', 'other']);
  if (safeDocuments.length !== documents.length || safeDocuments.some((doc: any) => !allowedDocumentKinds.has(doc.kind)) ||
      new Set(safeDocuments.map((doc: any) => doc.kind)).size !== safeDocuments.length ||
      !safeDocuments.some((doc: any) => doc.kind === 'profile-photo') ||
      !safeDocuments.some((doc: any) => doc.kind === 'identity') ||
      !safeDocuments.some((doc: any) => doc.kind === 'good-conduct')) {
    return res.status(400).json({ error: 'Upload a profile photo, identity document, and Certificate of Good Conduct before submitting.' });
  }
  const { data: storedFiles, error: storageError } = await supabase!.storage.from('provider-documents').list(id, { limit: 10 });
  if (storageError || safeDocuments.some((doc: any) => !storedFiles?.some(file => `${id}/${file.name}` === doc.path))) {
    return res.status(400).json({ error: 'One or more uploaded documents could not be verified. Please upload them again.' });
  }

  const photoDocument = safeDocuments.find((doc: any) => doc.kind === 'profile-photo');
  const { data: photo, error: photoError } = await supabase!.storage.from('provider-documents').download(photoDocument.path);
  if (photoError || !photo) return res.status(400).json({ error: 'The profile photo could not be verified. Please upload it again.' });
  const photoBuffer = Buffer.from(await photo.arrayBuffer());
  const isPng = photoBuffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg = photoBuffer[0] === 0xff && photoBuffer[1] === 0xd8 && photoBuffer[2] === 0xff;
  if (photoBuffer.length > 5 * 1024 * 1024 || (!isPng && !isJpeg)) {
    return res.status(400).json({ error: 'The profile photo must be a valid JPG or PNG image smaller than 5 MB.' });
  }

  const submittedProfile = {
    name: profile.name.trim().slice(0, 100), email: profile.email.trim().slice(0, 160), phone: profile.phone.trim().slice(0, 40),
    contactAddress: profile.contactAddress.trim().slice(0, 500),
    referenceName: referenceName.slice(0, 100),
    referenceRelationship: referenceRelationship.slice(0, 100),
    referencePhone: referencePhone.slice(0, 40),
    emergencyContactName: profile.emergencyContactName.trim().slice(0, 100),
    emergencyContactPhone: profile.emergencyContactPhone.trim().slice(0, 40),
    gender: profile.gender, role: profile.role, nannyType: profile.nannyType, primaryEstate: profile.primaryEstate.trim().slice(0, 100),
    age: Math.max(18, Math.min(75, Number(profile.age) || 18)),
    experienceYears: Math.max(0, Math.min(60, Number(profile.experienceYears) || 0)),
    monthlySalaryRange,
    monthlySalaryKsh: salaryBand.monthlySalaryKsh,
    languages: Array.isArray(profile.languages) ? profile.languages.filter((v: unknown) => typeof v === 'string').slice(0, 10) : [],
    skills: Array.isArray(profile.skills) ? profile.skills.filter((v: unknown) => typeof v === 'string').slice(0, 20) : [],
    bio: typeof profile.bio === 'string' ? profile.bio.trim().slice(0, 1500) : '',
    dciGoodConductNumber: typeof profile.dciGoodConductNumber === 'string' ? profile.dciGoodConductNumber.trim().slice(0, 100) : '',
    termsAccepted: true,
    signatureDataUrl: profile.signatureDataUrl,
    termsAcceptedAt: new Date().toISOString()
  };
  const authenticatedProvider = await getAuthenticatedUserFromRequest(req);
  const providerUserId = authenticatedProvider?.id || null;
  const providerEmail = (authenticatedProvider?.email || submittedProfile.email || '').trim().toLowerCase() || null;
  const providerPhone = normalizeProviderLookupPhone(submittedProfile.phone) || null;
  let referenceCode = '';
  try {
    referenceCode = await allocateProviderReferenceCode(new Date());
  } catch (referenceError) {
    const message = referenceError instanceof Error ? referenceError.message : 'unknown error';
    console.error(`[API] Provider reference generation failed: ${message}`);
    if (message.includes('next_provider_reference_no') || message.includes('provider_reference_sequences')) {
      return res.status(503).json({ error: 'Provider reference setup is missing. Apply migrations through 012_provider_reference_codes.sql, then retry.' });
    }
    return res.status(500).json({ error: 'Could not generate an application reference. Please try again.' });
  }
  if (isFreeRegistration) {
    const { error } = await supabase!.from('provider_applications').insert({
      id,
      reference_code: referenceCode,
      provider_user_id: providerUserId,
      provider_email: providerEmail,
      provider_phone: providerPhone,
      profile: submittedProfile,
      documents: safeDocuments,
      status: 'pending'
    });
    if (error) {
      if (reportPaymentSchemaError('Free provider application save', error, res)) return;
      if (error.code === '23505') return res.status(409).json({ error: 'This application has already been submitted.' });
      console.error(`[API] Free provider application save failed: ${error.message}`);
      return res.status(500).json({ error: 'We could not submit your free application. Please try again.' });
    }
    await sendSubmissionNotification('free provider application', {
      'Application reference': referenceCode,
      'Internal ID': id,
      Name: submittedProfile.name,
      Email: submittedProfile.email,
      Phone: submittedProfile.phone,
      'Expected salary': monthlySalaryRange,
      'Registration fee': 'Free'
    });
    return res.status(201).json({ id, referenceCode, status: 'submitted', amountKes: 0 });
  }
  const { error } = await supabase!.from('provider_payment_attempts').insert({
    id,
    reference_code: referenceCode,
    provider_user_id: providerUserId,
    provider_email: providerEmail,
    provider_phone: providerPhone,
    profile: submittedProfile,
    documents: safeDocuments,
    status: 'awaiting_payment',
    amount_kes: registrationFeeKes
  });
  if (error) {
    if (reportPaymentSchemaError('Provider payment draft save', error, res)) return;
    if (error.code === '23505') return res.status(409).json({ error: 'This application has already been submitted.' });
    console.error(`[API] Provider payment draft save failed: ${error.message}`);
    return res.status(500).json({ error: 'We could not save your application details. Please try again.' });
  }
  res.status(201).json({ id, referenceCode, status: 'awaiting_payment' });
});

app.post('/api/provider-payments/:id/salary-band', requireSupabase, async (req, res) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) {
    return res.status(400).json({ error: 'A valid payment reference is required.' });
  }
  const monthlySalaryRange = typeof req.body?.monthlySalaryRange === 'string' ? req.body.monthlySalaryRange : '';
  if (!Object.prototype.hasOwnProperty.call(providerSalaryRanges, monthlySalaryRange)) {
    return res.status(400).json({ error: 'Select a valid salary band before updating your application.' });
  }
  const { data: attempt, error: loadError } = await supabase!.from('provider_payment_attempts')
    .select('id, reference_code, status, profile, documents, provider_user_id, provider_email, provider_phone')
    .eq('id', req.params.id)
    .maybeSingle();
  if (loadError) {
    if (reportPaymentSchemaError('Provider salary-band update lookup', loadError, res)) return;
    return res.status(500).json({ error: 'Could not update the salary band.' });
  }
  if (!attempt) return res.status(404).json({ error: 'Payment request was not found.' });
  if (attempt.status === 'paid') return res.status(409).json({ error: 'This payment is already confirmed and cannot be changed.' });
  if (!attempt.profile || typeof attempt.profile !== 'object') {
    return res.status(409).json({ error: 'This application draft can no longer be updated.' });
  }

  const { data: paymentSettings, error: paymentSettingsError } = await supabase!.from('payment_settings').select('*').eq('id', true).maybeSingle();
  if (paymentSettingsError) {
    if (reportPaymentSchemaError('Provider salary-band payment setup lookup', paymentSettingsError, res)) return;
    return res.status(500).json({ error: 'Could not update the salary band.' });
  }
  const baseFeeKes = Number(paymentSettings?.fee_kes);
  const configuredBandFees = normalizeSalaryBandFees(paymentSettings?.salary_band_fees, Number.isInteger(baseFeeKes) ? baseFeeKes : 0);
  const nextFeeKes = configuredBandFees[monthlySalaryRange];
  if (!Number.isInteger(nextFeeKes) || nextFeeKes < 0) {
    return res.status(503).json({ error: 'Provider registration fees are not configured for this salary band yet.' });
  }

  const salaryBand = providerSalaryRanges[monthlySalaryRange];
  const existingProfile = attempt.profile as Record<string, any>;
  const updatedProfile: Record<string, any> = {
    ...existingProfile,
    monthlySalaryRange,
    monthlySalaryKsh: salaryBand.monthlySalaryKsh
  };

  if (nextFeeKes === 0) {
    const { error: insertError } = await supabase!.from('provider_applications').insert({
      id: attempt.id,
      reference_code: attempt.reference_code || attempt.id,
      provider_user_id: attempt.provider_user_id || null,
      provider_email: attempt.provider_email || null,
      provider_phone: attempt.provider_phone || null,
      profile: updatedProfile,
      documents: Array.isArray(attempt.documents) ? attempt.documents : [],
      status: 'pending'
    });
    if (insertError && insertError.code !== '23505') {
      return res.status(500).json({ error: `Could not submit the updated application: ${insertError.message}` });
    }
    if (insertError?.code === '23505') {
      const { data: existingApplication, error: existingError } = await supabase!.from('provider_applications').select('id').eq('id', attempt.id).maybeSingle();
      if (existingError || !existingApplication) {
        return res.status(500).json({ error: 'Could not confirm the updated application after changing salary band.' });
      }
    }
    const { error: saveError } = await supabase!.from('provider_payment_attempts').update({
      status: 'paid',
      amount_kes: 0,
      result_code: null,
      result_description: 'No payment required for the selected salary band.',
      payment_receipt_number: null,
      merchant_request_id: null,
      checkout_request_id: null,
      payment_config_snapshot: {},
      profile: {},
      documents: [],
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', attempt.id);
    if (saveError) {
      return res.status(500).json({ error: `Application was submitted but payment state could not be updated: ${saveError.message}` });
    }
    await sendSubmissionNotification('free provider application', {
      'Application reference': attempt.id,
      Name: updatedProfile.name,
      Email: updatedProfile.email,
      Phone: updatedProfile.phone,
      'Expected salary': monthlySalaryRange,
      'Registration fee': 'Free'
    });
    return res.json({
      status: 'paid',
      amountKes: 0,
      monthlySalaryRange,
      message: 'Salary band updated. No payment is required for this band and your application has been submitted.'
    });
  }

  if (!paymentSettings?.enabled || !paymentSettings.consumer_key_ciphertext || !paymentSettings.consumer_secret_ciphertext ||
      !isPaymentCallbackConfigured()) {
    return res.status(503).json({ error: 'Provider registration payments are not configured yet. Please contact Tmommycare.' });
  }
  try {
    decryptPaymentSecret(paymentSettings.consumer_key_ciphertext);
    decryptPaymentSecret(paymentSettings.consumer_secret_ciphertext);
  } catch (configurationError) {
    const message = configurationError instanceof Error ? configurationError.message : 'M-Pesa credentials cannot be read.';
    return res.status(503).json({ error: `Payment settings need administrator attention: ${message}` });
  }

  const { error: saveError } = await supabase!.from('provider_payment_attempts').update({
    profile: updatedProfile,
    status: 'awaiting_payment',
    amount_kes: nextFeeKes,
    result_code: null,
    result_description: 'Salary band updated. Start a new payment request.',
    payment_receipt_number: null,
    merchant_request_id: null,
    checkout_request_id: null,
    payment_config_snapshot: {},
    updated_at: new Date().toISOString()
  }).eq('id', attempt.id).in('status', ['awaiting_payment', 'failed', 'initiating', 'pending']);
  if (saveError) return res.status(500).json({ error: `Could not update the salary band: ${saveError.message}` });
  return res.json({
    status: 'awaiting_payment',
    amountKes: nextFeeKes,
    monthlySalaryRange,
    message: 'Salary band updated. Review the fee and request a new payment prompt.'
  });
});

const verifyMpesaPaymentAndCreateApplication = async (attempt: Record<string, any>) => {
  const snapshot = attempt.payment_config_snapshot as Record<string, any>;
  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error('The payment configuration snapshot is missing.');
  }
  const callbackPhone = normalizePaymentPhoneNumber(attempt.phone_number);
  if (!callbackPhone || Number(attempt.amount_kes) !== Number(snapshot.amountKes) || !attempt.payment_receipt_number) {
    throw new Error('The payment callback details could not be verified.');
  }

  const application = {
    id: attempt.id,
    reference_code: attempt.reference_code || attempt.id,
    provider_user_id: attempt.provider_user_id || null,
    provider_email: attempt.provider_email || null,
    provider_phone: attempt.provider_phone || null,
    profile: attempt.profile,
    documents: attempt.documents,
    status: 'pending'
  };
  const { error: insertError } = await supabase!.from('provider_applications').insert(application);
  if (insertError && insertError.code !== '23505') throw new Error(`Could not create the provider application: ${insertError.message}`);
  if (insertError?.code === '23505') {
    const { data: existingApplication, error: existingError } = await supabase!.from('provider_applications').select('id').eq('id', attempt.id).maybeSingle();
    if (existingError || !existingApplication) throw new Error('Could not confirm the provider application after payment.');
  }
  const { error: updateError } = await supabase!.from('provider_payment_attempts').update({
    status: 'paid', result_description: 'Payment confirmed.', profile: {}, documents: [],
    payment_config_snapshot: {}, paid_at: new Date().toISOString()
  }).eq('id', attempt.id);
  if (updateError) throw new Error(`Payment was confirmed but its status could not be saved: ${updateError.message}`);
  const profile = attempt.profile as Record<string, any>;
  await sendSubmissionNotification('paid provider application', {
    'Application reference': attempt.reference_code || attempt.id,
    'Internal ID': attempt.id,
    Name: profile.name,
    Email: profile.email,
    Phone: profile.phone,
    'M-Pesa receipt': attempt.payment_receipt_number,
    'Registration fee': `KES ${attempt.amount_kes}`
  });
  return true;
};

app.post(['/api/payments/stk-push', '/api/payments/mpesa/stk-push'], requireSupabase, async (req, res) => {
  const id = typeof req.body?.id === 'string' ? req.body.id : '';
  const phoneNumber = normalizePaymentPhoneNumber(req.body?.phoneNumber);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || !phoneNumber) {
    return res.status(400).json({ error: 'Enter a valid Kenyan M-Pesa phone number.' });
  }
  const { data: settings, error: settingsError } = await supabase!.from('payment_settings').select('*').eq('id', true).maybeSingle();
  if (settingsError) {
    if (reportPaymentSchemaError('M-Pesa STK settings lookup', settingsError, res)) return;
    return res.status(500).json({ error: 'Could not load M-Pesa settings.' });
  }
  if (!settings?.enabled || !settings.consumer_key_ciphertext || !settings.consumer_secret_ciphertext) {
    return res.status(503).json({ error: 'M-Pesa registration payments are not available yet.' });
  }
  if (!paymentCallbackUrl) return res.status(503).json({ error: 'M-Pesa callback URL is not configured on the payment server.' });
  let credentials: { username: string; linkApiKey: string };
  try {
    credentials = {
      username: decryptPaymentSecret(settings.consumer_key_ciphertext),
      linkApiKey: decryptPaymentSecret(settings.consumer_secret_ciphertext)
    };
  } catch (credentialError) {
    const message = credentialError instanceof Error ? credentialError.message : 'Could not decrypt M-Pesa credentials.';
    console.error(`[API] M-Pesa credential decryption failed: ${message}`);
    return res.status(503).json({ error: 'M-Pesa credentials cannot be read. Check the server encryption key and saved settings.' });
  }
  const { data: attempt, error: attemptError } = await supabase!.from('provider_payment_attempts').select('id, status, amount_kes')
    .eq('id', id).maybeSingle();
  if (attemptError) {
    if (reportPaymentSchemaError('Provider payment draft lookup', attemptError, res)) return;
    return res.status(500).json({ error: 'Could not load the provider payment draft.' });
  }
  if (!attempt) return res.status(404).json({ error: 'Provider application draft was not found.' });
  if (!['awaiting_payment', 'failed'].includes(attempt.status)) {
    return res.status(409).json({ error: 'A payment request for this application is already in progress or complete.' });
  }
  const amountKes = Number(attempt.amount_kes);
  if (!Number.isInteger(amountKes) || amountKes < 1) return res.status(503).json({ error: 'The provider registration fee is not configured.' });
  if (!isPaymentCallbackConfigured()) return res.status(503).json({ error: 'The M-Pesa callback URL must be a public HTTPS URL.' });
  const callbackUrl = new URL(paymentCallbackUrl).toString();
  const snapshot = {
    environment: settings.environment,
    merchantType: settings.merchant_type,
    shortcode: settings.shortcode,
    accountReference: settings.account_reference,
    amountKes,
    consumerKeyCiphertext: settings.consumer_key_ciphertext,
    consumerSecretCiphertext: settings.consumer_secret_ciphertext
  };
  const { data: claimed, error: claimError } = await supabase!.from('provider_payment_attempts').update({
    status: 'initiating', phone_number: phoneNumber, amount_kes: amountKes,
    payment_config_snapshot: snapshot, checkout_request_id: null, merchant_request_id: null,
    result_code: null, result_description: '', payment_receipt_number: null
  }).eq('id', id).in('status', ['awaiting_payment', 'failed']).select('id').maybeSingle();
  if (claimError) return res.status(500).json({ error: 'Could not start the M-Pesa payment.' });
  if (!claimed) return res.status(409).json({ error: 'A payment request for this application is already in progress or complete.' });

  try {
    const baseUrl = getTinyPesaBaseUrl(settings.environment);
    const checkoutResponse = await fetch(`${baseUrl}/express/initialize/?username=${encodeURIComponent(credentials.username)}`, {
      method: 'POST',
      headers: { Accept: 'application/json', Apikey: credentials.linkApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountKes,
        msisdn: phoneNumber,
        account_no: id,
        call_back_url: callbackUrl
      }),
      signal: AbortSignal.timeout(20000)
    });
    const checkout = await checkoutResponse.json().catch(() => ({})) as Record<string, any>;
    const checkoutRequestId = typeof checkout.CheckoutRequestID === 'string' ? checkout.CheckoutRequestID :
      typeof checkout.checkout_request_id === 'string' ? checkout.checkout_request_id :
      typeof checkout.data?.CheckoutRequestID === 'string' ? checkout.data.CheckoutRequestID :
      typeof checkout.data?.checkout_request_id === 'string' ? checkout.data.checkout_request_id : null;
    const merchantRequestId = typeof checkout.MerchantRequestID === 'string' ? checkout.MerchantRequestID :
      typeof checkout.merchant_request_id === 'string' ? checkout.merchant_request_id :
      typeof checkout.data?.MerchantRequestID === 'string' ? checkout.data.MerchantRequestID :
      typeof checkout.data?.merchant_request_id === 'string' ? checkout.data.merchant_request_id : null;
    const customerMessage = typeof checkout.CustomerMessage === 'string' ? checkout.CustomerMessage :
      typeof checkout.message === 'string' ? checkout.message :
      typeof checkout.detail === 'string' ? checkout.detail : '';
    if (!checkoutResponse.ok || checkout.success === false) {
      throw new Error(
        typeof checkout.errorMessage === 'string' ? checkout.errorMessage :
          typeof checkout.error === 'string' ? checkout.error :
            customerMessage || 'TinyPesa could not start the STK Push.'
      );
    }
    const { error: updateError } = await supabase!.from('provider_payment_attempts').update({
      status: 'pending', merchant_request_id: merchantRequestId, checkout_request_id: checkoutRequestId
    }).eq('id', id);
    if (updateError) throw new Error(`STK Push started but its request reference could not be saved: ${updateError.message}`);
    res.json({ status: 'pending', message: customerMessage || 'Check your phone and enter your M-Pesa PIN.' });
  } catch (paymentError) {
    const message = paymentError instanceof Error ? paymentError.message : 'M-Pesa payment request failed.';
    console.error(`[API] M-Pesa STK Push failed for ${id}: ${message}`);
    await supabase!.from('provider_payment_attempts').update({
      status: 'failed', result_description: 'Could not start the M-Pesa payment.', payment_config_snapshot: {}
    }).eq('id', id);
    res.status(502).json({ error: 'Could not start the M-Pesa payment. Check the phone number and try again.' });
  }
});

app.post(['/api/payments/callback', '/api/payments/mpesa/callback'], requireSupabase, async (req, res) => {
  const callback = req.body?.Body?.stkCallback || req.body?.stkCallback || req.body;
  const checkoutRequestId = typeof callback?.CheckoutRequestID === 'string' ? callback.CheckoutRequestID : '';
  const merchantRequestId = typeof callback?.MerchantRequestID === 'string' ? callback.MerchantRequestID : '';
  const externalReference = typeof callback?.ExternalReference === 'string' ? callback.ExternalReference : '';
  if (!callback || !Number.isInteger(Number(callback.ResultCode)) ||
      (!checkoutRequestId && !merchantRequestId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(externalReference))) {
    return res.status(400).json({ error: 'Invalid M-Pesa callback payload.' });
  }
  const loadAttemptBy = async (field: 'checkout_request_id' | 'merchant_request_id' | 'id', value: string) => {
    const response = await supabase!.from('provider_payment_attempts').select('*').eq(field, value).maybeSingle();
    if (response.error) throw response.error;
    return response.data;
  };
  let attempt: Record<string, any> | null = null;
  try {
    if (checkoutRequestId) attempt = await loadAttemptBy('checkout_request_id', checkoutRequestId);
    if (!attempt && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(externalReference)) {
      attempt = await loadAttemptBy('id', externalReference);
    }
    if (!attempt && merchantRequestId) attempt = await loadAttemptBy('merchant_request_id', merchantRequestId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown callback lookup error.';
    console.error(`[API] M-Pesa callback lookup failed: ${message}`);
    return res.status(500).json({ error: 'Could not process the M-Pesa callback.' });
  }
  if (!attempt) return res.status(404).json({ error: 'M-Pesa payment request was not found.' });
  if (attempt.status === 'paid') return res.json({ ResultCode: 0, ResultDesc: 'Payment already processed.' });
  if (checkoutRequestId && attempt.checkout_request_id && checkoutRequestId !== attempt.checkout_request_id) {
    console.error(`[API] M-Pesa callback checkout reference mismatch for payment ${attempt.id}.`);
    return res.status(400).json({ error: 'M-Pesa callback reference did not match.' });
  }
  if (merchantRequestId && attempt.merchant_request_id && merchantRequestId !== attempt.merchant_request_id) {
    console.error(`[API] M-Pesa callback merchant reference mismatch for payment ${attempt.id}.`);
    return res.status(400).json({ error: 'M-Pesa callback reference did not match.' });
  }
  const resultCode = Number(callback.ResultCode);
  if (resultCode !== 0) {
    const { error: failureError } = await supabase!.from('provider_payment_attempts').update({
      status: 'failed', result_code: resultCode,
      result_description: typeof callback.ResultDesc === 'string' ? callback.ResultDesc.slice(0, 300) : 'M-Pesa payment was not completed.',
      payment_config_snapshot: {}
    }).eq('id', attempt.id);
    if (failureError) console.error(`[API] M-Pesa failed payment status save failed: ${failureError.message}`);
    return res.json({ ResultCode: 0, ResultDesc: 'Payment failure recorded.' });
  }
  const items = Array.isArray(callback.CallbackMetadata?.Item) ? callback.CallbackMetadata.Item : [];
  const metadata = Object.fromEntries(items.map((item: any) => [item.Name, item.Value]));
  const paidAmount = Number(metadata.Amount ?? callback.Amount);
  const receiptValue = metadata.MpesaReceiptNumber ?? callback.MpesaReceiptNumber;
  const receiptNumber = typeof receiptValue === 'string' ? receiptValue : '';
  const paidPhone = normalizePaymentPhoneNumber(String(metadata.PhoneNumber ?? callback.Msisdn ?? callback.PhoneNumber ?? ''));
  if (paidAmount !== Number(attempt.amount_kes) || paidPhone !== attempt.phone_number || !receiptNumber) {
    console.error(`[API] M-Pesa callback values failed validation for payment ${attempt.id}.`);
    const { error: mismatchError } = await supabase!.from('provider_payment_attempts').update({
      status: 'failed', result_code: resultCode, result_description: 'Payment details did not match the requested amount and phone.',
      payment_config_snapshot: {}
    }).eq('id', attempt.id);
    if (mismatchError) console.error(`[API] M-Pesa callback mismatch status save failed: ${mismatchError.message}`);
    return res.json({ ResultCode: 0, ResultDesc: 'Payment details did not match.' });
  }
  const { error: recordError } = await supabase!.from('provider_payment_attempts').update({
    result_code: 0,
    result_description: 'TinyPesa payment reported; verifying transaction.',
    payment_receipt_number: receiptNumber,
    merchant_request_id: merchantRequestId || attempt.merchant_request_id,
    checkout_request_id: checkoutRequestId || attempt.checkout_request_id
  }).eq('id', attempt.id);
  if (recordError) {
    console.error(`[API] M-Pesa callback details save failed: ${recordError.message}`);
    return res.status(500).json({ error: 'Could not save M-Pesa payment details.' });
  }
  res.json({ ResultCode: 0, ResultDesc: 'Payment callback received.' });
  try {
    await verifyMpesaPaymentAndCreateApplication({ ...attempt, result_code: 0, payment_receipt_number: receiptNumber });
  } catch (verificationError) {
    const message = verificationError instanceof Error ? verificationError.message : 'Payment verification is still pending.';
    console.error(`[API] M-Pesa payment verification is pending for ${attempt.id}: ${message}`);
  }
});

app.get('/api/admin/provider-applications', requireAdmin, async (_req, res) => {
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

app.get('/api/admin/provider-transactions', requireAdmin, async (_req, res) => {
  const { data, error } = await supabase!
    .from('provider_payment_attempts')
    .select('id, reference_code, status, amount_kes, phone_number, payment_receipt_number, result_description, created_at, updated_at, paid_at, profile')
    .order('created_at', { ascending: false });
  if (error) {
    if (reportPaymentSchemaError('Admin provider transactions lookup', error, res)) return;
    return res.status(500).json({ error: 'Could not load provider transactions.' });
  }
  return res.json({
    transactions: (data || []).map((transaction: Record<string, any>) => ({
      id: transaction.id,
      referenceCode: typeof transaction.reference_code === 'string' ? transaction.reference_code : transaction.id,
      status: transaction.status,
      amountKes: Number(transaction.amount_kes) || 0,
      phoneNumber: transaction.phone_number || '',
      paymentReceiptNumber: transaction.payment_receipt_number || '',
      message: transaction.result_description || '',
      createdAt: transaction.created_at || null,
      updatedAt: transaction.updated_at || null,
      paidAt: transaction.paid_at || null,
      providerName: typeof transaction.profile?.name === 'string' ? transaction.profile.name : '',
      providerPhone: typeof transaction.profile?.phone === 'string' ? transaction.profile.phone : ''
    }))
  });
});

app.post('/api/admin/provider-applications/:id/:action', requireAdmin, async (req, res) => {
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
    if (typeof profile.avatar !== 'string' || !profile.avatar.startsWith('https://res.cloudinary.com/')) {
      const photoDocument = (Array.isArray(application.documents) ? application.documents : [])
        .find((doc: any) => doc?.kind === 'profile-photo' && typeof doc.path === 'string' && doc.path.startsWith(`${id}/`));
      if (!photoDocument) return res.status(400).json({ error: 'This application has no valid profile photo.' });
      const { data: photo, error: photoError } = await supabase!.storage.from('provider-documents').download(photoDocument.path);
      if (photoError || !photo) {
        console.error(`[API] Provider profile photo download failed for ${id}: ${photoError?.message || 'No file returned'}`);
        return res.status(500).json({ error: 'Could not retrieve the applicant profile photo.' });
      }
      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      const isPng = photoBuffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const isJpeg = photoBuffer[0] === 0xff && photoBuffer[1] === 0xd8 && photoBuffer[2] === 0xff;
      if (photoBuffer.length > 5 * 1024 * 1024 || (!isPng && !isJpeg)) {
        return res.status(400).json({ error: 'The submitted profile photo must be a JPG or PNG image smaller than 5 MB.' });
      }
      try {
        const uploadedPhoto = await uploadImageBufferToCloudinary(photoBuffer, isPng ? 'image/png' : 'image/jpeg');
        profile.avatar = uploadedPhoto.url;
        const { error: profileError } = await supabase!.from('provider_applications').update({ profile }).eq('id', id);
        if (profileError) {
          console.error(`[API] Provider profile photo URL save failed for ${id}: ${profileError.message}`);
          return res.status(500).json({ error: 'Could not save the profile photo to the application.' });
        }
      } catch (photoUploadError) {
        const message = photoUploadError instanceof Error ? photoUploadError.message : 'Image upload failed.';
        console.error(`[API] Provider profile photo upload failed for ${id}: ${message}`);
        return res.status(502).json({ error: 'Could not publish the provider photo. Please try again.' });
      }
    }
    staffProfileId = staffProfileId || `provider-${id}`;
    const roleTitle = ({ nanny: 'Nanny & Childcare Professional', babysitter: 'Babysitter', 'house-manager': 'House Manager', 'house-girl': 'Housekeeper', mamafua: 'Mamafua (One-Time Housekeeper)', 'house-boy': 'Domestic Steward', 'shamba-boy': 'Gardener & Groundskeeper', caretaker: 'Caretaker', 'cook-chef': 'Cook & Chef', 'home-driver': 'Family Driver' } as Record<string, string>)[profile.role] || 'Homecare Professional';
    const publicStaff = {
      id: staffProfileId, name: profile.name, avatar: profile.avatar, age: profile.age, role: profile.role,
      role_title: roleTitle, category_label: roleTitle, nanny_type: profile.nannyType,
      primary_estate: profile.primaryEstate, available_estates: [profile.primaryEstate],
      experience_years: profile.experienceYears, rating: 0, review_count: 0,
      monthly_salary_ksh: profile.monthlySalaryKsh, hourly_rate_ksh: 0,
      tagline: `${profile.experienceYears} years of experience. Contact Tmommycare to discuss availability.`, bio: profile.bio,
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
  const [bookingsResult, emergencyResult, contactInquiriesResult, reviewsResult] = await Promise.all([
    supabase!.from('bookings').select('*').order('submitted_at', { ascending: false }),
    supabase!.from('emergency_requests').select('*').order('submitted_at', { ascending: false }),
    supabase!.from('contact_inquiries').select('*').order('submitted_at', { ascending: false }),
    supabase!.from('reviews').select('*').order('submitted_at', { ascending: false })
  ]);

  const error = bookingsResult.error || emergencyResult.error || contactInquiriesResult.error || reviewsResult.error;
  if (error) return res.status(500).json({ error: error.message });
  res.json({
    bookings: bookingsResult.data || [],
    emergencyRequests: emergencyResult.data || [],
    contactInquiries: contactInquiriesResult.data || [],
    reviews: reviewsResult.data || []
  });
});

app.get('/api/admin/reviews', requireAdmin, async (_req, res) => {
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
      additional_notes: booking.additionalNotes || '',
      needs_cooking: Boolean(booking.needsCooking),
      needs_pet_friendly: Boolean(booking.needsPetFriendly),
      has_garden_or_lawn: Boolean(booking.hasGardenOrLawn)
    })
    .select('id, submitted_at, status')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  await sendSubmissionNotification('client service request', {
    'Parent or guardian': booking.parentName,
    Phone: booking.phone,
    Email: booking.email,
    Estate: booking.estate,
    'Residence details': booking.residenceDetails,
    'Residence type': booking.residenceType,
    'Requested role': booking.role || booking.nannyType,
    'Preferred provider': booking.nannyName,
    'Start date': booking.startDate,
    'Number of children': booking.numberOfChildren,
    'Children ages': booking.childrenAges,
    'Additional notes': booking.additionalNotes,
    'Needs cooking': booking.needsCooking,
    'Pet-friendly required': booking.needsPetFriendly,
    'Has garden or lawn': booking.hasGardenOrLawn
  });
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
  await sendSubmissionNotification('emergency service request', {
    'Request reference': data.id,
    'Parent or guardian': request.parentName,
    Phone: request.phone,
    Estate: request.estate,
    'Requested role': request.requestedRole,
    'Required time': request.requiredTime,
    'Duration in days': request.durationDays,
    'Number of children': request.childrenCount,
    'Urgent notes': request.urgentNotes
  });
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
  await sendSubmissionNotification('contact inquiry', {
    'Inquiry reference': data.id,
    Name: req.body.name,
    Email: email,
    Phone: req.body.phone,
    Message: req.body.message
  });
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
    : 'Tmommycare';
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

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  const { data, error } = await supabase!
    .from('admin_users')
    .select('email, display_name, invited_by, status, created_at')
    .order('created_at', { ascending: false });
  if (error) {
    console.error(`[API] Admin user list failed: ${error.message}`);
    return res.status(500).json({ error: 'Unable to load administrator accounts.' });
  }
  const currentUser = await getAuthenticatedUserFromRequest(req);
  res.json({
    administrators: data || [],
    currentUserEmail: currentUser?.email?.toLowerCase() || null
  });
});

app.patch('/api/admin/work-items/:type/:id', requireAdmin, async (req, res) => {
  const workItemTables = {
    booking: 'bookings',
    emergency: 'emergency_requests',
    contact: 'contact_inquiries',
    'provider-application': 'provider_applications'
  } as const;
  const table = workItemTables[req.params.type as keyof typeof workItemTables];
  if (!table) return res.status(400).json({ error: 'Unsupported work item type.' });

  const assignedAdminEmail = req.body?.assignedAdminEmail;
  const followUpAt = req.body?.followUpAt;
  if (assignedAdminEmail !== null && typeof assignedAdminEmail !== 'string') {
    return res.status(400).json({ error: 'Assigned admin must be an email address or empty.' });
  }
  if (followUpAt !== null && typeof followUpAt !== 'string') {
    return res.status(400).json({ error: 'Follow-up date must be a valid date or empty.' });
  }

  const normalizedEmail = typeof assignedAdminEmail === 'string' && assignedAdminEmail.trim()
    ? assignedAdminEmail.trim().toLowerCase()
    : null;
  if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Enter a valid active administrator email address.' });
  }
  if (normalizedEmail) {
    const { data: administrator, error: adminError } = await supabase!
      .from('admin_users')
      .select('email')
      .eq('email', normalizedEmail)
      .eq('status', 'active')
      .maybeSingle();
    if (adminError) {
      console.error(`[API] Work item assignee lookup failed: ${adminError.message}`);
      return res.status(500).json({ error: 'Unable to verify the selected administrator.' });
    }
    if (!administrator) return res.status(409).json({ error: 'Only active administrators can be assigned.' });
  }

  let normalizedFollowUpAt: string | null = null;
  if (typeof followUpAt === 'string') {
    const parsedDate = new Date(followUpAt);
    if (Number.isNaN(parsedDate.getTime())) return res.status(400).json({ error: 'Enter a valid follow-up date.' });
    normalizedFollowUpAt = parsedDate.toISOString();
  }

  const { data, error } = await supabase!
    .from(table)
    .update({
      assigned_admin_email: normalizedEmail,
      follow_up_at: normalizedFollowUpAt
    })
    .eq('id', req.params.id)
    .select('id, assigned_admin_email, follow_up_at')
    .maybeSingle();
  if (error) {
    console.error(`[API] Work item follow-up update failed for ${table}: ${error.message}`);
    return res.status(500).json({ error: 'Unable to save the assignment and follow-up date.' });
  }
  if (!data) return res.status(404).json({ error: 'Work item not found.' });

  res.json({
    id: data.id,
    assignedAdminEmail: data.assigned_admin_email,
    followUpAt: data.follow_up_at
  });
});

app.patch('/api/admin/users/:email/status', requireAdmin, async (req, res) => {
  const email = typeof req.params.email === 'string' ? req.params.email.trim().toLowerCase() : '';
  const status = req.body?.status;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid administrator email address.' });
  }
  if (status !== 'active' && status !== 'disabled') {
    return res.status(400).json({ error: 'Status must be active or disabled.' });
  }

  const actor = await getAuthenticatedUserFromRequest(req);
  if (!actor?.email) return res.status(401).json({ error: 'Authentication required.' });
  if (actor.email.toLowerCase() === email) {
    return res.status(400).json({ error: 'You cannot suspend or reactivate your own administrator account.' });
  }

  const { data, error } = await supabase!
    .from('admin_users')
    .update({ status })
    .eq('email', email)
    .select('email, status')
    .maybeSingle();
  if (error) {
    console.error(`[API] Admin status update failed: ${error.message}`);
    return res.status(500).json({ error: 'Unable to update administrator access.' });
  }
  if (!data) return res.status(404).json({ error: 'Administrator account not found.' });

  console.log(`[API] Administrator access ${status === 'disabled' ? 'suspended' : 'restored'}: ${email}`);
  res.json({ administrator: data });
});

app.post('/api/admin/users/:email/password-reset', requireAdmin, async (req, res) => {
  const email = typeof req.params.email === 'string' ? req.params.email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid administrator email address.' });
  }

  const actor = await getAuthenticatedUserFromRequest(req);
  if (!actor?.email) return res.status(401).json({ error: 'Authentication required.' });
  if (actor.email.toLowerCase() === email) {
    return res.status(400).json({ error: 'Use the self-service password reset to reset your own account.' });
  }

  const { data: administrator, error: lookupError } = await supabase!
    .from('admin_users')
    .select('status')
    .eq('email', email)
    .maybeSingle();
  if (lookupError) {
    console.error(`[API] Admin password reset lookup failed: ${lookupError.message}`);
    return res.status(500).json({ error: 'Unable to verify administrator account.' });
  }
  if (!administrator) return res.status(404).json({ error: 'Administrator account not found.' });
  if (administrator.status !== 'active') {
    return res.status(409).json({ error: 'Restore this administrator before sending a password setup link.' });
  }

  try {
    const authUser = await findAuthUserByEmail(email);
    if (!authUser) return res.status(404).json({ error: 'No Supabase login exists for this administrator.' });
  } catch (error) {
    console.error(`[API] Admin password reset account lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return res.status(502).json({ error: 'Unable to verify the administrator login with Supabase.' });
  }

  const { error: resetError } = await supabase!.auth.resetPasswordForEmail(email, {
    redirectTo: `${publicAppUrl}/admin?setup-password=1`
  });
  if (resetError) {
    console.error(`[API] Admin password reset email failed: ${resetError.message}`);
    return res.status(502).json({ error: 'Supabase could not send the password setup email. Check Auth SMTP settings and try again.' });
  }

  console.log(`[API] Admin password setup email sent: ${email}`);
  res.json({ message: `A one-time password setup link was sent to ${email}.` });
});

app.post('/api/admin/invite', requireAdmin, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim().slice(0, 120) : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

  const { data: existingAdmin, error: lookupError } = await supabase!
    .from('admin_users')
    .select('status')
    .eq('email', email)
    .maybeSingle();
  if (lookupError) {
    console.error(`[API] Admin invite lookup failed: ${lookupError.message}`);
    return res.status(500).json({ error: 'Unable to check existing administrator accounts.' });
  }
  if (existingAdmin?.status === 'active') {
    return res.status(409).json({ error: 'This email already has administrator access.' });
  }

  const authorization = req.headers.authorization!;
  const token = authorization.slice('Bearer '.length);
  const { data: inviter } = await supabase!.auth.getUser(token);
  const { error: createError } = await supabase!.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: displayName ? { display_name: displayName } : {}
  });
  const existingAccount = createError?.code === 'email_exists' || Boolean(createError?.message.toLowerCase().includes('already'));
  if (createError && !existingAccount) {
    console.error(`[API] Admin account creation failed: ${createError.message}`);
    return res.status(502).json({ error: 'Supabase could not create the administrator login.' });
  }
  if (existingAccount) {
    try {
      const authUser = await findAuthUserByEmail(email);
      if (!authUser) {
        return res.status(502).json({ error: 'A Supabase account was reported but could not be found.' });
      }
      if (!authUser.email_confirmed_at) {
        const { error: confirmError } = await supabase!.auth.admin.updateUserById(authUser.id, {
          email_confirm: true
        });
        if (confirmError) {
          console.error(`[API] Existing admin account confirmation failed: ${confirmError.message}`);
          return res.status(502).json({ error: 'Supabase could not prepare the existing account for email sign-in.' });
        }
      }
    } catch (error) {
      console.error(`[API] Existing admin account lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(502).json({ error: 'Unable to verify the existing Supabase account.' });
    }
  }

  const { error: rowError } = await supabase!.from('admin_users').upsert({
    email,
    display_name: displayName || null,
    invited_by: inviter.user?.email || null,
    status: 'active'
  }, { onConflict: 'email' });
  if (rowError) {
    console.error(`[API] Admin access record save failed for ${email}: ${rowError.message}`);
    return res.status(500).json({ error: 'The administrator login was created, but access could not be saved.' });
  }

  const { error: setupEmailError } = await supabase!.auth.resetPasswordForEmail(email, {
    redirectTo: `${publicAppUrl}/admin?setup-password=1`
  });
  if (setupEmailError) {
    console.error(`[API] Admin password setup email failed for ${email}: ${setupEmailError.message}`);
    return res.status(502).json({
      administratorCreated: true,
      error: 'Administrator access is enabled, but the password setup email could not be sent. Refresh the list and use Reset password to retry.'
    });
  }
  console.log(`[API] Administrator access granted and setup email sent: ${email}`);
  res.status(existingAccount ? 200 : 201).json({
    email,
    created: !existingAccount,
    existingAccount,
    message: existingAccount
      ? 'Administrator access is enabled. A password setup email has been sent; no invitation acceptance is required.'
      : 'Administrator account created. A password setup email has been sent; no invitation acceptance is required.'
  });
});

const adminTables = {
  nannies: 'staff_profiles',
  insights: 'insights',
  bookings: 'bookings',
  emergencyRequests: 'emergency_requests',
  contactInquiries: 'contact_inquiries',
  media: 'media_items',
  siteConfig: 'site_config',
  reviews: 'reviews'
} as const;

app.post('/api/admin/cloudinary/upload', requireAdmin, express.raw({ type: 'image/jpeg', limit: '10mb' }), async (req, res) => {
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

app.post('/api/admin/content', requireAdmin, async (req, res) => {
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
  console.log(`Tmommycare API listening on http://localhost:${port}`);
  console.log(`[API] Supabase configured: ${Boolean(supabase)} | Cloudinary configured: ${hasRealValue(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret)}`);
});
