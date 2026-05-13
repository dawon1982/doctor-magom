-- Phase 3 step 2: YouTube channel URL for auto-collection + dedup constraint.
-- Safe to re-run.

alter table public.doctors
  add column if not exists youtube_channel_url text;

-- ADD CONSTRAINT has no IF NOT EXISTS form, so guard via pg_constraint lookup.
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'doctor_videos_doctor_url_unique'
  ) then
    alter table public.doctor_videos
      add constraint doctor_videos_doctor_url_unique unique (doctor_id, url);
  end if;
end $$;
