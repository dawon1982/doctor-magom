/**
 * For each doctor with a website_url, scrape the page and:
 *   - Discover a YouTube channel link (saves to doctors.youtube_channel_url
 *     if currently empty), then pull latest 5 videos via the channel RSS feed.
 *   - Discover Naver blog URLs and pull the latest 5 posts via blog RSS.
 * All inserts dedup against existing rows (doctor_videos.url + naive title match
 * for articles) so it's safe to re-run.
 *
 * Usage:
 *   export NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
 *   export SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *   node --experimental-specifier-resolution=node scripts/refresh-doctor-content.mjs
 */
import { createClient } from "@supabase/supabase-js"
import { XMLParser } from "fast-xml-parser"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}
const sb = createClient(SUPABASE_URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const UA = {
  "User-Agent":
    "Mozilla/5.0 (compatible; doctor-magom-refresh/1.0; +https://doctor-magom.vercel.app)",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
  Cookie: "CONSENT=YES+cb; SOCS=CAI",
}

async function get(url, opts = {}) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15_000),
    headers: { ...UA, ...(opts.headers ?? {}) },
    redirect: "follow",
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return opts.binary ? new Uint8Array(await res.arrayBuffer()) : await res.text()
}

// ---------------------------------------------------------------------------
// YouTube channel discovery + resolution + video fetch
// ---------------------------------------------------------------------------
function findYouTubeChannelUrl(html) {
  // Priority order — pick the most "channel-like" link
  const patterns = [
    /https?:\/\/(?:www\.)?youtube\.com\/channel\/UC[A-Za-z0-9_-]{22}/,
    /https?:\/\/(?:www\.)?youtube\.com\/@[A-Za-z0-9_.가-힣-]+/,
    /https?:\/\/(?:www\.)?youtube\.com\/c\/[A-Za-z0-9_.가-힣-]+/,
    /https?:\/\/(?:www\.)?youtube\.com\/user\/[A-Za-z0-9_.가-힣-]+/,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) return m[0]
  }
  return null
}

async function resolveChannelId(rawUrl) {
  const m1 = rawUrl.match(/\/channel\/(UC[A-Za-z0-9_-]{22})/)
  if (m1) return m1[1]
  // Need to fetch the page to find UC ID
  try {
    const html = await get(rawUrl)
    const candidates = []
    const patterns = [
      /<link\s+rel="canonical"\s+href="[^"]*\/channel\/(UC[A-Za-z0-9_-]{22})"/i,
      /<meta\s+property="og:url"\s+content="[^"]*\/channel\/(UC[A-Za-z0-9_-]{22})"/i,
      /"externalChannelId":"(UC[A-Za-z0-9_-]{22})"/,
      /"channelId":"(UC[A-Za-z0-9_-]{22})"/,
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m && !candidates.includes(m[1])) candidates.push(m[1])
    }
    // Validate each against RSS (some matches are unrelated channels mentioned in recommendations)
    for (const c of candidates) {
      const res = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${c}`,
      ).catch(() => null)
      if (res?.ok) return c
    }
    return candidates[0] ?? null
  } catch {
    return null
  }
}

async function fetchLatestVideos(channelId, limit = 5) {
  const xml = await get(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
  )
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  })
  const feed = parser.parse(xml)?.feed
  const entries = feed?.entry ?? []
  const arr = Array.isArray(entries) ? entries : [entries]
  return arr.slice(0, limit).map((e) => ({
    url: e.link?.["@_href"] ?? e.link,
    title: e.title,
    date: typeof e.published === "string" ? e.published.slice(0, 10) : null,
  }))
}

// ---------------------------------------------------------------------------
// Naver blog discovery + RSS fetch
// ---------------------------------------------------------------------------
function findNaverBlogId(html) {
  // Match blog.naver.com/<blogId>[/<postId>] — capture <blogId>
  const m = html.match(/blog\.naver\.com\/([A-Za-z0-9_-]+)(?:[/?#]|$)/)
  if (!m) return null
  // Skip generic paths
  if (["main", "PostList", "search"].includes(m[1])) return null
  return m[1]
}

async function fetchNaverBlogPosts(blogId, limit = 5) {
  // Naver blog has a public RSS at this URL
  const xml = await get(`https://rss.blog.naver.com/${blogId}.xml`)
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  })
  const items = parser.parse(xml)?.rss?.channel?.item ?? []
  const arr = Array.isArray(items) ? items : [items]
  return arr.slice(0, limit).map((it) => ({
    url: it.link,
    title: (it.title ?? "").toString().trim(),
    date: typeof it.pubDate === "string"
      ? new Date(it.pubDate).toISOString().slice(0, 10)
      : null,
  }))
}

// ---------------------------------------------------------------------------
// Per-doctor pipeline
// ---------------------------------------------------------------------------
async function processDoctor(d) {
  const out = { name: d.name, slug: d.slug, ytAdded: 0, ytSkipped: 0, articlesAdded: 0, articlesSkipped: 0, errors: [] }
  if (!d.website_url) {
    out.errors.push("no website")
    return out
  }

  let html
  try {
    html = await get(d.website_url)
  } catch (e) {
    out.errors.push(`fetch site: ${e.message}`)
    return out
  }

  // --- YouTube ---
  let channelUrl = d.youtube_channel_url
  if (!channelUrl) {
    channelUrl = findYouTubeChannelUrl(html)
    if (channelUrl) {
      await sb
        .from("doctors")
        .update({ youtube_channel_url: channelUrl })
        .eq("id", d.id)
      out.discoveredYT = channelUrl
    }
  }
  if (channelUrl) {
    try {
      const channelId = await resolveChannelId(channelUrl)
      if (channelId) {
        const vids = await fetchLatestVideos(channelId, 5)
        const { data: existing } = await sb
          .from("doctor_videos")
          .select("url, sort_order")
          .eq("doctor_id", d.id)
        const existingUrls = new Set((existing ?? []).map((v) => v.url))
        let nextOrder =
          (existing ?? []).reduce((m, v) => Math.max(m, v.sort_order ?? 0), -1) + 1
        for (const v of vids) {
          if (!v.url || existingUrls.has(v.url)) {
            out.ytSkipped++
            continue
          }
          const { error } = await sb.from("doctor_videos").insert({
            doctor_id: d.id,
            url: v.url,
            title: v.title,
            date: v.date,
            sort_order: nextOrder++,
          })
          if (error) out.errors.push(`yt insert: ${error.message}`)
          else out.ytAdded++
        }
      } else {
        out.errors.push(`YT resolve failed: ${channelUrl}`)
      }
    } catch (e) {
      out.errors.push(`YT fetch: ${e.message}`)
    }
  }

  // --- Naver blog ---
  const blogId = findNaverBlogId(html)
  if (blogId) {
    out.discoveredBlog = `blog.naver.com/${blogId}`
    try {
      const posts = await fetchNaverBlogPosts(blogId, 5)
      const { data: existing } = await sb
        .from("doctor_articles")
        .select("url, title, sort_order")
        .eq("doctor_id", d.id)
      const existingUrls = new Set((existing ?? []).map((a) => a.url))
      const existingTitles = new Set((existing ?? []).map((a) => a.title.toLowerCase().trim()))
      let nextOrder =
        (existing ?? []).reduce((m, a) => Math.max(m, a.sort_order ?? 0), -1) + 1
      for (const p of posts) {
        if (!p.url) { out.articlesSkipped++; continue }
        if (existingUrls.has(p.url) || existingTitles.has(p.title.toLowerCase().trim())) {
          out.articlesSkipped++
          continue
        }
        const { error } = await sb.from("doctor_articles").insert({
          doctor_id: d.id,
          url: p.url,
          title: p.title,
          date: p.date,
          platform: "naver",
          sort_order: nextOrder++,
        })
        if (error) out.errors.push(`article insert: ${error.message}`)
        else out.articlesAdded++
      }
    } catch (e) {
      out.errors.push(`blog fetch: ${e.message}`)
    }
  }

  return out
}

// ---------------------------------------------------------------------------
async function main() {
  const { data: docs, error } = await sb
    .from("doctors")
    .select("id, slug, name, website_url, youtube_channel_url")
    .order("created_at")
  if (error) {
    console.error(error.message)
    process.exit(1)
  }

  const summary = []
  for (const d of docs ?? []) {
    if (!d.website_url) continue
    process.stdout.write(`\n=== ${d.name} (${d.slug}) ===\n`)
    const r = await processDoctor(d)
    summary.push(r)
    console.log(`  YT: +${r.ytAdded} (-${r.ytSkipped} dup)  ` +
                `Articles: +${r.articlesAdded} (-${r.articlesSkipped} dup)`)
    if (r.discoveredYT) console.log(`  → discovered YT channel: ${r.discoveredYT}`)
    if (r.discoveredBlog) console.log(`  → discovered blog: ${r.discoveredBlog}`)
    for (const err of r.errors) console.log(`  ⚠ ${err}`)
  }

  console.log("\n--- TOTALS ---")
  console.log(`Videos added: ${summary.reduce((a, r) => a + r.ytAdded, 0)}`)
  console.log(`Articles added: ${summary.reduce((a, r) => a + r.articlesAdded, 0)}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
