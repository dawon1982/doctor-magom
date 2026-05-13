"use server"

import { revalidatePath } from "next/cache"
import { requireDoctorAccess } from "@/lib/auth/dal"
import { createAdminClient } from "@/lib/supabase/admin"
import { invalidateAllDoctors } from "@/lib/data/doctors-db"

const BUCKET = "doctor-photos"
const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"])

export type PhotoUploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

/**
 * Accept a multipart form upload (field name "photo") and write it to
 * `doctor-photos/<doctorId>/<timestamp>.<ext>`. Stores the resulting public
 * URL on the doctor row. Deletes the previous photo file if any.
 *
 * Uses the service-role admin client so we don't have to wire the user-
 * scoped session into a `multipart/form-data` action — RLS is enforced
 * inside `requireDoctorAccess` instead.
 */
export async function uploadDoctorPhoto(
  doctorId: string,
  formData: FormData,
): Promise<PhotoUploadResult> {
  await requireDoctorAccess(doctorId)

  const file = formData.get("photo")
  if (!(file instanceof File)) {
    return { ok: false, error: "사진 파일을 첨부해주세요." }
  }
  if (file.size === 0) {
    return { ok: false, error: "빈 파일이에요." }
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: `사진은 5MB 이하만 가능해요 (현재 ${(file.size / 1024 / 1024).toFixed(1)}MB).`,
    }
  }
  if (!ALLOWED.has(file.type)) {
    return {
      ok: false,
      error: "JPG, PNG, WebP 형식만 지원해요.",
    }
  }

  const admin = createAdminClient()

  // Look up the current photo_url so we can delete the previous file.
  const { data: doctor } = await admin
    .from("doctors")
    .select("photo_url, slug")
    .eq("id", doctorId)
    .single()

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg"
  const objectKey = `${doctorId}/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()
  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(objectKey, bytes, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    })
  if (upErr) {
    return { ok: false, error: `업로드 실패: ${upErr.message}` }
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(objectKey)
  const publicUrl = pub.publicUrl

  // Persist to the doctor row
  const { error: updErr } = await admin
    .from("doctors")
    .update({ photo_url: publicUrl })
    .eq("id", doctorId)
  if (updErr) {
    // Best effort cleanup
    await admin.storage.from(BUCKET).remove([objectKey])
    return { ok: false, error: `프로필 저장 실패: ${updErr.message}` }
  }

  // Remove the previous file (best-effort) so the bucket doesn't pile up
  if (doctor?.photo_url) {
    const prevKey = extractObjectKey(doctor.photo_url, BUCKET)
    if (prevKey) {
      await admin.storage.from(BUCKET).remove([prevKey]).catch(() => null)
    }
  }

  invalidateAllDoctors()
  if (doctor?.slug) revalidatePath(`/doctors/${doctor.slug}`)
  revalidatePath("/doctor/profile")
  return { ok: true, url: publicUrl }
}

export async function removeDoctorPhoto(
  doctorId: string,
): Promise<PhotoUploadResult | { ok: true }> {
  await requireDoctorAccess(doctorId)

  const admin = createAdminClient()
  const { data: doctor } = await admin
    .from("doctors")
    .select("photo_url, slug")
    .eq("id", doctorId)
    .single()

  if (doctor?.photo_url) {
    const key = extractObjectKey(doctor.photo_url, BUCKET)
    if (key) await admin.storage.from(BUCKET).remove([key]).catch(() => null)
  }

  await admin.from("doctors").update({ photo_url: null }).eq("id", doctorId)
  invalidateAllDoctors()
  if (doctor?.slug) revalidatePath(`/doctors/${doctor.slug}`)
  revalidatePath("/doctor/profile")
  return { ok: true }
}

/**
 * Pull the object key out of a Supabase Storage public URL.
 * Format: `<base>/storage/v1/object/public/<bucket>/<key>`
 */
function extractObjectKey(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}
