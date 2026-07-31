import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Keep the Supabase free-tier project from auto-pausing (7 days of no
 * activity → DNS goes away → every DB call fails). A daily Vercel Cron hits
 * this route and runs a trivial query, which registers as activity.
 *
 * Vercel automatically attaches `Authorization: Bearer <CRON_SECRET>` to
 * cron requests when the CRON_SECRET env var is set. We enforce it only when
 * the secret exists, so the route also works before the env var is added.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  // Fail closed: without the secret this route was an open, unauthenticated
  // handle on the database that also leaked the doctor count.
  if (!secret) {
    console.error("[cron/keepalive] CRON_SECRET is not set — refusing to run.")
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const admin = createAdminClient()
    // Cheapest possible "I'm alive" query — count rows, fetch nothing.
    const { count, error } = await admin
      .from("doctors")
      .select("id", { count: "exact", head: true })
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      )
    }
    return NextResponse.json({ ok: true, doctors: count ?? 0 })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 },
    )
  }
}
