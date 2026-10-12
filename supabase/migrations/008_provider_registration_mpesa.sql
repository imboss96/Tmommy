create table if not exists public.mpesa_settings (
  id boolean primary key default true check (id),
  enabled boolean not null default false,
  fee_kes integer not null default 0 check (fee_kes >= 0),
  environment text not null default 'sandbox' check (environment in ('sandbox', 'production')),
  merchant_type text not null default 'paybill' check (merchant_type in ('paybill', 'till')),
  shortcode text not null default '',
  account_reference text not null default 'Tmommycare',
  consumer_key_ciphertext text not null default '',
  consumer_secret_ciphertext text not null default '',
  passkey_ciphertext text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_payment_attempts (
  id uuid primary key,
  profile jsonb not null,
  documents jsonb not null default '[]'::jsonb,
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_payment', 'initiating', 'pending', 'paid', 'failed')),
  phone_number text not null default '',
  amount_kes integer not null default 0,
  merchant_request_id text,
  checkout_request_id text unique,
  mpesa_config_snapshot jsonb not null default '{}'::jsonb,
  result_code integer,
  result_description text not null default '',
  mpesa_receipt_number text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists provider_payment_attempts_created_at_idx
  on public.provider_payment_attempts (created_at desc);
create unique index if not exists provider_payment_attempts_receipt_idx
  on public.provider_payment_attempts (mpesa_receipt_number)
  where mpesa_receipt_number is not null;

alter table public.mpesa_settings enable row level security;
alter table public.provider_payment_attempts enable row level security;

-- Payment credentials and provider drafts are only accessed by the server service role.
