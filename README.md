# Tmommycare Nairobi

Tmommycare Nairobi is a homecare and domestic staffing platform for families looking for skilled nannies and household professionals across Nairobi.

The platform supports nanny placement, domestic staff browsing, bookings, emergency backup requests, public reviews, SEO-focused service pages, media management, and an admin operations dashboard.

## Features

- Nanny and domestic staff directory
- Nannies, house managers, housekeepers, house boys, caretakers, gardeners, cooks, chefs, and family drivers
- Care standards and screening presentation
- Homepage hero slider image management
- Core service category cards
- Salary and private-agreement take-home calculator
- Booking and emergency backup request forms
- Moderated public reviews
- Parenting and childcare insights
- Admin dashboard for staff, posts, media, reviews, settings, and submissions
- Print-ready provider service agreements and profile-based CVs
- Supabase-backed production content and submissions
- SEO routes, metadata, sitemap, and robots.txt

## Product plan

See [docs/MVP_AND_IMPLEMENTATION_ROADMAP.md](docs/MVP_AND_IMPLEMENTATION_ROADMAP.md) for the MVP scope, user journeys, launch criteria, success measures, and phased implementation roadmap.

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Express
- Supabase
- PM2 and Nginx for VPS deployment

## Local Development

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
copy .env.example .env.local
```

On macOS/Linux:

```bash
cp .env.example .env.local
```

Set the required Supabase and API values in `.env.local`, then start the frontend:

```bash
npm run dev
```

The frontend runs at `http://localhost:3000`.

To run the Express API separately:

```bash
npm run server
```

## Validation

```bash
npm run lint
npm run build
```

## Public Routes

- `/` Homepage
- `/nannies` Staff directory
- `/vetting` Care standards
- `/salary-guide` Nairobi salary guide
- `/mission-vision` Mission and vision
- `/insights` Parenting and childcare insights
- `/reviews` Parent reviews
- `/compare-care` Care option comparison
- `/academy` Homecare academy
- `/contact` Contact and enquiries

The sitemap is available at `/sitemap.xml` and crawler rules at `/robots.txt`.

## Database

Supabase migrations are stored in `supabase/migrations/`. Apply them in order, including:

- `001_initial_schema.sql`
- `002_admin_users.sql`
- `003_whatsapp_site_config.sql`
- `004_contact_inquiries.sql`
- `005_reviews.sql`
- `006_provider_applications.sql` (creates the provider review queue and private document bucket)
- `007_contract_numbering.sql` (creates the atomic yearly counter for unique contract numbers)
- `008_provider_registration_mpesa.sql` (adds private provider-payment drafts and M-Pesa settings)

Never commit `.env`, `.env.local`, Supabase service-role keys, or Cloudinary secrets.

Configure `MPESA_CONFIG_ENCRYPTION_KEY` as a stable, backend-only 64-character hex key before saving M-Pesa credentials in the admin dashboard. Set `MPESA_CALLBACK_URL` to the public HTTPS API callback URL so Safaricom can reach the payment confirmation endpoint. M-Pesa credentials are encrypted in Supabase; only the one-time encryption key belongs in the server environment.

## GitHub

Repository: https://github.com/imboss96/Tmommy

Push updates with:

```bash
git add .
git commit -m "Describe your change"
git push origin main
```

## Hostinger VPS Deployment

The deployment files are in `deploy/`:

- `deploy/README.md` Full Ubuntu, Namecheap DNS, Nginx, PM2, and HTTPS instructions
- `deploy/nginx-Tmommycare.conf` Nginx configuration
- `ecosystem.config.cjs` PM2 configuration for the Express API

The production setup uses Nginx for the Vite `dist` frontend and proxies `/api` requests to the Express server on port `5000`.
