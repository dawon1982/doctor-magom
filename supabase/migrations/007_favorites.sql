-- Phase: patient favorites.
-- Logged-in patients (or any role) can bookmark doctors.

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, doctor_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id);
create index if not exists favorites_doctor_idx on public.favorites (doctor_id);

alter table public.favorites enable row level security;

drop policy if exists "favorites_owner_select" on public.favorites;
create policy "favorites_owner_select"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "favorites_owner_insert" on public.favorites;
create policy "favorites_owner_insert"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "favorites_owner_delete" on public.favorites;
create policy "favorites_owner_delete"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);
