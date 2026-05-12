-- doctor_applications: applicants now only check which channels they have.
-- URL columns (added in 002) stay so admin / AI workflow can fill them later.
-- Safe to re-run.

alter table public.doctor_applications
  add column if not exists has_hospital_website boolean not null default false,
  add column if not exists has_personal_website boolean not null default false,
  add column if not exists has_blog boolean not null default false,
  add column if not exists has_youtube boolean not null default false,
  add column if not exists has_instagram boolean not null default false;
