/**
 * Seed Supabase from the static Phase 1 dataset.
 *
 *   npx tsx scripts/seed-doctors.ts
 *
 * Reads .env.local relative to the repo root. Idempotent: upserts on
 * doctors.slug, then replaces each doctor's videos/articles.
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"
import { doctors as staticDoctors } from "../src/lib/data/doctors"

// Minimal .env.local loader so we don't add a dotenv dep.
function loadEnv(file: string) {
  let count = 0
  const path = resolve(process.cwd(), file)
  try {
    const raw = readFileSync(path, "utf8")
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!m) continue
      const key = m[1]
      let val = m[2].replace(/\r$/, "")
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
      count++
    }
    console.log(`(env) loaded ${count} keys from ${path}`)
  } catch (err) {
    console.warn(`(env) couldn't read ${path}:`, err)
  }
}
loadEnv(".env.local")

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
