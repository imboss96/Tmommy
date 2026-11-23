alter table if exists public.provider_applications
  add column if not exists reference_code text;

alter table if exists public.provider_payment_attempts
  add column if not exists reference_code text;

create index if not exists provider_applications_reference_code_idx
  on public.provider_applications (reference_code);

create index if not exists provider_payment_attempts_reference_code_idx
  on public.provider_payment_attempts (reference_code);

create table if not exists public.provider_reference_sequences (
  ref_date date primary key,
  last_no integer not null default 0 check (last_no >= 0)
);

create or replace function public.next_provider_reference_no(p_date date default current_date)
returns integer
language plpgsql
as $$
declare
  next_no integer;
begin
  insert into public.provider_reference_sequences (ref_date, last_no)
  values (p_date, 1)
  on conflict (ref_date)
  do update set last_no = public.provider_reference_sequences.last_no + 1
  returning last_no into next_no;

  return next_no;
end;
$$;

with logical_references as (
  select id, min(reference_ts) as first_reference_ts
  from (
    select id, coalesce(created_at, now()) as reference_ts
    from public.provider_payment_attempts
    union all
    select id, coalesce(submitted_at, now()) as reference_ts
    from public.provider_applications
  ) combined
  group by id
),
numbered_references as (
  select
    id,
    date(first_reference_ts) as ref_date,
    row_number() over (
      partition by date(first_reference_ts)
      order by first_reference_ts asc, id asc
    ) as ref_no
  from logical_references
),
reference_codes as (
  select
    id,
    ref_date,
    ref_no,
    upper(substr(translate(md5(id::text), '0123456789', 'ABCDEFGHJK'), 1, 4))
      || to_char(ref_date, 'DDMM')
      || lpad(ref_no::text, 4, '0') as code
  from numbered_references
)
update public.provider_payment_attempts attempt
set reference_code = code.code
from reference_codes code
where attempt.id = code.id
  and coalesce(attempt.reference_code, '') = '';

with logical_references as (
  select id, min(reference_ts) as first_reference_ts
  from (
    select id, coalesce(created_at, now()) as reference_ts
    from public.provider_payment_attempts
    union all
    select id, coalesce(submitted_at, now()) as reference_ts
    from public.provider_applications
  ) combined
  group by id
),
numbered_references as (
  select
    id,
    date(first_reference_ts) as ref_date,
    row_number() over (
      partition by date(first_reference_ts)
      order by first_reference_ts asc, id asc
    ) as ref_no
  from logical_references
),
reference_codes as (
  select
    id,
    upper(substr(translate(md5(id::text), '0123456789', 'ABCDEFGHJK'), 1, 4))
      || to_char(ref_date, 'DDMM')
      || lpad(ref_no::text, 4, '0') as code
  from numbered_references
)
update public.provider_applications application
set reference_code = coalesce(attempt.reference_code, code.code)
from reference_codes code
left join public.provider_payment_attempts attempt on attempt.id = code.id
where application.id = code.id
  and coalesce(application.reference_code, '') = '';

with logical_references as (
  select id, min(reference_ts) as first_reference_ts
  from (
    select id, coalesce(created_at, now()) as reference_ts
    from public.provider_payment_attempts
    union all
    select id, coalesce(submitted_at, now()) as reference_ts
    from public.provider_applications
  ) combined
  group by id
),
numbered_references as (
  select
    date(first_reference_ts) as ref_date,
    row_number() over (
      partition by date(first_reference_ts)
      order by first_reference_ts asc, id asc
    ) as ref_no
  from logical_references
)
insert into public.provider_reference_sequences (ref_date, last_no)
select ref_date, max(ref_no) as last_no
from numbered_references
group by ref_date
on conflict (ref_date)
do update set last_no = greatest(public.provider_reference_sequences.last_no, excluded.last_no);
