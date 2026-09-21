create extension if not exists pgcrypto;

create table if not exists public.staff_profiles (
  id text primary key,
  name text not null,
  avatar text not null,
  age integer not null check (age > 0),
  role text not null,
  role_title text not null,
  category_label text not null,
  nanny_type text not null,
  primary_estate text not null,
  available_estates jsonb not null default '[]'::jsonb,
  experience_years integer not null default 0,
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  monthly_salary_ksh integer not null default 0,
  hourly_rate_ksh integer not null default 0,
  tagline text not null default '',
  bio text not null default '',
  certifications jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  languages jsonb not null default '[]'::jsonb,
  education text not null default '',
  dci_good_conduct_number text not null default '',
  dci_issue_date text not null default '',
  first_aid_cert_number text not null default '',
  medical_clearance_date text not null default '',
  verified_reference_count integer not null default 0,
  is_available_now boolean not null default false,
  can_swim boolean not null default false,
  has_special_needs_training boolean not null default false,
  can_drive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.insights (
  id text primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null,
  category text not null,
  author jsonb not null default '{}'::jsonb,
  read_time text not null default '',
  published_date text not null,
  cover_image text not null,
  tags jsonb not null default '[]'::jsonb,
  key_takeaways jsonb not null default '[]'::jsonb,
  content jsonb not null default '[]'::jsonb,
  related_nairobi_topic text not null default '',
  status text not null default 'published' check (status in ('published', 'draft')),
  views_count integer not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id text primary key default gen_random_uuid()::text,
  nanny_id text references public.staff_profiles(id) on delete set null,
  nanny_name text,
  role text,
  parent_name text not null,
  phone text not null,
  email text not null,
  estate text not null,
  residence_details text not null,
  residence_type text,
  nanny_type text not null,
  number_of_children integer not null default 0,
  children_ages text not null default '',
  start_date date not null,
  preferred_trial_days integer not null default 3,
  additional_notes text not null default '',
  needs_cooking boolean not null default false,
  needs_pet_friendly boolean not null default false,
  has_garden_or_lawn boolean not null default false,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Trial Scheduled', 'Completed', 'Archived')),
  internal_notes text,
  assigned_coordinator text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.emergency_requests (
  id text primary key default gen_random_uuid()::text,
  parent_name text not null,
  phone text not null,
  estate text not null,
  requested_role text,
  required_time text not null,
  duration_days integer not null default 1,
  children_count integer not null default 0,
  urgent_notes text not null default '',
  status text not null default 'Pending Dispatch' check (status in ('Pending Dispatch', 'Staff Contacted', 'Dispatched', 'Resolved', 'Archived')),
  internal_notes text,
  assigned_staff_name text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_items (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  url text not null,
  cloudinary_public_id text,
  category text not null check (category in ('staff', 'insights', 'estate', 'general')),
  tags jsonb not null default '[]'::jsonb,
  dimensions text,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.site_config (
  id boolean primary key default true check (id),
  hotline_phone text not null,
  emergency_dispatch_phone text not null,
  whatsapp_phone text not null default '+254 700 666 227',
  whatsapp_message text not null default 'Hello MommyCare, I would like help finding vetted homecare staff.',
  notification_banner text not null,
  headquarters_address text not null,
  concierge_email text not null,
  replacement_warranty_days integer not null default 90,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  email text primary key,
  display_name text,
  invited_by text,
  status text not null default 'invited' check (status in ('invited', 'active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists staff_profiles_updated_at on public.staff_profiles;
create trigger staff_profiles_updated_at before update on public.staff_profiles for each row execute function public.set_updated_at();
drop trigger if exists insights_updated_at on public.insights;
create trigger insights_updated_at before update on public.insights for each row execute function public.set_updated_at();
drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at before update on public.bookings for each row execute function public.set_updated_at();
drop trigger if exists emergency_requests_updated_at on public.emergency_requests;
create trigger emergency_requests_updated_at before update on public.emergency_requests for each row execute function public.set_updated_at();
drop trigger if exists site_config_updated_at on public.site_config;
create trigger site_config_updated_at before update on public.site_config for each row execute function public.set_updated_at();
drop trigger if exists admin_users_updated_at on public.admin_users;
create trigger admin_users_updated_at before update on public.admin_users for each row execute function public.set_updated_at();

alter table public.staff_profiles enable row level security;
alter table public.insights enable row level security;
alter table public.bookings enable row level security;
alter table public.emergency_requests enable row level security;
alter table public.media_items enable row level security;
alter table public.site_config enable row level security;
alter table public.admin_users enable row level security;

create policy "public can view available staff" on public.staff_profiles for select using (is_available_now = true);
create policy "public can view published insights" on public.insights for select using (status = 'published');
create policy "public can view media" on public.media_items for select using (true);
create policy "public can view site config" on public.site_config for select using (true);
create policy "public can create bookings" on public.bookings for insert with check (true);
create policy "public can create emergency requests" on public.emergency_requests for insert with check (true);

create policy "admins manage staff" on public.staff_profiles for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins manage insights" on public.insights for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins manage bookings" on public.bookings for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins manage emergency requests" on public.emergency_requests for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins manage media" on public.media_items for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins manage site config" on public.site_config for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins manage admin users" on public.admin_users for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
