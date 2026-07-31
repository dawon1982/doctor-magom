-- 1) Booking channels that were missing entirely.
--    Korean clinics are booked by phone first and Naver second; neither had a
--    column, so doctors with no Kakao/website link had zero contact CTA.
alter table public.doctors
  add column if not exists phone text,
  add column if not exists naver_booking_url text;

-- 2) Close the AI-matching rate-limit bypass.
--    match_queries is written only by the server (service role) inside
--    src/app/match/actions.ts, but this policy let anyone INSERT with the
--    public anon key. Since the global limiter counts rows in the last minute,
--    40 forged inserts locked every real user out of AI matching.
drop policy if exists "match_queries_anon_insert" on public.match_queries;
