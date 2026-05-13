/**
 * For each doctor: search Naver for the hospital name → find Naver Place ID
 *   → fetch place page → extract every linked URL (homepage / blog / YouTube /
 *   Instagram) → update doctors.website_url, doctors.youtube_channel_url, and
 *   refresh latest blog posts + YouTube videos.
 *
 * Why: most doctors' original modoo.at sites are dead. Naver Place is the
 * authoritative source of what they're using now.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node --experimental-specifier-resolution=node scripts/refresh-from-naver-place.mjs
 */
import { createClient } from "@supabase/supabase-js"
import { XMLParser } from "fast-xml-parser"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !KEY) {
  console.error("Missing env")
  process.exit(1)
}
const sb = createClient(SUPABASE_URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const UA_DESKTOP =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
const UA_MOBILE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

async function get(url, ua = UA_DESKTOP) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20_000),
    headers: {
      "User-Agent": ua,
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    },
    redirect: "follow",
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return await res.text()
}

// ---------------------------------------------------------------------------
// 1) Search Naver → find Place ID
// ---------------------------------------------------------------------------
async function findPlaceId(hospitalName, district) {
  // Adding the district reduces ambiguity (e.g. 오늘 정신건강의학과 has multiple branches)
  const q = district ? `${hospitalName} ${district}` : hospitalName
  const html = await get(
    `https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`,
  )
  // Find first numeric placeId pattern in the page (place card link)
  const ids = [...html.matchAll(/place[A-Za-z]?[/?_=][A-Za-z]*?(\d{8,12})/g)]
    .map((m) => m[1])
  const seen = new Set()
  for (const id of ids) {
    if (!seen.has(id)) { seen.add(id); return id }
  }
  return null
}

// ---------------------------------------------------------------------------
// 2) Fetch place page → extract all homepage URLs
// ---------------------------------------------------------------------------
async function fetchPlaceHomepages(placeId) {
  const html = await get(
    `https://m.place.naver.com/hospital/${placeId}/home`,
    UA_MOBILE,
  )
  // The page embeds an Apollo state JSON containing the `homepages` object.
  // We scrape every {url, type} pair from the inlined state. Naver escapes /
  // as / so we normalize before parsing.
  const normalized = html.replace(/\\u002F/g, "/")
  const entries = []
  const re = /"url":"(https?:\/\/[^"]+)","landingUrl":"[^"]*","isDeadUrl":(true|false)(?:,"type":"([^"]+)")?(?:,"typeI18n":"([^"]+)")?/g
  let m
  while ((m = re.exec(normalized)) !== null) {
    entries.push({
      url: m[1],
      dead: m[2] === "true",
      type: m[3] ?? m[4] ?? "",
    })
  }
  // Dedup by URL
  const seen = new Set()
  return entries.filter((e) => {
    if (seen.has(e.url) || e.dead) return false
    seen.add(e.url)
    return true
  })
}

// ---------------------------------------------------------------------------
// 3) Categorize URLs
// ---------------------------------------------------------------------------
function categorize(entry) {
  const u = entry.url
  if (/blog\.naver\.com\//i.test(u)) return "naver_blog"
  if (/youtube\.com|youtu\.be/i.test(u)) return "youtube"
  if (/instagram\.com\//i.test(u)) return "instagram"
  if (/kakao\.com|pf\.kakao|talk\.kakao/i.test(u)) return "kakao"
  if (/modoo\.at/i.test(u)) return "modoo_dead"
  return "homepage"
}

// ---------------------------------------------------------------------------
// 4) Naver blog RSS fetch
// ---------------------------------------------------------------------------
function naverBlogId(url) {
  const m = url.match(/blog\.naver\.com\/([A-Za-z0-9_-]+)/i)
  return m?.[1] ?? null
}
async function fetchNaverBlogPosts(blogId, limit = 5) {
  const xml = await get(`https://rss.blog.naver.com/${blogId}.xml`)
  const items = new XMLParser().parse(xml)?.rss?.channel?.item ?? []
  const arr = Array.isArray(items) ? items : [items]
  return arr.slice(0, limit).map((it) => ({
    url: it.link,
    title: (it.title ?? "").toString().trim(),
    date:
      typeof it.pubDate === "string"
        ? new Date(it.pubDate).toISOString().slice(0, 10)
        : null,
  }))
}

// ---------------------------------------------------------------------------
// 5) YouTube channel resolution + video fetch
// ---------------------------------------------------------------------------
async function resolveChannelId(rawUrl) {
  const m1 = rawUrl.match(/\/channel\/(UC[A-Za-z0-9_-]{22})/)
  if (m1) return m1[1]
  try {
    const html = await get(rawUrl, UA_DESKTOP)
    const patterns = [
      /<link\s+rel="canonical"\s+href="[^"]*\/channel\/(UC[A-Za-z0-9_-]{22})"/i,
      /"externalChannelId":"(UC[A-Za-z0-9_-]{22})"/,
      /"channelId":"(UC[A-Za-z0-9_-]{22})"/,
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m) {
        const res = await fetch(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${m[1]}`,
        ).catch(() => null)
        if (res?.ok) return m[1]
      }
    }
  } catch {}
  return null
}
async function fetchLatestVideos(channelId, limit = 5) {
  const xml = await get(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
  )
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" })
  const entries = parser.parse(xml)?.feed?.entry ?? []
  const arr = Array.isArray(entries) ? entries : [entries]
  return arr.slice(0, limit).map((e) => ({
    url: e.link?.["@_href"] ?? e.link,
    title: e.title,
    date: typeof e.published === "string" ? e.published.slice(0, 10) : null,
  }))
}

// ---------------------------------------------------------------------------
// 6) Per-doctor pipeline
// ---------------------------------------------------------------------------
async function processDoctor(d) {
  const log = []
  log.push(`\n=== ${d.name} (${d.slug}) | ${d.hospital} ${d.district ?? ""}`)

  let placeId
  try {
    placeId = await findPlaceId(d.hospital, d.district)
  } catch (e) {
    log.push(`  ⚠ search failed: ${e.message}`)
    return log
  }
  if (!placeId) {
    log.push("  ⚠ no Naver Place result")
    return log
  }
  log.push(`  placeId=${placeId}`)

  let entries
  try {
    entries = await fetchPlaceHomepages(placeId)
  } catch (e) {
    log.push(`  ⚠ fetch place: ${e.message}`)
    return log
  }
  if (entries.length === 0) {
    log.push("  → place has no homepage URLs registered")
    return log
  }

  // Categorize
  const buckets = { homepage: [], naver_blog: [], youtube: [], instagram: [], kakao: [], modoo_dead: [] }
  for (const e of entries) buckets[categorize(e)]?.push(e.url)
  log.push(`  found: ${Object.entries(buckets).filter(([_, v]) => v.length).map(([k, v]) => `${k}=${v.length}`).join(", ")}`)

  // 1) Update website_url — prefer plain homepage; fall back to first non-modoo URL
  const newWebsite = buckets.homepage[0] ?? buckets.naver_blog[0] ?? null
  if (newWebsite && newWebsite !== d.website_url) {
    const { error } = await sb.from("doctors").update({ website_url: newWebsite }).eq("id", d.id)
    log.push(error ? `  ⚠ website update: ${error.message}` : `  ✓ website_url → ${newWebsite}`)
  } else if (newWebsite) {
    log.push(`  website_url already ${newWebsite}`)
  }

  // 2) Update youtube_channel_url + fetch latest videos
  if (buckets.youtube[0] && buckets.youtube[0] !== d.youtube_channel_url) {
    await sb.from("doctors").update({ youtube_channel_url: buckets.youtube[0] }).eq("id", d.id)
    log.push(`  ✓ youtube_channel_url → ${buckets.youtube[0]}`)
  }
  const ytUrl = buckets.youtube[0] ?? d.youtube_channel_url
  if (ytUrl) {
    try {
      const channelId = await resolveChannelId(ytUrl)
      if (channelId) {
        const vids = await fetchLatestVideos(channelId, 5)
        const { data: existing } = await sb
          .from("doctor_videos")
          .select("url, sort_order")
          .eq("doctor_id", d.id)
        const existingUrls = new Set((existing ?? []).map((v) => v.url))
        let nextOrder = (existing ?? []).reduce((m, v) => Math.max(m, v.sort_order ?? 0), -1) + 1
        let added = 0
        for (const v of vids) {
          if (!v.url || existingUrls.has(v.url)) continue
          const { error } = await sb.from("doctor_videos").insert({
            doctor_id: d.id, url: v.url, title: v.title, date: v.date, sort_order: nextOrder++,
          })
          if (!error) added++
        }
        log.push(`  ✓ YouTube videos +${added}`)
      } else {
        log.push(`  ⚠ couldn't resolve YouTube channel`)
      }
    } catch (e) {
      log.push(`  ⚠ YT fetch: ${e.message}`)
    }
  }

  // 3) Update articles from Naver blog
  if (buckets.naver_blog[0]) {
    const blogId = naverBlogId(buckets.naver_blog[0])
    if (blogId) {
      try {
        const posts = await fetchNaverBlogPosts(blogId, 5)
        const { data: existing } = await sb
          .from("doctor_articles")
          .select("url, title, sort_order")
          .eq("doctor_id", d.id)
        const existingUrls = new Set((existing ?? []).map((a) => a.url))
        const existingTitles = new Set((existing ?? []).map((a) => a.title.toLowerCase().trim()))
        let nextOrder = (existing ?? []).reduce((m, a) => Math.max(m, a.sort_order ?? 0), -1) + 1
        let added = 0
        for (const p of posts) {
          if (!p.url || existingUrls.has(p.url) || existingTitles.has(p.title.toLowerCase().trim())) continue
          const { error } = await sb.from("doctor_articles").insert({
            doctor_id: d.id, url: p.url, title: p.title, date: p.date,
            platform: "naver", sort_order: nextOrder++,
          })
          if (!error) added++
        }
        log.push(`  ✓ Naver blog articles +${added}  (blogId=${blogId})`)
      } catch (e) {
        log.push(`  ⚠ blog fetch: ${e.message}`)
      }
    }
  }

  return log
}

async function main() {
  const { data: docs } = await sb
    .from("doctors")
    .select("id, slug, name, hospital, district, website_url, youtube_channel_url")
    .order("created_at")
  for (const d of docs ?? []) {
    if (!d.hospital || d.hospital.toLowerCase().includes("test")) continue
    const lines = await processDoctor(d)
    for (const l of lines) console.log(l)
    // Polite pacing — Naver may rate-limit
    await new Promise((r) => setTimeout(r, 800))
  }
  console.log("\nDone.")
}
main().catch((e) => { console.error(e); process.exit(1) })
