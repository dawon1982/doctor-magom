-- Track outbound clicks to a doctor's external destinations (Kakao booking,
-- hospital homepage). This is the conversion signal behind the premium-
-- exposure business model — which doctors actually pull patient intent.

create table if not exists public.doctor_outbound_clicks (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  -- 'kakao' | 'website' | (future: 'phone', 'naver', ...)
  kind text not null,
  created_at timestamptz not null default now()
);

create index if not exists outbound_clicks_doctor_idx
  on public.doctor_outbound_clicks (doctor_id, created_at desc);
create index if not exists outbound_clicks_kind_idx
  on public.doctor_outbound_clicks (kind, created_at desc);

alter table public.doctor_outbound_clicks enable row level security;

-- Inserts happen server-side via the service-role client (API route), so no
-- anon insert policy is needed. Admin can read for the dashboard.
drop policy if exists "outbound_clicks_admin_select" on public.doctor_outbound_clicks;
create policy "outbound_clicks_admin_select"
  on public.doctor_outbound_clicks
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
