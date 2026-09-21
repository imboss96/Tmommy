alter table public.site_config
	add column if not exists whatsapp_phone text not null default '+254 700 666 227',
	add column if not exists whatsapp_message text not null default 'Hello MommyCare, I would like help finding vetted homecare staff.';
