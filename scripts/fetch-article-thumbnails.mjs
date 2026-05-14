/**
 * For every doctor_articles row missing a thumbnail_url, fetch the
 * article URL and extract the OG/Twitter card preview image. Cache the
 * result in `doctor_articles.thumbnail_url` so list pages can show the
 * thumbnail without re-fetching on every render.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node --experimental-specifier-resolution=node scripts/fetch-article-thumbnails.mjs
 *
 * Pass --all to re-scrape every article (default is rows where
 * thumbnail_url is null).
 */
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}
const sb = createClient(SUPABASE_URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const FORCE_ALL = process.argv.includes("--all")

const UA = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
}

async function get(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15_000),
    headers: UA,
    redirect: "follow",
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.text()
}

/**
 * Pull a preview image URL from an HTML document.
 * Priority order:
 *   1. og:image
 *   2. twitter:image (or twitter:image:src)
 *   3. <link rel="image_src">
 *   4. First <img> with reasonably large display size that isn't a logo
 */
function extractPreviewImage(html, sourceUrl) {
  const patterns = [
    /<meta\s+(?:property|name)="og:image(?::secure_url)?"\s+content="([^"]+)"/i,
    /<meta\s+content="([^"]+)"\s+(?:property|name)="og:image(?::secure_url)?"/i,
    /<meta\s+(?:property|name)="twitter:image(?::src)?"\s+content="([^"]+)"/i,
    /<meta\s+content="([^"]+)"\s+(?:property|name)="twitter:image(?::src)?"/i,
    /<link\s+rel="image_src"\s+href="([^"]+)"/i,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m && m[1]) {
      try {
        // Resolve relative URLs against the source page
        return new URL(m[1], sourceUrl).href
      } catch {
        return m[1]
      }
    }
  }
  return null
}

/**
 * Naver blog posts proxy the actual content inside an iframe at
 * `blog.naver.com/PostView.naver?blogId=...&logNo=...`. The outer page's
 * og:image is the blog cover; the inner page has the real post thumbnail.
 * We fetch the inner page when we detect a Naver URL.
 */
async function fetchNaverInnerHtml(url) {
  // Format A: blog.naver.com/<blogId>/<logNo>
  const m1 = url.match(
    /blog\.naver\.com\/([A-Za-z0-9_-]+)\/(\d+)/i,
  )
  if (m1) {
    const innerUrl = `https://blog.naver.com/PostView.naver?blogId=${m1[1]}&logNo=${m1[2]}`
    return await get(innerUrl)
  }
  return null
}

async function getPreviewFor(url) {
  // Try Naver inner page first if it's a Naver blog URL
  let html
  if (/blog\.naver\.com\//i.test(url)) {
    try {
      html = await fetchNaverInnerHtml(url)
    } catch {}
  }
  if (!html) {
    html = await get(url)
  }
  return extractPreviewImage(html, url)
}

async function main() {
  const query = sb
    .from("doctor_articles")
    .select("id, url, title, thumbnail_url")
  const { data: rows, error } = FORCE_ALL
    ? await query
    : await query.is("thumbnail_url", null)
  if (error) {
    console.error(error.message)
    process.exit(1)
  }
  if (!rows?.length) {
    console.log("No articles need thumbnail enrichment.")
    return
  }
  console.log(`Processing ${rows.length} article(s)…`)

  let okCount = 0
  let failCount = 0
  for (const row of rows) {
    try {
      const img = await getPreviewFor(row.url)
      if (!img) {
        console.log(`  ⚠ ${row.title.slice(0, 30)} — no preview image found`)
        failCount++
        continue
      }
      await sb
        .from("doctor_articles")
        .update({ thumbnail_url: img })
        .eq("id", row.id)
      console.log(`  ✓ ${row.title.slice(0, 30)} → ${img.slice(0, 60)}…`)
      okCount++
    } catch (e) {
      console.log(`  ✗ ${row.title.slice(0, 30)} — ${e.message}`)
      failCount++
    }
    // Polite pacing
    await new Promise((r) => setTimeout(r, 250))
  }

  console.log(`\nDone. ${okCount} saved, ${failCount} failed.`)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
