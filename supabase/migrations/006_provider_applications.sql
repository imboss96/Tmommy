create table if not exists public.provider_applications (
  id uuid primary key,
  profile jsonb not null,
  documents jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'disabled')),
  admin_notes text not null default '',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  staff_profile_id text references public.staff_profiles(id) on delete set null
);

alter table public.provider_applications enable row level security;
-- Provider applications and document paths are only read through the admin API.
-- Public submissions are validated and inserted by the server using its service role.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('provider-documents', 'provider-documents', false, 8388608, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = false, file_size_limit = 8388608,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png'];

create policy "providers may upload application documents"
on storage.objects for insert to anon, authenticated
with check (
  bucket_id = 'provider-documents'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);
