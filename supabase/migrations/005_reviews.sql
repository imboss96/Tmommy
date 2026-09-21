create table if not exists public.reviews (
  id text primary key default gen_random_uuid()::text,
  parent_name text not null,
  family_role text not null,
  estate text not null,
  nanny_name text,
  comment text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  children_age text,
  service_type text,
  review_date text not null,
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

create policy "public can view published reviews" on public.reviews
  for select using (status = 'published');
create policy "public can submit reviews" on public.reviews
  for insert with check (status = 'pending');
create policy "admins manage reviews" on public.reviews
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.reviews
  (id, parent_name, family_role, estate, nanny_name, comment, rating, children_age, service_type, review_date, status, submitted_at)
values
  ('rev-1', 'Wanjiru & Dr. David Kariuki', 'Parents of 7-month infant & 3-year-old', 'Karen', 'Faith Wangari M.', 'MommyCare made the search feel clear and reassuring. Faith arrived with certified DCI clearance and Red Cross First Aid credentials. She transformed our home routine and guided our baby through weaning effortlessly.', 5, '7 months & 3 yrs', 'Live-In Nanny', 'February 2026', 'published', '2026-02-15T09:00:00Z'),
  ('rev-2', 'Sophie & Marc Chenevier', 'Diplomatic Mission Staff', 'Runda', 'Esther Moraa B.', 'Security vetting was our primary requirement in Runda. MommyCare provided full biometric background checks, Chief verification letters, and medical clearances before Esther even arrived for her 3-day trial. She is gentle, structured, and an absolute delight with our twins.', 5, '2-year-old Twins', 'Live-In Specialist', 'January 2026', 'published', '2026-01-18T09:00:00Z'),
  ('rev-3', 'Amina & Farhan Sheikh', 'First-time Parents', 'Westlands', 'Grace Achieng O. (Nurse)', 'As a postpartum mom recovering from a C-section in Westlands, hiring Grace as a Newborn Night Nurse saved my mental health. She handled all 2am feeds, burping, and soothing with professional hospital expertise. I slept knowing my baby was in clinical hands.', 5, '6 weeks newborn', 'Newborn Night Nurse', 'March 2026', 'published', '2026-03-10T09:00:00Z'),
  ('rev-4', 'Brian & Cynthia Oduor', 'Tech Executives in Kilimani', 'Kilimani', 'Mercy Nyambura K.', 'We needed a punctual day nanny (8am - 5pm) in our Kilimani apartment. Mercy has never arrived a minute late. Her creative Montessori activities keep our energetic toddler engaged without iPads or television. Worth every single shilling.', 5, '2.5 years', 'Day Nanny (8am - 5pm)', 'February 2026', 'published', '2026-02-22T09:00:00Z')
on conflict (id) do nothing;