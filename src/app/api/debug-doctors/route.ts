// TEMPORARY diagnostic — remove after debugging the "0 doctors" issue.
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const env = {
    urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    keySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    keyPrefix: (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").slice(0, 3),
  }

  let result: unknown = null
  try {
    const admin = createAdminClient()
    // total rows (ignores is_published)
    const total = await admin
      .from("doctors")
      .select("id", { count: "exact", head: true })
    // published only
    const published = await admin
      .from("doctors")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
    // sample
    const sample = await admin
      .from("doctors")
      .select("slug, name, is_published")
      .limit(3)
    result = {
      totalCount: total.count,
      totalErr: total.error?.message ?? null,
      publishedCount: published.count,
      publishedErr: published.error?.message ?? null,
      sample: sample.data,
      sampleErr: sample.error?.message ?? null,
    }
  } catch (e) {
    result = { threw: (e as Error).message }
  }

  return NextResponse.json({ env, result })
}
