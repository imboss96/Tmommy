alter table if exists public.provider_applications
  add column if not exists provider_user_id uuid,
  add column if not exists provider_email text,
  add column if not exists provider_phone text;

alter table if exists public.provider_payment_attempts
  add column if not exists provider_user_id uuid,
  add column if not exists provider_email text,
  add column if not exists provider_phone text;

create index if not exists provider_applications_provider_user_id_idx
  on public.provider_applications (provider_user_id);

create index if not exists provider_applications_provider_email_idx
  on public.provider_applications (provider_email);

create index if not exists provider_applications_provider_phone_idx
  on public.provider_applications (provider_phone);

create index if not exists provider_payment_attempts_provider_user_id_idx
  on public.provider_payment_attempts (provider_user_id);

create index if not exists provider_payment_attempts_provider_email_idx
  on public.provider_payment_attempts (provider_email);

create index if not exists provider_payment_attempts_provider_phone_idx
  on public.provider_payment_attempts (provider_phone);

update public.provider_applications
set provider_email = lower(trim(coalesce(profile->>'email', '')))
where coalesce(provider_email, '') = '';

update public.provider_payment_attempts
set provider_email = lower(trim(coalesce(profile->>'email', '')))
where coalesce(provider_email, '') = '';

update public.provider_applications
set provider_phone = case
  when regexp_replace(coalesce(profile->>'phone', ''), '\D', '', 'g') ~ '^0[17]\d{8}$'
    then '254' || substr(regexp_replace(coalesce(profile->>'phone', ''), '\D', '', 'g'), 2)
  when regexp_replace(coalesce(profile->>'phone', ''), '\D', '', 'g') ~ '^254[17]\d{8}$'
    then regexp_replace(coalesce(profile->>'phone', ''), '\D', '', 'g')
  when regexp_replace(coalesce(profile->>'phone', ''), '\D', '', 'g') ~ '^[17]\d{8}$'
    then '254' || regexp_replace(coalesce(profile->>'phone', ''), '\D', '', 'g')
  else null
end
where coalesce(provider_phone, '') = '';

update public.provider_payment_attempts
set provider_phone = case
  when regexp_replace(coalesce(profile->>'phone', ''), '\D', '', 'g') ~ '^0[17]\d{8}$'
    then '254' || substr(regexp_replace(coalesce(profile->>'phone', ''), '\D', '', 'g'), 2)
  when regexp_replace(coalesce(profile->>'phone', ''), '\D', '', 'g') ~ '^254[17]\d{8}$'
    then regexp_replace(coalesce(profile->>'phone', ''), '\D', '', 'g')
  when regexp_replace(coalesce(profile->>'phone', ''), '\D', '', 'g') ~ '^[17]\d{8}$'
    then '254' || regexp_replace(coalesce(profile->>'phone', ''), '\D', '', 'g')
  else null
end
where coalesce(provider_phone, '') = '';
