update public.bookings
set status = 'Contacted'
where status = 'Trial Scheduled';

update public.reviews
set comment = replace(comment, 'before Esther even arrived for her 3-day trial', 'before Esther started')
where id = 'rev-2'
  and comment like '%before Esther even arrived for her 3-day trial%';

alter table public.bookings
  drop constraint if exists bookings_status_check;

alter table public.bookings
  add constraint bookings_status_check
  check (status in ('New', 'Contacted', 'Completed', 'Archived'));

alter table public.bookings
  drop column if exists preferred_trial_days;
