/**
 * TEMPORARY diagnostic route — DELETE AFTER DEBUGGING.
 * Reports whether server-side env vars are set and what error (if any)
 * Supabase returns when querying doctors. Hits with service-role client.
 */
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const urlSet = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const keySet = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const urlLen = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").length
  const keyLen = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").length
  // First 3 chars of the key tells us if it's eyJ (JWT) or sb_ (new format) — safe to expose
  const keyPrefix = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").slice(0, 3)

  let queryResult: unknown = null
  if (urlSet && keySet) {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("doctors")
        .select("id, slug", { count: "exact", head: false })
        .limit(3)
      queryResult = {
        ok: !error,
        rowCount: data?.length ?? 0,
        error: error?.message ?? null,
        firstSlugs: data?.map((d) => d.slug).slice(0, 3) ?? [],
      }
    } catch (err) {
      queryResult = { ok: false, threw: (err as Error).message }
    }
  }

  return NextResponse.json({
    env: { urlSet, keySet, urlLen, keyLen, keyPrefix },
    query: queryResult,
  })
}
