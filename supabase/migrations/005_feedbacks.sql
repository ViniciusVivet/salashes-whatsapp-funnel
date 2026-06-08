create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  service_name text,
  comment text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback_media (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedbacks(id) on delete cascade,
  kind text not null check (kind in ('avatar', 'result')),
  storage_path text not null,
  public_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_feedbacks_status_created_at
on public.feedbacks(status, created_at desc);

create index if not exists idx_feedbacks_featured
on public.feedbacks(featured, created_at desc)
where status = 'approved';

create index if not exists idx_feedback_media_feedback_id
on public.feedback_media(feedback_id);

drop trigger if exists feedbacks_set_updated_at on public.feedbacks;
create trigger feedbacks_set_updated_at
before update on public.feedbacks
for each row execute function public.set_updated_at();

alter table public.feedbacks enable row level security;
alter table public.feedback_media enable row level security;

create or replace function public.feedback_accepts_media(target_feedback_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.feedbacks
    where id = target_feedback_id
      and status = 'pending'
  );
$$;

drop policy if exists "public create pending feedbacks" on public.feedbacks;
create policy "public create pending feedbacks"
on public.feedbacks for insert
to anon, authenticated
with check (status = 'pending' and featured = false);

drop policy if exists "public read approved feedbacks" on public.feedbacks;
create policy "public read approved feedbacks"
on public.feedbacks for select
to anon, authenticated
using (status = 'approved' or public.is_admin());

drop policy if exists "admin manage feedbacks" on public.feedbacks;
create policy "admin manage feedbacks"
on public.feedbacks for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public create feedback media" on public.feedback_media;
create policy "public create feedback media"
on public.feedback_media for insert
to anon, authenticated
with check (public.feedback_accepts_media(feedback_id));

drop policy if exists "public read approved feedback media" on public.feedback_media;
create policy "public read approved feedback media"
on public.feedback_media for select
to anon, authenticated
using (
  exists (
    select 1
    from public.feedbacks
    where feedbacks.id = feedback_media.feedback_id
      and (feedbacks.status = 'approved' or public.is_admin())
  )
);

drop policy if exists "admin manage feedback media" on public.feedback_media;
create policy "admin manage feedback media"
on public.feedback_media for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'feedback-media',
  'feedback-media',
  true,
  1048576,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 1048576,
  allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'];

drop policy if exists "public read feedback media objects" on storage.objects;
create policy "public read feedback media objects"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'feedback-media');

drop policy if exists "public upload feedback media objects" on storage.objects;
create policy "public upload feedback media objects"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'feedback-media');

drop policy if exists "admin delete feedback media objects" on storage.objects;
create policy "admin delete feedback media objects"
on storage.objects for delete
to authenticated
using (bucket_id = 'feedback-media' and public.is_admin());
