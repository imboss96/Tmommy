create table if not exists public.contract_number_counters (
  contract_year integer primary key check (contract_year between 2000 and 9999),
  last_number integer not null check (last_number > 0)
);

alter table public.contract_number_counters enable row level security;

create or replace function public.next_contract_number(p_year integer)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_number integer;
begin
  if p_year < 2000 or p_year > 9999 then
    raise exception 'Invalid contract year';
  end if;

  insert into public.contract_number_counters as counters (contract_year, last_number)
  values (p_year, 1)
  on conflict (contract_year)
  do update set last_number = counters.last_number + 1
  returning last_number into next_number;

  return format('TMOMMY-%s-%s', p_year, lpad(next_number::text, 3, '0'));
end;
$$;

revoke all on function public.next_contract_number(integer) from public, anon, authenticated;
grant execute on function public.next_contract_number(integer) to service_role;
