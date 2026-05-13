import "server-only"
import { XMLParser } from "fast-xml-parser"

export type VideoEntry = {
  url: string
  title: string
  date?: string
}

const FEED_BASE = "https://www.youtube.com/feeds/videos.xml?channel_id="

/**
 * Fetch the YouTube channel RSS feed (latest ~15 entries) and return up to
 * `limit` items. Throws on network / parse failures so the caller can
 * surface a friendly error.
 */
export async function fetchLatestVideos(
  channelId: string,
  limit = 5,
): Promise<VideoEntry[]> {
  const res = await fetch(`${FEED_BASE}${channelId}`, {
    signal: AbortSignal.timeout(10_000),
    headers: { "User-Agent": "DoctorMagomBot/1.0" },
  })
  if (!res.ok) throw new Error(`RSS HTTP ${res.status}`)
  const xml = await res.text()

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  })
  const parsed = parser.parse(xml) as {
    feed?: {
      entry?: RssEntry | RssEntry[]
    }
  }
  const raw = parsed?.feed?.entry
  if (!raw) return []
  const items = Array.isArray(raw) ? raw : [raw]

  return items.slice(0, limit).map((e): VideoEntry => {
    const href = Array.isArray(e.link)
      ? e.link.find((l) => l["@_rel"] === "alternate")?.["@_href"]
      : e.link?.["@_href"]
    const videoId =
      typeof e["yt:videoId"] === "string" ? e["yt:videoId"] : undefined
    const url = href ?? (videoId ? `https://www.youtube.com/watch?v=${videoId}` : "")
    const title =
      typeof e.title === "string"
        ? e.title
        : (e.title as { "#text": string } | undefined)?.["#text"] ?? ""
    return {
      url,
      title,
      ...(e.published ? { date: e.published.slice(0, 10) } : {}),
    }
  })
}

type RssEntry = {
  "yt:videoId"?: string
  title?: string | { "#text": string }
  published?: string
  link?:
    | { "@_rel"?: string; "@_href"?: string }
    | { "@_rel"?: string; "@_href"?: string }[]
}
