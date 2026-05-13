"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSessionUser } from "@/lib/auth/dal"
import { invalidateAllDoctors } from "@/lib/data/doctors-db"

const ReviewInputSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z
    .string()
    .trim()
    .min(10, "후기는 최소 10자 이상 적어주세요")
    .max(2000, "후기는 2000자 이내로 적어주세요"),
})

export type ReviewMutationResult =
  | { ok: true }
  | { ok: false; error: string }

async function getDoctorSlug(doctorId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("doctors")
    .select("slug")
    .eq("id", doctorId)
    .single()
  return (data?.slug as string | null) ?? null
}

function revalidateReview(slug: string | null) {
  invalidateAllDoctors()
  if (slug) revalidatePath(`/doctors/${slug}`)
}

/** Upsert: if the user already reviewed this doctor, the existing review is updated. */
export async function submitReview(
  doctorId: string,
  input: { rating: number; body: string },
): Promise<ReviewMutationResult> {
  const user = await getSessionUser()
  if (!user) return { ok: false, error: "로그인이 필요해요." }

  const parsed = ReviewInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값 확인" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("doctor_reviews")
    .upsert(
      {
        user_id: user.id,
        doctor_id: doctorId,
        rating: parsed.data.rating,
        body: parsed.data.body,
      },
      { onConflict: "user_id,doctor_id" },
    )
  if (error) return { ok: false, error: error.message }

  revalidateReview(await getDoctorSlug(doctorId))
  return { ok: true }
}

export async function deleteReview(reviewId: string): Promise<ReviewMutationResult> {
  const user = await getSessionUser()
  if (!user) return { ok: false, error: "로그인이 필요해요." }

  const supabase = await createClient()
  // Find the doctor slug for revalidation before deleting
  const { data: row } = await supabase
    .from("doctor_reviews")
    .select("doctor_id")
    .eq("id", reviewId)
    .eq("user_id", user.id)
    .single()

  const { error } = await supabase
    .from("doctor_reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id)
  if (error) return { ok: false, error: error.message }

  if (row?.doctor_id) {
    revalidateReview(await getDoctorSlug(row.doctor_id as string))
  }
  return { ok: true }
}

/** Admin moderation: hide/unhide a review */
export async function setReviewHidden(
  reviewId: string,
  hidden: boolean,
): Promise<ReviewMutationResult> {
  const user = await getSessionUser()
  if (!user || user.role !== "admin") {
    return { ok: false, error: "권한이 없어요." }
  }
  const admin = createAdminClient()
  const { data: row, error } = await admin
    .from("doctor_reviews")
    .update({ is_hidden_by_admin: hidden })
    .eq("id", reviewId)
    .select("doctor_id")
    .single()
  if (error) return { ok: false, error: error.message }
  if (row?.doctor_id) {
    revalidateReview(await getDoctorSlug(row.doctor_id as string))
  }
  return { ok: true }
}
