"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/dal"

export type FavoriteResult =
  | { ok: true; favorited: boolean }
  | { ok: false; error: string }

/**
 * Toggle favorite status for the current user on a doctor row.
 * Anonymous users get a friendly error — the UI is responsible for
 * gating the button before this is reached.
 */
export async function toggleFavorite(doctorId: string): Promise<FavoriteResult> {
  const user = await getSessionUser()
  if (!user) {
    return { ok: false, error: "로그인이 필요해요." }
  }

  const supabase = await createClient()
  // Check current state via the user-scoped client (RLS enforced).
  const { data: existing, error: selErr } = await supabase
    .from("favorites")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("doctor_id", doctorId)
    .maybeSingle()
  if (selErr) return { ok: false, error: selErr.message }

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("doctor_id", doctorId)
    if (error) return { ok: false, error: error.message }
    revalidatePath("/favorites")
    return { ok: true, favorited: false }
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, doctor_id: doctorId })
  if (error) return { ok: false, error: error.message }
  revalidatePath("/favorites")
  return { ok: true, favorited: true }
}

/** Server-side read: list of doctor IDs that the current user has favorited. */
export async function getMyFavoriteDoctorIds(): Promise<Set<string>> {
  const user = await getSessionUser()
  if (!user) return new Set()
  const supabase = await createClient()
  const { data } = await supabase
    .from("favorites")
    .select("doctor_id")
    .eq("user_id", user.id)
  return new Set((data ?? []).map((r) => r.doctor_id as string))
}
