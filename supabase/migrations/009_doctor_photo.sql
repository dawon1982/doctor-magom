-- Doctor profile photos: add photo_url column + public storage bucket.

alter table public.doctors
  add column if not exists photo_url text;

-- Public storage bucket for doctor portraits. Public read so the
-- bucket URL can be embedded directly in <img>/OG without signed URLs.
insert into storage.buckets (id, name, public)
values ('doctor-photos', 'doctor-photos', true)
on conflict (id) do nothing;

-- Public can read
drop policy if exists "doctor_photos_public_read" on storage.objects;
create policy "doctor_photos_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'doctor-photos');

-- Only admin or the doctor who owns the row can write/replace/delete.
-- Object naming convention: <doctor_id>/<filename>. The doctor_id is the
-- first path segment, which we cross-check against profiles.doctor_id.
drop policy if exists "doctor_photos_owner_write" on storage.objects;
create policy "doctor_photos_owner_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'doctor-photos'
    and (
      -- admin
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
      )
      -- or the doctor owns the doctor_id encoded as first path segment
      or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'doctor'
          and profiles.doctor_id::text = split_part(name, '/', 1)
      )
    )
  );

drop policy if exists "doctor_photos_owner_update" on storage.objects;
create policy "doctor_photos_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'doctor-photos'
    and (
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
      )
      or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'doctor'
          and profiles.doctor_id::text = split_part(name, '/', 1)
      )
    )
  );

drop policy if exists "doctor_photos_owner_delete" on storage.objects;
create policy "doctor_photos_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'doctor-photos'
    and (
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
      )
      or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'doctor'
          and profiles.doctor_id::text = split_part(name, '/', 1)
      )
    )
  );
