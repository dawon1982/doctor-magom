-- doctor_applications: split phone into hospital/mobile + add channel URLs
-- Safe to re-run.

alter table public.doctor_applications
  drop column if exists phone,
  add column if not exists hospital_phone text,
  add column if not exists mobile_phone text,
  add column if not exists hospital_website text,
  add column if not exists personal_website text,
  add column if not exists blog_url text,
  add column if not exists youtube_url text,
  add column if not exists instagram_url text;
