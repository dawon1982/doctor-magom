// TEMPORARY — remove after confirming migration state.
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const admin = createAdminClient()
  const out: Record<string, unknown> = {}

  const m009 = await admin.from("doctors").select("photo_url").limit(1)
  out["009_photo_url"] = m009.error ? `MISSING: ${m009.error.message}` : "OK"

  const m010 = await admin.from("doctor_articles").select("thumbnail_url").limit(1)
  out["010_thumbnail_url"] = m010.error ? `MISSING: ${m010.error.message}` : "OK"

  const m011 = await admin.from("match_queries").select("ip_hash").limit(1)
  out["011_ip_hash"] = m011.error ? `MISSING: ${m011.error.message}` : "OK"

  const m012 = await admin
    .from("doctor_outbound_clicks")
    .select("id", { count: "exact", head: true })
  out["012_outbound_clicks"] = m012.error
    ? `MISSING: ${m012.error.message}`
    : `OK (rows=${m012.count ?? 0})`

  return NextResponse.json(out)
}
