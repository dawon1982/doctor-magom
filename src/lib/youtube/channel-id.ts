import "server-only"

const UC_RE = /^UC[A-Za-z0-9_-]{22}$/
const CHANNEL_PATH_RE = /youtube\.com\/channel\/(UC[A-Za-z0-9_-]{22})/i

// Patterns in priority order. Canonical link points unambiguously at the
// page's own channel, so it's the most reliable. `channelId` JSON appears
// for every UC ID on the page (recommendations, comments, links), so it's
// the least reliable — last resort only.
const PATTERNS = [
  /<link\s+rel="canonical"\s+href="https?:\/\/[^"]*\/channel\/(UC[A-Za-z0-9_-]{22})"/i,
  /<meta\s+property="og:url"\s+content="https?:\/\/[^"]*\/channel\/(UC[A-Za-z0-9_-]{22})"/i,
  /<meta\s+itemprop="(?:channelId|identifier)"\s+content="(UC[A-Za-z0-9_-]{22})"/i,
  /"externalChannelId":"(UC[A-Za-z0-9_-]{22})"/,
  /"webCommandMetadata"[^}]*"url":"\/channel\/(UC[A-Za-z0-9_-]{22})"/,
  /"channelId":"(UC[A-Za-z0-9_-]{22})"/,
]

async function rssOk(channelId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { signal: AbortSignal.timeout(5_000) },
    )
    return res.ok
  } catch {
    return false
  }
}

/**
 * Resolve any reasonable YouTube channel URL form to the canonical UC channel
 * ID. Returns null if it can't be determined.
 *
 * Supported inputs:
 *   - "UCxxxx..." (bare ID)
 *   - https://www.youtube.com/channel/UCxxxx
 *   - https://www.youtube.com/@handle
 *   - https://www.youtube.com/c/customname
 *   - https://www.youtube.com/user/legacyname
 */
export async function resolveChannelId(raw: string): Promise<string | null> {
  const trimmed = raw.trim()

  // 1. Bare UC ID
  if (UC_RE.test(trimmed)) return trimmed

  // 2. /channel/UC...
  const m = trimmed.match(CHANNEL_PATH_RE)
  if (m) return m[1]

  // 3. /@handle, /c/name, /user/legacy → fetch + regex-scrape
  if (!/youtube\.com\/(@|c\/|user\/)/i.test(trimmed)) {
    return null
  }

  let res: Response
  try {
    res = await fetch(trimmed, {
      signal: AbortSignal.timeout(10_000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DoctorMagomBot/1.0; +https://doctor-magom.vercel.app)",
        Accept: "text/html",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        // Skip YouTube's EU/KR consent interstitial which serves a placeholder
        // page that contains unrelated UC IDs and breaks regex extraction.
        Cookie: "CONSENT=YES+cb; SOCS=CAI",
      },
    })
  } catch {
    return null
  }
  if (!res.ok) return null

  const html = await res.text()
  const candidates: string[] = []
  for (const p of PATTERNS) {
    const match = html.match(p)
    if (match && !candidates.includes(match[1])) candidates.push(match[1])
  }
  if (!candidates.length) return null

  // Verify against RSS so we don't return a UC that 404s downstream.
  for (const c of candidates) {
    if (await rssOk(c)) return c
  }
  // All candidates failed RSS — return the highest-priority one anyway
  // so the caller can surface a clearer error.
  return candidates[0]
}
