import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Role } from "@/lib/supabase/types"

export type SessionUser = {
  id: string
  email: string | null
  role: Role
  displayName: string | null
  doctorId: string | null
}

/**
 * Cached per-request session lookup. Always call from Server Components or
 * Server Actions. Returns null when not signed in.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  // Phase 2 ships with Supabase optional — public pages still render before
  // the env vars land. Return "no session" instead of crashing the header.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, display_name, doctor_id")
      .eq("id", user.id)
      .single()

    return {
      id: user.id,
      email: user.email ?? null,
      role: (profile?.role ?? "patient") as Role,
      displayName: profile?.display_name ?? null,
      doctorId: profile?.doctor_id ?? null,
    }
  } catch (err) {
    console.error("[dal.getSessionUser] falling back to anon:", err)
    return null
  }
})

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  return user
}

export async function requireRole(role: Role | Role[]): Promise<SessionUser> {
  const user = await requireUser()
  const allowed = Array.isArray(role) ? role : [role]
  if (!allowed.includes(user.role)) {
    // Don't leak existence of admin routes — just send home.
    redirect("/")
  }
  return user
}
