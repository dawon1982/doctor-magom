import "server-only"

const UC_RE = /^UC[A-Za-z0-9_-]{22}$/
const CHANNEL_PATH_RE = /youtube\.com\/channel\/(UC[A-Za-z0-9_-]{22})/i

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
 *
 * The handle / c / user forms require an HTTP fetch to extract the UC ID from
 * the page HTML. We try multiple regex patterns to be robust to YouTube's
 * HTML changes.
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
      },
    })
  } catch {
    return null
  }
  if (!res.ok) return null

  const html = await res.text()
  // Patterns in priority order. `channelId` JSON appears for every UC ID
  // present on the page (recommendations, comments, links), so it's the
  // LEAST reliable — use it only as a last resort. Canonical link points
  // unambiguously at the page's own channel.
  const patterns = [
    /<link\s+rel="canonical"\s+href="https?:\/\/[^"]*\/channel\/(UC[A-Za-z0-9_-]{22})"/i,
    /<meta\s+property="og:url"\s+content="https?:\/\/[^"]*\/channel\/(UC[A-Za-z0-9_-]{22})"/i,
    /<meta\s+itemprop="(?:channelId|identifier)"\s+content="(UC[A-Za-z0-9_-]{22})"/i,
    /"externalChannelId":"(UC[A-Za-z0-9_-]{22})"/,
    /"webCommandMetadata"[^}]*"url":"\/channel\/(UC[A-Za-z0-9_-]{22})"/,
    /"channelId":"(UC[A-Za-z0-9_-]{22})"/,
  ]
  for (const p of patterns) {
    const match = html.match(p)
    if (match) return match[1]
  }
  return null
}
