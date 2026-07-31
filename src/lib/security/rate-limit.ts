import "server-only"
import { createHash } from "node:crypto"

/**
 * IP rate limiting for unauthenticated write endpoints.
 *
 * Mirrors the hashed-IP approach already used by the AI match action
 * (`src/app/match/actions.ts`): the raw IP is never stored or logged, only a
 * salted SHA-256 of it.
 *
 * LIMITATION — this counter lives in the server process's memory, not in the
 * database, because neither `doctor_outbound_clicks` nor `doctor_applications`
 * has an IP column and adding one would mean a schema migration plus storing a
 * (hashed) visitor identifier for every click. Vercel Fluid Compute reuses
 * instances, so in practice a burst from one attacker usually lands on the same
 * instance and gets caught — but with several warm instances (or after a cold
 * start) the effective limit is `limit x instances`, and the window resets on
 * redeploy. This is a first line of defence against casual flooding, not a
 * guarantee. Move to a shared store (DB column / Upstash) if abuse is observed.
 */

// Same salt as the match rate limiter — not secret-grade, just enough that the
// value isn't a plaintext IP.
const IP_SALT = process.env.MATCH_IP_SALT ?? "magom-match-v1"

// Hard ceiling on tracked keys so a rotating-IP flood can't grow the map
// without bound. Oldest-touched keys are dropped first.
const MAX_KEYS = 10_000

export function getClientIp(headers: Headers): string {
  // Vercel sets x-forwarded-for (client first). x-real-ip as fallback.
  const fwd = headers.get("x-forwarded-for")
  if (fwd) {
    const first = fwd.split(",")[0]?.trim()
    if (first) return first
  }
  return headers.get("x-real-ip") ?? "unknown"
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(`${IP_SALT}:${ip}`).digest("hex")
}

const buckets = new Map<string, number[]>()
let lastSweep = 0

function sweep(now: number, windowMs: number) {
  // Amortized cleanup — at most once per window.
  if (now - lastSweep < windowMs) return
  lastSweep = now
  for (const [key, hits] of buckets) {
    if (!hits.length || hits[hits.length - 1]! <= now - windowMs) {
      buckets.delete(key)
    }
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number }

/**
 * Sliding-window counter. Returns `{ ok: false }` once `limit` requests have
 * already been recorded for this key inside `windowMs`.
 */
export function checkIpRateLimit(opts: {
  bucket: string
  headers: Headers
  limit: number
  windowMs: number
}): RateLimitResult {
  const now = Date.now()
  sweep(now, opts.windowMs)

  const key = `${opts.bucket}:${hashIp(getClientIp(opts.headers))}`
  const cutoff = now - opts.windowMs
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff)

  if (hits.length >= opts.limit) {
    buckets.set(key, hits)
    const oldest = hits[0]!
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((oldest + opts.windowMs - now) / 1000)),
    }
  }

  hits.push(now)
  // Re-insert so the key moves to the end of the Map's insertion order,
  // making the eviction below approximate least-recently-used.
  buckets.delete(key)
  buckets.set(key, hits)

  if (buckets.size > MAX_KEYS) {
    const oldestKey = buckets.keys().next().value
    if (oldestKey !== undefined) buckets.delete(oldestKey)
  }

  return { ok: true }
}
