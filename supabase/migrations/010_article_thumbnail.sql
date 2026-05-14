-- Cache an OG/preview image URL per article so list pages can show a
-- thumbnail without re-fetching the source page on every render.

alter table public.doctor_articles
  add column if not exists thumbnail_url text;
