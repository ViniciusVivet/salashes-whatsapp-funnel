create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

drop policy if exists "admin read admin users" on public.admin_users;
create policy "admin read admin users"
on public.admin_users for select
to authenticated
using (public.is_admin());

drop policy if exists "admin manage customers" on public.customers;
create policy "admin manage customers"
on public.customers for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read active services" on public.services;
create policy "public read active services"
on public.services for select
to anon, authenticated
using (active = true or public.is_admin());

drop policy if exists "admin manage services" on public.services;
create policy "admin manage services"
on public.services for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin manage appointments" on public.appointments;
create policy "admin manage appointments"
on public.appointments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public create requests" on public.appointment_requests;
create policy "public create requests"
on public.appointment_requests for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "admin manage requests" on public.appointment_requests;
create policy "admin manage requests"
on public.appointment_requests for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin manage expenses" on public.expenses;
create policy "admin manage expenses"
on public.expenses for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
