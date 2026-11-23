alter table if exists public.payment_settings
  add column if not exists salary_band_fees jsonb not null default '{}'::jsonb;

update public.payment_settings
set salary_band_fees = jsonb_build_object(
  'KES 6,000–8,000', 0,
  'KES 8,001–12,000', fee_kes + 200,
  'KES 12,001–15,000', fee_kes + 250,
  'KES 15,001–20,000', fee_kes + 300,
  'Above KES 20,000', fee_kes + 500
)
where salary_band_fees = '{}'::jsonb;
