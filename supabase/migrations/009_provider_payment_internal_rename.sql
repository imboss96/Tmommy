do $$
begin
  if to_regclass('public.mpesa_settings') is not null and to_regclass('public.payment_settings') is null then
    alter table public.mpesa_settings rename to payment_settings;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'provider_payment_attempts' and column_name = 'mpesa_config_snapshot'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'provider_payment_attempts' and column_name = 'payment_config_snapshot'
  ) then
    alter table public.provider_payment_attempts
      rename column mpesa_config_snapshot to payment_config_snapshot;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'provider_payment_attempts' and column_name = 'mpesa_receipt_number'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'provider_payment_attempts' and column_name = 'payment_receipt_number'
  ) then
    alter table public.provider_payment_attempts
      rename column mpesa_receipt_number to payment_receipt_number;
  end if;
end $$;

alter index if exists public.provider_payment_attempts_receipt_idx
  rename to provider_payment_attempts_payment_receipt_idx;
