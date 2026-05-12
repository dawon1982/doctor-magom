import "server-only"
import { createClient } from "@supabase/supabase-js"

/**
 * Service-role client. Bypasses RLS — use only inside server actions /
 * route handlers / Cron / webhooks that absolutely need it (admin invites,
 * seed-style writes, internal background jobs). Never expose to clients.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
