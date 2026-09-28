create table if not exists public.core_service_categories (
  id text primary key,
  title text not null,
  description text not null,
  action text not null default 'Learn More',
  href text not null default '/nannies',
  image text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists core_service_categories_updated_at on public.core_service_categories;
create trigger core_service_categories_updated_at before update on public.core_service_categories for each row execute function public.set_updated_at();

alter table public.core_service_categories enable row level security;

create policy "public can view core service categories" on public.core_service_categories
  for select using (true);

create policy "admins manage core service categories" on public.core_service_categories
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.core_service_categories (id, title, description, action, href, image, sort_order)
values
  ('nannies', 'Nannies and Caregivers', 'Compassionate, trained caregivers providing safe, nurturing support for your children''s growth.', 'Find a Nanny', '/nannies?role=nanny', '', 0),
  ('house-girls', 'House Girls and Housekeepers', 'Reliable household professionals providing cleaning, laundry, organization, and daily home support.', 'Find a Housekeeper', '/nannies?role=house-girl', '', 1),
  ('house-boys', 'House Boys and Domestic Stewards', 'Dependable domestic stewards supporting cleaning, errands, hospitality, maintenance, and household routines.', 'Find a House Boy', '/nannies?role=house-boy', '', 2),
  ('caretakers', 'Compound Caretakers and Custodians', 'Vetted property custodians supporting gate access, compound upkeep, security routines, and maintenance.', 'Find a Caretaker', '/nannies?role=caretaker', '', 3),
  ('gardeners', 'Gardeners and Groundskeepers', 'Experienced gardeners maintaining healthy, beautiful outdoor spaces through expert routine care.', 'Find a Gardener', '/nannies?role=shamba-boy', '', 4),
  ('drivers', 'Home and Family Drivers', 'Professional drivers supporting safe school runs, family errands, appointments, and household logistics.', 'Find a Driver', '/nannies?role=home-driver', '', 5),
  ('chefs', 'Private Chefs and Culinary Experts', 'Skilled culinary experts crafting personalized meals tailored to your family''s tastes daily.', 'Find a Chef', '/nannies?role=chef', '', 6),
  ('house-managers', 'House Managers for Expatriates', 'House managers bring their expertise and passion to enhance home operations for busy families.', 'Find a House Manager', '/nannies?role=house-manager', '', 7)
on conflict (id) do nothing;
