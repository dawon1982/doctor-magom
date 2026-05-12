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
    .select("applicant_email, applicant_name, hospital")
    .eq("id", id)
    .single()
  if (fetchErr || !app) return

  const admin = createAdminClient()

  // 1) Create a placeholder doctor row (admin / AI fills the rest later).
  //    Random slug avoids unique-constraint collisions; admin can rename in
  //    /admin/doctors/[id] before is_published is flipped on.
  const randomSlug = `dr-${Math.random().toString(36).slice(2, 8)}`
  const { data: doctor, error: doctorErr } = await admin
    .from("doctors")
    .insert({
      slug: randomSlug,
      name: app.applicant_name,
      hospital: app.hospital,
      location: "",
      district: "",
      region: "서울",
      specialties: [],
      keywords: [],
      target_patients: [],
      treatments: [],
      bio: "",
      hours: [],
      review_keywords: [],
      photo_placeholder_color: "#D4895A",
      is_published: false,
    })
    .select("id, slug")
    .single()
  if (doctorErr) {
    console.error("[approveApplication] failed to insert doctor row:", doctorErr)
    return
  }

  // 2) Send Supabase invite to the applicant.
  const h = await headers()
  const proto = h.get("x-forwarded-proto") ?? "https"
  const host = h.get("host") ?? "doctor-magom.vercel.app"
  const redirectTo = `${proto}://${host}/auth/callback?next=/doctor/profile`

  await admin.auth.admin.inviteUserByEmail(app.applicant_email, { redirectTo })

  // 3) Mark the application approved + remember which doctor row was created.
  await supabase
    .from("doctor_applications")
    .update({
      status: "approved",
      approved_doctor_id: doctor.id,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)

  // 4) Send the approval email (dry-run until magom.io is wired).
  await sendEmail({
    template: "applicationApproved",
    to: app.applicant_email,
    data: { name: app.applicant_name, inviteUrl: redirectTo },
    relatedId: id,
  })

  invalidateAllDoctors()
  revalidatePath("/admin/applications")
  revalidatePath("/admin/doctors")
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
  // Manual fallback — admin supplies profileId + doctorId directly.
  const profileId = String(formData.get("profileId"))
  const doctorId = String(formData.get("doctorId"))

  const supabase = await createClient()
  await supabase
    .from("profiles")
    .update({ role: "doctor", doctor_id: doctorId })
    .eq("id", profileId)

  revalidatePath("/admin/doctors")
}

/**
 * Resolve an approved application → linked profile.
 *
 * Looks up the auth.users row whose email matches the application's
 * applicant_email, then promotes that profile to role='doctor' and
 * connects it to the doctor row created at approval time.
 *
 * Silent no-op if the applicant has not signed up yet (admin can retry
 * later) or if the application has no approved_doctor_id.
 */
export async function linkApplicationToProfile(formData: FormData) {
  const appId = String(formData.get("id"))

  const supabase = await createClient()
  const { data: app } = await supabase
    .from("doctor_applications")
    .select("approved_doctor_id, applicant_email")
    .eq("id", appId)
    .single()
  if (!app?.approved_doctor_id || !app.applicant_email) return

  const admin = createAdminClient()
  // listUsers has no email filter; we have very few users in Phase 2 so
  // a single page is fine. Bump perPage when this grows.
  const { data: usersList } = await admin.auth.admin.listUsers({ perPage: 200 })
  const user = usersList?.users.find(
    (u) => u.email?.toLowerCase() === app.applicant_email.toLowerCase(),
  )
  if (!user) return

  await admin
    .from("profiles")
    .update({ role: "doctor", doctor_id: app.approved_doctor_id })
    .eq("id", user.id)

  revalidatePath("/admin/applications")
  revalidatePath("/admin/doctors")
}
