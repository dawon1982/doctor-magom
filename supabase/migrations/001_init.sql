-- Doctor-Magom Phase 2: initial schema, RLS, triggers
-- Run this in Supabase Studio → SQL Editor (or via `supabase db push`).
-- Safe to re-run: every CREATE uses IF NOT EXISTS / CREATE OR REPLACE.

-------------------------------------------------------------------------------
-- updated_at helper
-------------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

-------------------------------------------------------------------------------
-- doctors (must exist before profiles references it)
-------------------------------------------------------------------------------
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  hospital text not null,
  location text not null,
  district text not null,
  region text not null check (region in ('서울','경기','인천','기타')),
  specialties text[] not null default '{}',
  keywords text[] not null default '{}',
  target_patients text[] not null default '{}',
  treatments text[] not null default '{}',
  bio text not null default '',
  hours jsonb not null default '[]'::jsonb,
  lunch_break text,
  closed_days text,
  review_keywords jsonb not null default '[]'::jsonb,
  kakao_url text,
  website_url text,
  photo_placeholder_color text not null default '#D4895A',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists doctors_region_pub_idx on public.doctors (region) where is_published;
create index if not exists doctors_district_pub_idx on public.doctors (district) where is_published;
create index if not exists doctors_specialties_gin on public.doctors using gin (specialties);
create index if not exists doctors_keywords_gin on public.doctors using gin (keywords);

drop trigger if exists trg_doctors_updated_at on public.doctors;
create trigger trg_doctors_updated_at before update on public.doctors
  for each row execute procedure public.set_updated_at();

-------------------------------------------------------------------------------
-- profiles (extends auth.users)
-------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'patient' check (role in ('patient','doctor','admin')),
  display_name text,
  doctor_id uuid references public.doctors(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_doctor_id_idx on public.profiles (doctor_id) where doctor_id is not null;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Auto-create profile row when a new auth.users row appears.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'patient',
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-------------------------------------------------------------------------------
-- is_admin() helper used by every admin RLS policy
-------------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-------------------------------------------------------------------------------
-- doctor_videos
-------------------------------------------------------------------------------
create table if not exists public.doctor_videos (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  url text not null,
  title text not null,
  date text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists doctor_videos_doctor_idx on public.doctor_videos (doctor_id, sort_order);

-------------------------------------------------------------------------------
-- doctor_articles
-------------------------------------------------------------------------------
create table if not exists public.doctor_articles (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  url text not null,
  title text not null,
  date text,
  platform text not null default 'naver' check (platform in ('naver','other')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists doctor_articles_doctor_idx on public.doctor_articles (doctor_id, sort_order);

-------------------------------------------------------------------------------
-- doctor_applications (입점 신청)
-------------------------------------------------------------------------------
create table if not exists public.doctor_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_email text not null,
  applicant_name text not null,
  hospital text not null,
  phone text,
  message text,
  status text not null default 'pending' check (status in ('pending','contacted','approved','rejected')),
  approved_doctor_id uuid references public.doctors(id) on delete set null,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists doctor_applications_status_idx on public.doctor_applications (status, created_at desc);

-------------------------------------------------------------------------------
-- patient_signups (CRM)
-------------------------------------------------------------------------------
create table if not exists public.patient_signups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  display_name text,
  age_range text,
  gender text,
  preferred_region text,
  primary_concern text,
  marketing_consent boolean not null default false,
  source text default 'web',
  created_at timestamptz not null default now()
);
create index if not exists patient_signups_created_at_idx on public.patient_signups (created_at desc);
create index if not exists patient_signups_email_idx on public.patient_signups (email);

-------------------------------------------------------------------------------
-- email_log (Resend 전송 로그·중복방지)
-------------------------------------------------------------------------------
create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  template text not null,
  to_email text not null,
  related_id uuid,
  status text not null default 'queued' check (status in ('queued','sent','failed','skipped')),
  resend_id text,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists email_log_created_at_idx on public.email_log (created_at desc);

-------------------------------------------------------------------------------
-- Row Level Security — enable on every table
-------------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.doctors             enable row level security;
alter table public.doctor_videos       enable row level security;
alter table public.doctor_articles     enable row level security;
alter table public.doctor_applications enable row level security;
alter table public.patient_signups     enable row level security;
alter table public.email_log           enable row level security;

-------------------------------------------------------------------------------
-- profiles policies
-------------------------------------------------------------------------------
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (
    -- self-edit cannot escalate role or change doctor_id
    (public.is_admin())
    or (auth.uid() = id and role = (select role from public.profiles where id = auth.uid())
        and doctor_id is not distinct from (select doctor_id from public.profiles where id = auth.uid()))
  );

drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete" on public.profiles
  for delete using (public.is_admin());

-- INSERT is restricted to the auth trigger; no policy means no client inserts.

-------------------------------------------------------------------------------
-- doctors policies
-------------------------------------------------------------------------------
drop policy if exists "doctors_public_select_published" on public.doctors;
create policy "doctors_public_select_published" on public.doctors
  for select using (is_published = true or public.is_admin()
                    or exists (select 1 from public.profiles p
                               where p.id = auth.uid()
                                 and p.role = 'doctor'
                                 and p.doctor_id = doctors.id));

drop policy if exists "doctors_admin_insert" on public.doctors;
create policy "doctors_admin_insert" on public.doctors
  for insert with check (public.is_admin());

drop policy if exists "doctors_admin_update" on public.doctors;
create policy "doctors_admin_update" on public.doctors
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "doctors_self_update" on public.doctors;
create policy "doctors_self_update" on public.doctors
  for update using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid()
              and p.role = 'doctor'
              and p.doctor_id = doctors.id)
  ) with check (
    exists (select 1 from public.profiles p
            where p.id = auth.uid()
              and p.role = 'doctor'
              and p.doctor_id = doctors.id)
    -- doctors cannot change their slug
    and slug = (select slug from public.doctors where id = doctors.id)
  );

drop policy if exists "doctors_admin_delete" on public.doctors;
create policy "doctors_admin_delete" on public.doctors
  for delete using (public.is_admin());

-------------------------------------------------------------------------------
-- doctor_videos / doctor_articles policies
-------------------------------------------------------------------------------
drop policy if exists "doctor_videos_public_select" on public.doctor_videos;
create policy "doctor_videos_public_select" on public.doctor_videos
  for select using (
    exists (select 1 from public.doctors d
            where d.id = doctor_videos.doctor_id
              and (d.is_published = true or public.is_admin()
                   or exists (select 1 from public.profiles p
                              where p.id = auth.uid() and p.role = 'doctor' and p.doctor_id = d.id)))
  );

drop policy if exists "doctor_videos_write" on public.doctor_videos;
create policy "doctor_videos_write" on public.doctor_videos
  for all using (
    public.is_admin()
    or exists (select 1 from public.profiles p
               where p.id = auth.uid() and p.role = 'doctor' and p.doctor_id = doctor_videos.doctor_id)
  ) with check (
    public.is_admin()
    or exists (select 1 from public.profiles p
               where p.id = auth.uid() and p.role = 'doctor' and p.doctor_id = doctor_videos.doctor_id)
  );

drop policy if exists "doctor_articles_public_select" on public.doctor_articles;
create policy "doctor_articles_public_select" on public.doctor_articles
  for select using (
    exists (select 1 from public.doctors d
            where d.id = doctor_articles.doctor_id
              and (d.is_published = true or public.is_admin()
                   or exists (select 1 from public.profiles p
                              where p.id = auth.uid() and p.role = 'doctor' and p.doctor_id = d.id)))
  );

drop policy if exists "doctor_articles_write" on public.doctor_articles;
create policy "doctor_articles_write" on public.doctor_articles
  for all using (
    public.is_admin()
    or exists (select 1 from public.profiles p
               where p.id = auth.uid() and p.role = 'doctor' and p.doctor_id = doctor_articles.doctor_id)
  ) with check (
    public.is_admin()
    or exists (select 1 from public.profiles p
               where p.id = auth.uid() and p.role = 'doctor' and p.doctor_id = doctor_articles.doctor_id)
  );

-------------------------------------------------------------------------------
-- doctor_applications policies
-------------------------------------------------------------------------------
drop policy if exists "applications_admin_select" on public.doctor_applications;
create policy "applications_admin_select" on public.doctor_applications
  for select using (public.is_admin());

drop policy if exists "applications_anon_insert" on public.doctor_applications;
create policy "applications_anon_insert" on public.doctor_applications
  for insert with check (true);  -- anyone can submit

drop policy if exists "applications_admin_update" on public.doctor_applications;
create policy "applications_admin_update" on public.doctor_applications
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "applications_admin_delete" on public.doctor_applications;
create policy "applications_admin_delete" on public.doctor_applications
  for delete using (public.is_admin());

-------------------------------------------------------------------------------
-- patient_signups policies
-------------------------------------------------------------------------------
drop policy if exists "patient_signups_self_select" on public.patient_signups;
create policy "patient_signups_self_select" on public.patient_signups
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "patient_signups_self_insert" on public.patient_signups;
create policy "patient_signups_self_insert" on public.patient_signups
  for insert with check (auth.uid() = user_id);

drop policy if exists "patient_signups_self_update" on public.patient_signups;
create policy "patient_signups_self_update" on public.patient_signups
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "patient_signups_admin_delete" on public.patient_signups;
create policy "patient_signups_admin_delete" on public.patient_signups
  for delete using (public.is_admin());

-------------------------------------------------------------------------------
-- email_log policies (service_role bypasses RLS by default)
-------------------------------------------------------------------------------
drop policy if exists "email_log_admin_select" on public.email_log;
create policy "email_log_admin_select" on public.email_log
  for select using (public.is_admin());

-- No INSERT/UPDATE/DELETE policies → service_role only.

-------------------------------------------------------------------------------
-- Done. After running, bootstrap the first admin:
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'leedawon82@gmail.com');
-------------------------------------------------------------------------------
