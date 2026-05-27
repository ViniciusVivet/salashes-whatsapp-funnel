alter table public.customers
add column if not exists lead_source text;

alter table public.appointment_requests
add column if not exists lead_source text;

create index if not exists idx_customers_lead_source on public.customers(lead_source);
