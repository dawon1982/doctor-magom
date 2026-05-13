"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { DoctorProfileSchema } from "@/lib/validation/auth"
import { requireRole } from "@/lib/auth/dal"
import { invalidateDoctor, invalidateAllDoctors } from "@/lib/data/doctors-db"

export async function updateOwnDoctorProfile(
  _prev: { error?: string; ok?: boolean },
  formData: FormData,
) {
  const user = await requireRole(["doctor", "admin"])
  if (!user.doctorId) return { error: "연결된 의사 프로필이 없어요. 관리자에게 문의해주세요." }

  const splitCsv = (v: FormDataEntryValue | null) =>
    String(v ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  const safeJson = <T>(v: FormDataEntryValue | null, fallback: T): T => {
    try {
      return v ? (JSON.parse(String(v)) as T) : fallback
    } catch {
      return fallback
    }
  }

  const parsed = DoctorProfileSchema.safeParse({
    name: formData.get("name"),
    hospital: formData.get("hospital"),
    location: formData.get("location"),
    district: formData.get("district"),
    region: formData.get("region"),
    specialties: splitCsv(formData.get("specialties")),
    keywords: splitCsv(formData.get("keywords")),
    targetPatients: splitCsv(formData.get("targetPatients")),
    treatments: splitCsv(formData.get("treatments")),
    bio: formData.get("bio") ?? "",
    hours: safeJson(formData.get("hours"), []),
    lunchBreak: formData.get("lunchBreak") || null,
    closedDays: formData.get("closedDays") || null,
    reviewKeywords: safeJson(formData.get("reviewKeywords"), []),
    kakaoUrl: formData.get("kakaoUrl") || null,
    websiteUrl: formData.get("websiteUrl") || null,
    youtubeChannelUrl: formData.get("youtubeChannelUrl") || null,
    photoPlaceholderColor: formData.get("photoPlaceholderColor") || "#D4895A",
    isPublished: formData.get("isPublished") === "on",
  })
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .update({
      name: parsed.data.name,
      hospital: parsed.data.hospital,
      location: parsed.data.location,
      district: parsed.data.district,
      region: parsed.data.region,
      specialties: parsed.data.specialties,
      keywords: parsed.data.keywords,
      target_patients: parsed.data.targetPatients,
      treatments: parsed.data.treatments,
      bio: parsed.data.bio,
      hours: parsed.data.hours,
      lunch_break: parsed.data.lunchBreak ?? null,
      closed_days: parsed.data.closedDays ?? null,
      review_keywords: parsed.data.reviewKeywords,
      kakao_url: parsed.data.kakaoUrl ?? null,
      website_url: parsed.data.websiteUrl ?? null,
      youtube_channel_url: parsed.data.youtubeChannelUrl ?? null,
      photo_placeholder_color: parsed.data.photoPlaceholderColor,
      is_published: parsed.data.isPublished ?? true,
    })
    .eq("id", user.doctorId)
    .select("slug")
    .single()

  if (error) return { error: error.message }

  invalidateDoctor(data.slug)
  invalidateAllDoctors()
  revalidatePath("/doctor/profile")
  return { ok: true }
}
