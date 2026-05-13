-- Phase 3 step 3: Patient-doctor AI matching telemetry.
-- Logs every match request (anonymous) so we can review what users ask for,
-- which doctors get recommended, and which queries fail. No PII fields.

create table if not exists public.match_queries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- Patient input (free text + structured filters)
  query text not null,
  region text,
  target_patient text,
  -- AI output — slugs of recommended doctors (top 3), in order
  recommended_slugs text[] not null default '{}',
  -- Token usage for cost tracking
  input_tokens int,
  output_tokens int,
  cached_read_tokens int,
  -- Soft error capture; null = success
  error text
);

create index if not exists match_queries_created_at_idx
  on public.match_queries (created_at desc);

-- Public table — anyone (incl. anon) can insert their own match attempts.
-- No selects allowed except via service role; admin reviews via dashboard.
alter table public.match_queries enable row level security;

drop policy if exists "match_queries_anon_insert" on public.match_queries;
create policy "match_queries_anon_insert"
  on public.match_queries
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "match_queries_admin_select" on public.match_queries;
create policy "match_queries_admin_select"
  on public.match_queries
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
