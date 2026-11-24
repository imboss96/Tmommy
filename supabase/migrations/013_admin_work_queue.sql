alter table public.bookings
  add column if not exists assigned_admin_email text,
  add column if not exists follow_up_at timestamptz;

alter table public.emergency_requests
  add column if not exists assigned_admin_email text,
  add column if not exists follow_up_at timestamptz;

alter table public.contact_inquiries
  add column if not exists assigned_admin_email text,
  add column if not exists follow_up_at timestamptz;

alter table public.provider_applications
  add column if not exists assigned_admin_email text,
  add column if not exists follow_up_at timestamptz;

create index if not exists bookings_follow_up_at_idx
  on public.bookings (follow_up_at) where follow_up_at is not null;
create index if not exists emergency_requests_follow_up_at_idx
  on public.emergency_requests (follow_up_at) where follow_up_at is not null;
create index if not exists contact_inquiries_follow_up_at_idx
  on public.contact_inquiries (follow_up_at) where follow_up_at is not null;
create index if not exists provider_applications_follow_up_at_idx
  on public.provider_applications (follow_up_at) where follow_up_at is not null;
