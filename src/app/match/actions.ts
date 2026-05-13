"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { MatchInputSchema } from "@/lib/validation/match"
import { runMatch, type MatchedDoctor } from "@/lib/ai/match"

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
    })
  } catch {
    // swallow — telemetry failure shouldn't break user-facing flow.
  }

  if (!result.ok) return result
  return {
    ok: true,
    picks: result.picks.map(serialize),
    ...(result.caveat ? { caveat: result.caveat } : {}),
  }
}
