-- Patient reviews of doctors.
-- One review per (user, doctor). Patients write/edit/delete their own
-- review; anyone can read published reviews; admin can moderate.

create table if not exists public.doctor_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text not null check (char_length(trim(body)) between 10 and 2000),
  is_published boolean not null default true,
  is_hidden_by_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, doctor_id)
);

create index if not exists doctor_reviews_doctor_idx
  on public.doctor_reviews (doctor_id, created_at desc);
create index if not exists doctor_reviews_user_idx
  on public.doctor_reviews (user_id, created_at desc);

create or replace function public.touch_doctor_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists doctor_reviews_updated_at on public.doctor_reviews;
create trigger doctor_reviews_updated_at
  before update on public.doctor_reviews
  for each row execute function public.touch_doctor_reviews_updated_at();

alter table public.doctor_reviews enable row level security;

-- Anyone (incl. anon) can read published, non-hidden reviews
drop policy if exists "reviews_public_read" on public.doctor_reviews;
create policy "reviews_public_read"
  on public.doctor_reviews for select
  to anon, authenticated
  using (is_published and not is_hidden_by_admin);

-- The author always sees their own (even if hidden / unpublished)
drop policy if exists "reviews_owner_read" on public.doctor_reviews;
create policy "reviews_owner_read"
  on public.doctor_reviews for select
  to authenticated
  using (auth.uid() = user_id);

-- Author inserts
drop policy if exists "reviews_owner_insert" on public.doctor_reviews;
create policy "reviews_owner_insert"
  on public.doctor_reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Author edits (cannot toggle is_hidden_by_admin — enforced via trigger below)
drop policy if exists "reviews_owner_update" on public.doctor_reviews;
create policy "reviews_owner_update"
  on public.doctor_reviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Author delete
drop policy if exists "reviews_owner_delete" on public.doctor_reviews;
create policy "reviews_owner_delete"
  on public.doctor_reviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- Admin can hide/unhide and see all
drop policy if exists "reviews_admin_all" on public.doctor_reviews;
create policy "reviews_admin_all"
  on public.doctor_reviews for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Prevent non-admin authors from toggling is_hidden_by_admin
create or replace function public.guard_review_admin_fields()
returns trigger
language plpgsql
as $$
declare
  is_admin boolean;
begin
  select role = 'admin' into is_admin
  from public.profiles
  where id = auth.uid();
  if coalesce(is_admin, false) then
    return new;
  end if;
  if new.is_hidden_by_admin is distinct from old.is_hidden_by_admin then
    raise exception 'is_hidden_by_admin can only be changed by admin';
  end if;
  return new;
end;
$$;

drop trigger if exists doctor_reviews_admin_guard on public.doctor_reviews;
create trigger doctor_reviews_admin_guard
  before update on public.doctor_reviews
  for each row execute function public.guard_review_admin_fields();
