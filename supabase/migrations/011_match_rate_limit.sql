-- Rate-limit support for the AI matcher.
-- Stores a salted SHA-256 hash of the requester IP so we can count recent
-- requests per visitor without persisting the raw IP (privacy).

alter table public.match_queries
  add column if not exists ip_hash text;

-- Fast "how many requests from this IP in the last minute" lookups.
create index if not exists match_queries_ip_recent_idx
  on public.match_queries (ip_hash, created_at desc);
