import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"

const ClickSchema = z.object({
  doctorId: z.string().uuid(),
  kind: z.enum(["kakao", "website", "phone", "naver"]),
})

/**
 * Fire-and-forget outbound-click logger. Called via navigator.sendBeacon
 * from <OutboundLink> when a patient clicks a doctor's external CTA
 * (Kakao booking / hospital homepage). Always 204 — we never want a
 * tracking failure to surface to the user.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ClickSchema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse(null, { status: 204 })
    }
    const admin = createAdminClient()
    await admin.from("doctor_outbound_clicks").insert({
      doctor_id: parsed.data.doctorId,
      kind: parsed.data.kind,
    })
  } catch {
    // swallow — best effort
  }
  return new NextResponse(null, { status: 204 })
}
