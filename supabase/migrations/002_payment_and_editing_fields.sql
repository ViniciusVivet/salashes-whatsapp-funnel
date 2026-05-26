alter table public.appointments
add column if not exists payment_method text,
add column if not exists paid boolean not null default false;

create index if not exists idx_appointments_paid on public.appointments(paid);
