/**
 * Seed Supabase from the static Phase 1 dataset.
 *
 *   pnpm dlx tsx --env-file=.env.local scripts/seed-doctors.ts
 *   # or
 *   npx tsx --env-file=.env.local scripts/seed-doctors.ts
 *
 * Idempotent: upserts on doctors.slug, then replaces each doctor's
 * videos/articles. Re-run any time the static array changes (or skip once
 * the static file is deleted).
 */
import { createClient } from "@supabase/supabase-js"
import { doctors as staticDoctors } from "../src/lib/data/doctors"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Did you create .env.local and pass --env-file=.env.local?",
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  console.log(`Seeding ${staticDoctors.length} doctors → ${url}`)

  for (const d of staticDoctors) {
    const { data: upserted, error: upsertErr } = await supabase
      .from("doctors")
      .upsert(
        {
          slug: d.slug,
          name: d.name,
          hospital: d.hospital,
          location: d.location,
          district: d.district,
          region: d.region,
          specialties: d.specialties,
          keywords: d.keywords,
          target_patients: d.targetPatients,
          treatments: d.treatments,
          bio: d.bio,
          hours: d.hours,
          lunch_break: d.lunchBreak ?? null,
          closed_days: d.closedDays ?? null,
          review_keywords: d.reviewKeywords,
          kakao_url: d.kakaoUrl ?? null,
          website_url: d.websiteUrl ?? null,
          photo_placeholder_color: d.photoPlaceholderColor,
          is_published: true,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single()

    if (upsertErr || !upserted) {
      console.error(`  ✗ ${d.slug}:`, upsertErr?.message)
      continue
    }
    const doctorId = upserted.id

    // Clean-slate replace children
    await supabase.from("doctor_videos").delete().eq("doctor_id", doctorId)
    await supabase.from("doctor_articles").delete().eq("doctor_id", doctorId)

    if (d.videos.length) {
      const { error: vErr } = await supabase.from("doctor_videos").insert(
        d.videos.map((v, i) => ({
          doctor_id: doctorId,
          url: v.url,
          title: v.title,
          date: v.date ?? null,
          sort_order: i,
        })),
      )
      if (vErr) console.error(`  ✗ ${d.slug} videos:`, vErr.message)
    }

    if (d.articles.length) {
      const { error: aErr } = await supabase.from("doctor_articles").insert(
        d.articles.map((a, i) => ({
          doctor_id: doctorId,
          url: a.url,
          title: a.title,
          date: a.date ?? null,
          platform: a.platform === "naver" ? "naver" : "other",
          sort_order: i,
        })),
      )
      if (aErr) console.error(`  ✗ ${d.slug} articles:`, aErr.message)
    }

    console.log(`  ✓ ${d.slug} (${d.name}) — ${d.videos.length}v, ${d.articles.length}a`)
  }

  const { count } = await supabase
    .from("doctors")
    .select("*", { count: "exact", head: true })
  console.log(`\nTotal doctors in DB: ${count}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
