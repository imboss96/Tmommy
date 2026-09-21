create table if not exists public.contact_inquiries (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Resolved', 'Archived')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_inquiries_submitted_at_idx on public.contact_inquiries (submitted_at desc);

alter table public.contact_inquiries enable row level security;

create policy "public can create contact inquiries"
on public.contact_inquiries
for insert
with check (true);

create policy "admins manage contact inquiries"
on public.contact_inquiries
for all
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop trigger if exists contact_inquiries_updated_at on public.contact_inquiries;
create trigger contact_inquiries_updated_at
before update on public.contact_inquiries
for each row execute function public.set_updated_at();
