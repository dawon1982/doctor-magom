"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { DoctorAdminSchema } from "@/lib/validation/auth"
import { invalidateAllDoctors, invalidateDoctor } from "@/lib/data/doctors-db"
import { sendEmail } from "@/lib/email/resend"

function parseDoctorForm(formData: FormData) {
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

  return DoctorAdminSchema.safeParse({
    slug: formData.get("slug"),
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
    photoPlaceholderColor: formData.get("photoPlaceholderColor") || "#D4895A",
    isPublished: formData.get("isPublished") === "on",
  })
}

function toDbRow(parsed: z.infer<typeof DoctorAdminSchema>) {
  return {
    slug: parsed.slug,
    name: parsed.name,
    hospital: parsed.hospital,
    location: parsed.location,
    district: parsed.district,
    region: parsed.region,
    specialties: parsed.specialties,
    keywords: parsed.keywords,
    target_patients: parsed.targetPatients,
    treatments: parsed.treatments,
    bio: parsed.bio,
    hours: parsed.hours,
    lunch_break: parsed.lunchBreak ?? null,
    closed_days: parsed.closedDays ?? null,
    review_keywords: parsed.reviewKeywords,
    kakao_url: parsed.kakaoUrl ?? null,
    website_url: parsed.websiteUrl ?? null,
    photo_placeholder_color: parsed.photoPlaceholderColor,
    is_published: parsed.isPublished ?? true,
  }
}

export async function createDoctor(_prev: { error?: string }, formData: FormData) {
  const parsed = parseDoctorForm(formData)
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .insert(toDbRow(parsed.data))
    .select("id, slug")
    .single()
  if (error) return { error: error.message }

  invalidateDoctor(data.slug)
  invalidateAllDoctors()
  revalidatePath("/admin/doctors")
  redirect(`/admin/doctors/${data.id}`)
}

export async function updateDoctor(
  id: string,
  _prev: { error?: string },
  formData: FormData,
) {
  const parsed = parseDoctorForm(formData)
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .update(toDbRow(parsed.data))
    .eq("id", id)
    .select("slug")
    .single()
  if (error) return { error: error.message }

  invalidateDoctor(data.slug)
  invalidateAllDoctors()
  revalidatePath("/admin/doctors")
  revalidatePath(`/admin/doctors/${id}`)
  return { ok: true }
}

export async function togglePublished(formData: FormData) {
  const id = String(formData.get("id"))
  const next = formData.get("next") === "true"

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .update({ is_published: next })
    .eq("id", id)
    .select("slug")
    .single()
  if (error) return
  invalidateDoctor(data.slug)
  invalidateAllDoctors()
  revalidatePath("/admin/doctors")
}

export async function approveApplication(formData: FormData) {
  const id = String(formData.get("id"))

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: app, error: fetchErr } = await supabase
    .from("doctor_applications")
    .select("applicant_email, applicant_name")
    .eq("id", id)
    .single()
  if (fetchErr || !app) return

  // Send invite via service-role
  const admin = createAdminClient()
  const h = await headers()
  const proto = h.get("x-forwarded-proto") ?? "https"
  const host = h.get("host") ?? "doctor-magom.vercel.app"
  const redirectTo = `${proto}://${host}/auth/callback?next=/doctor/profile`

  const { data: invited } = await admin.auth.admin.inviteUserByEmail(
    app.applicant_email,
    { redirectTo },
  )

  await supabase
    .from("doctor_applications")
    .update({
      status: "approved",
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)

  await sendEmail({
    template: "applicationApproved",
    to: app.applicant_email,
    data: { name: app.applicant_name, inviteUrl: redirectTo },
    relatedId: id,
  })
  void invited

  revalidatePath("/admin/applications")
}

export async function rejectApplication(formData: FormData) {
  const id = String(formData.get("id"))
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await supabase
    .from("doctor_applications")
    .update({
      status: "rejected",
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
  revalidatePath("/admin/applications")
}

export async function linkDoctorToProfile(formData: FormData) {
  // Helper used after a doctor accepts their invite — admin sets profile.doctor_id.
  const profileId = String(formData.get("profileId"))
  const doctorId = String(formData.get("doctorId"))

  const supabase = await createClient()
  await supabase
    .from("profiles")
    .update({ role: "doctor", doctor_id: doctorId })
    .eq("id", profileId)

  revalidatePath("/admin/doctors")
}
