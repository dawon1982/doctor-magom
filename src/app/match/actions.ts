"use server"

import { createHash } from "node:crypto"
import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { MatchInputSchema } from "@/lib/validation/match"
import { runMatch, type MatchedDoctor } from "@/lib/ai/match"

// AI match is an unauthenticated, paid (Vercel AI Gateway) call. Cap spend:
//   - per visitor (hashed IP): a handful of tries per minute
//   - globally: a hard ceiling so a botnet rotating IPs still can't run up
//     the bill faster than this.
const PER_IP_PER_MIN = 6
const GLOBAL_PER_MIN = 40
// Salt the IP hash so the stored value isn't a plain reversible IP table.
// Not a secret-grade salt — just enough that the column isn't a raw IP log.
const IP_SALT = process.env.MATCH_IP_SALT ?? "magom-match-v1"

async function getClientIp(): Promise<string> {
  const h = await headers()
  // Vercel sets x-forwarded-for (client first). x-real-ip as fallback.
  const fwd = h.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0]!.trim()
  return h.get("x-real-ip") ?? "unknown"
}

function hashIp(ip: string): string {
  return createHash("sha256").update(`${IP_SALT}:${ip}`).digest("hex")
}

/**
 * Returns { ok: true, ipHash } when the caller is under both limits, or
 * { ok: false, error } when they should be throttled. Fails OPEN (allows the
 * request) if the rate-limit query itself errors — e.g. migration 011 not yet
 * applied — so we never hard-break the feature on a schema mismatch.
 */
async function checkRateLimit(): Promise<
  { ok: true; ipHash: string } | { ok: false; error: string }
> {
  const ipHash = hashIp(await getClientIp())
  try {
    const admin = createAdminClient()
    const since = new Date(Date.now() - 60_000).toISOString()

    const [{ count: ipCount }, { count: globalCount }] = await Promise.all([
      admin
        .from("match_queries")
        .select("ip_hash", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", since),
      admin
        .from("match_queries")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
    ])

    if ((ipCount ?? 0) >= PER_IP_PER_MIN) {
      return {
        ok: false,
        error: "잠시 후 다시 시도해주세요. (1분에 몇 번까지만 추천을 받을 수 있어요)",
      }
    }
    if ((globalCount ?? 0) >= GLOBAL_PER_MIN) {
      return {
        ok: false,
        error: "지금 추천 요청이 많아요. 잠시 후 다시 시도해주세요.",
      }
    }
    return { ok: true, ipHash }
  } catch {
    // ip_hash column missing or DB hiccup — fail open, still return the hash
    // so telemetry can attempt to store it (best-effort).
    return { ok: true, ipHash }
  }
}

export type MatchActionResult =
  | {
      ok: true
      picks: SerializedPick[]
      caveat?: string
    }
  | { ok: false; error: string }

export type SerializedPick = {
  slug: string
  reason: string
  name: string
  hospital: string
  region: string
  district: string
  specialties: string[]
  keywords: string[]
  photoPlaceholderColor: string
}

function serialize(p: MatchedDoctor): SerializedPick {
  return {
    slug: p.slug,
    reason: p.reason,
    name: p.doctor.name,
    hospital: p.doctor.hospital,
    region: p.doctor.region,
    district: p.doctor.district,
    specialties: p.doctor.specialties.slice(0, 5),
    keywords: p.doctor.keywords.slice(0, 4),
    photoPlaceholderColor: p.doctor.photoPlaceholderColor,
  }
}

export async function matchDoctorsAction(input: unknown): Promise<MatchActionResult> {
  const parsed = MatchInputSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: first?.message ?? "입력값이 올바르지 않아요." }
  }

  // Throttle BEFORE the paid AI call.
  const limit = await checkRateLimit()
  if (!limit.ok) return { ok: false, error: limit.error }
  const ipHash = limit.ipHash

  const result = await runMatch(parsed.data)

  // Telemetry — best-effort insert, never blocks the response.
  try {
    const admin = createAdminClient()
    await admin.from("match_queries").insert({
      query: parsed.data.query,
      region: parsed.data.region,
      target_patient: parsed.data.targetPatient,
      recommended_slugs: result.ok ? result.picks.map((p) => p.slug) : [],
      input_tokens: result.ok ? result.usage.input : null,
      output_tokens: result.ok ? result.usage.output : null,
      cached_read_tokens: result.ok ? result.usage.cachedRead : null,
      error: result.ok ? null : result.error,
      ip_hash: ipHash,
    })
  } catch {
    // swallow — telemetry failure shouldn't break user-facing flow.
    // (Also fires when ip_hash column doesn't exist yet — retry without it.)
    try {
      const admin = createAdminClient()
      await admin.from("match_queries").insert({
        query: parsed.data.query,
        region: parsed.data.region,
        target_patient: parsed.data.targetPatient,
        recommended_slugs: result.ok ? result.picks.map((p) => p.slug) : [],
        input_tokens: result.ok ? result.usage.input : null,
        output_tokens: result.ok ? result.usage.output : null,
        cached_read_tokens: result.ok ? result.usage.cachedRead : null,
        error: result.ok ? null : result.error,
      })
    } catch {
      // give up silently
    }
  }

  if (!result.ok) return result
  return {
    ok: true,
    picks: result.picks.map(serialize),
    ...(result.caveat ? { caveat: result.caveat } : {}),
  }
}
