"use server"

import { createClient } from "@/lib/supabase/server"
import { requireDoctorAccess } from "@/lib/auth/dal"
import { fillDoctorFromUrl, type FillResult } from "@/lib/ai/doctor-fill"

/**
 * Admin-triggered AI fill. Reads the current doctor row to get the hospital
 * name (we don't trust the form's hospital field — it might be unsaved),
 * fetches the user-provided URL, asks Claude to extract fields, returns
 * the proposed values to the client.
 *
 * Does NOT save anything — the admin reviews and saves manually.
 */
export async function fillDoctorAi(
  doctorId: string,
  url: string,
): Promise<FillResult> {
  await requireDoctorAccess(doctorId)

  if (!url || !url.trim()) {
    return { ok: false, error: "URL을 입력해주세요." }
  }

  const supabase = await createClient()
  const { data: doctor, error } = await supabase
    .from("doctors")
    .select("hospital")
    .eq("id", doctorId)
    .single()
  if (error || !doctor) {
    return { ok: false, error: "의사 row를 찾을 수 없어요." }
  }

  return await fillDoctorFromUrl({
    url: url.trim(),
    hospital: doctor.hospital,
  })
}
