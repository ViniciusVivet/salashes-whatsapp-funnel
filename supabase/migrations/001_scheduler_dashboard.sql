create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  birthday date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  duration_minutes integer not null default 90,
  price numeric(10, 2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'confirmed' check (status in ('requested', 'confirmed', 'done', 'cancelled', 'no_show')),
  price numeric(10, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_birthday date,
  service_id uuid references public.services(id) on delete set null,
  service_name text,
  preferred_date date not null,
  preferred_time time not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric(10, 2) not null default 0,
  category text,
  spent_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_customers_phone on public.customers(phone);
create unique index if not exists idx_customers_phone_unique on public.customers(phone);
create unique index if not exists idx_services_name_unique on public.services(name);
create index if not exists idx_appointments_starts_at on public.appointments(starts_at);
create index if not exists idx_appointments_status on public.appointments(status);
create index if not exists idx_requests_created_at on public.appointment_requests(created_at);
create index if not exists idx_expenses_spent_at on public.expenses(spent_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

drop trigger if exists requests_set_updated_at on public.appointment_requests;
create trigger requests_set_updated_at
before update on public.appointment_requests
for each row execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_requests enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "admin manage customers" on public.customers;
create policy "admin manage customers"
on public.customers for all
to authenticated
using (true)
with check (true);

drop policy if exists "public read active services" on public.services;
create policy "public read active services"
on public.services for select
to anon, authenticated
using (active = true or auth.role() = 'authenticated');

drop policy if exists "admin manage services" on public.services;
create policy "admin manage services"
on public.services for all
to authenticated
using (true)
with check (true);

drop policy if exists "admin manage appointments" on public.appointments;
create policy "admin manage appointments"
on public.appointments for all
to authenticated
using (true)
with check (true);

drop policy if exists "public create requests" on public.appointment_requests;
create policy "public create requests"
on public.appointment_requests for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "admin manage requests" on public.appointment_requests;
create policy "admin manage requests"
on public.appointment_requests for all
to authenticated
using (true)
with check (true);

drop policy if exists "admin manage expenses" on public.expenses;
create policy "admin manage expenses"
on public.expenses for all
to authenticated
using (true)
with check (true);

insert into public.services (name, category, duration_minutes, price)
values
  ('Volume brasileiro', 'Extensao de cilios', 120, 110),
  ('Volume egipcio', 'Extensao de cilios', 120, 130),
  ('Fox eyes', 'Extensao de cilios', 120, 150),
  ('Mega volume', 'Extensao de cilios', 150, 150),
  ('Design personalizado', 'Sobrancelhas', 45, 30),
  ('Design com henna', 'Sobrancelhas', 60, 50),
  ('Brow lamination', 'Sobrancelhas', 75, 90),
  ('Spa labial', 'Cuidados', 30, 25)
on conflict (name) do update set
  category = excluded.category,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  active = true;
