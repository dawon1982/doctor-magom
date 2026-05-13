-- Fix RLS infinite recursion on doctors / profiles.
--
-- The previous policies (in 001_init.sql) referenced their own table inside
-- `with check` to enforce immutable columns (doctors.slug, profiles.role,
-- profiles.doctor_id). PostgreSQL re-enters the policy on that nested SELECT
-- and recurses forever.
--
-- Fix: simplify the `with check` to a plain ownership predicate, and enforce
-- the immutable-column rules via BEFORE UPDATE triggers instead.
-- Safe to re-run.

-- ============================================================================
-- doctors.slug — doctor role cannot rename their own slug; admin can.
-- ============================================================================
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
  );

create or replace function public.prevent_doctor_slug_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if OLD.slug is distinct from NEW.slug
     and not public.is_admin()
     and exists (select 1 from public.profiles
                 where id = auth.uid() and role = 'doctor')
  then
    raise exception 'Doctors cannot rename their own slug (admin only).';
  end if;
  return NEW;
end$$;

drop trigger if exists trg_doctors_prevent_slug_change on public.doctors;
create trigger trg_doctors_prevent_slug_change
  before update on public.doctors
  for each row execute procedure public.prevent_doctor_slug_change();

-- ============================================================================
-- profiles — non-admin self-update cannot escalate role or change doctor_id.
-- ============================================================================
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create or replace function public.prevent_profile_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- admins can change anything
  if public.is_admin() then
    return NEW;
  end if;
  -- everyone else: lock role + doctor_id
  if OLD.role is distinct from NEW.role then
    raise exception 'Cannot change role (admin only).';
  end if;
  if OLD.doctor_id is distinct from NEW.doctor_id then
    raise exception 'Cannot change doctor_id (admin only).';
  end if;
  return NEW;
end$$;

drop trigger if exists trg_profiles_prevent_escalation on public.profiles;
create trigger trg_profiles_prevent_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_profile_role_escalation();
