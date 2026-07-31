import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkIpRateLimit } from "@/lib/security/rate-limit"

const ClickSchema = z.object({
  doctorId: z.string().uuid(),
  kind: z.enum(["kakao", "website", "phone", "naver"]),
})

// A real patient clicks a handful of outbound CTAs per session. 30/min per IP
// is far above that and still stops a script from inflating a doctor's
// conversion numbers (this table is the premium-exposure billing signal).
const PER_IP_PER_MIN = 30

/**
 * Fire-and-forget outbound-click logger. Called via navigator.sendBeacon
 * from <OutboundLink> when a patient clicks a doctor's external CTA
 * (Kakao booking / hospital homepage). Always 204 — we never want a
 * tracking failure to surface to the user.
 */
export async function POST(req: NextRequest) {
  try {
    // Over the limit: drop the row silently, still 204 (sendBeacon ignores
    // the body anyway, and we don't want to tell a flooder they were caught).
    const limit = checkIpRateLimit({
      bucket: "track-click",
      headers: req.headers,
      limit: PER_IP_PER_MIN,
      windowMs: 60_000,
    })
    if (!limit.ok) return new NextResponse(null, { status: 204 })

    const body = await req.json()
    const parsed = ClickSchema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse(null, { status: 204 })
    }
    const admin = createAdminClient()
    const { error } = await admin.from("doctor_outbound_clicks").insert({
      doctor_id: parsed.data.doctorId,
      kind: parsed.data.kind,
    })
    // Still 204 for the caller, but don't lose conversion data silently —
    // an RLS/schema break here would otherwise be invisible.
    if (error) {
      console.error("[track-click] insert failed:", error.message)
    }
  } catch {
    // swallow — best effort
  }
  return new NextResponse(null, { status: 204 })
}
