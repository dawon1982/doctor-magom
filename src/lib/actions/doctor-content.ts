"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireDoctorAccess } from "@/lib/auth/dal"
import { createAdminClient } from "@/lib/supabase/admin"
import { invalidateAllDoctors } from "@/lib/data/doctors-db"

export type ContentMutationResult =
  | { ok: true }
  | { ok: false; error: string }

const VideoSchema = z.object({
  url: z.string().url("올바른 URL이 아니에요").max(500),
  title: z.string().min(1, "제목을 입력해주세요").max(200),
  date: z
    .string()
    .max(20)
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
})

const ArticleSchema = z.object({
  url: z.string().url("올바른 URL이 아니에요").max(500),
  title: z.string().min(1, "제목을 입력해주세요").max(200),
  date: z
    .string()
    .max(20)
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  platform: z.enum(["naver", "other"]).default("other"),
})

function revalidateDoctor(slug: string | null | undefined) {
  invalidateAllDoctors()
  revalidatePath("/doctor/profile")
  revalidatePath("/videos")
  revalidatePath("/articles")
  if (slug) revalidatePath(`/doctors/${slug}`)
}

async function getDoctorSlug(doctorId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("doctors")
    .select("slug")
    .eq("id", doctorId)
    .single()
  return (data?.slug as string | null) ?? null
}

export async function addDoctorVideo(
  doctorId: string,
  input: { url: string; title: string; date?: string | null },
): Promise<ContentMutationResult> {
  await requireDoctorAccess(doctorId)
  const parsed = VideoSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" }
  }
  const admin = createAdminClient()
  const { data: rows } = await admin
    .from("doctor_videos")
    .select("sort_order")
    .eq("doctor_id", doctorId)
  const nextOrder =
    ((rows as { sort_order: number }[] | null) ?? []).reduce(
      (m, r) => Math.max(m, r.sort_order ?? 0),
      -1,
    ) + 1
  const { error } = await admin.from("doctor_videos").insert({
    doctor_id: doctorId,
    url: parsed.data.url,
    title: parsed.data.title,
    date: parsed.data.date,
    sort_order: nextOrder,
  })
  if (error) {
    // (doctor_id, url) unique → friendly message
    if (error.code === "23505") return { ok: false, error: "이미 등록된 영상이에요." }
    return { ok: false, error: error.message }
  }
  revalidateDoctor(await getDoctorSlug(doctorId))
  return { ok: true }
}

export async function removeDoctorVideo(
  doctorId: string,
  videoId: string,
): Promise<ContentMutationResult> {
  await requireDoctorAccess(doctorId)
  const admin = createAdminClient()
  const { error } = await admin
    .from("doctor_videos")
    .delete()
    .eq("id", videoId)
    .eq("doctor_id", doctorId) // belt-and-suspenders: ensure ownership
  if (error) return { ok: false, error: error.message }
  revalidateDoctor(await getDoctorSlug(doctorId))
  return { ok: true }
}

export async function addDoctorArticle(
  doctorId: string,
  input: {
    url: string
    title: string
    date?: string | null
    platform?: "naver" | "other"
  },
): Promise<ContentMutationResult> {
  await requireDoctorAccess(doctorId)
  const parsed = ArticleSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" }
  }
  const admin = createAdminClient()
  const { data: rows } = await admin
    .from("doctor_articles")
    .select("sort_order")
    .eq("doctor_id", doctorId)
  const nextOrder =
    ((rows as { sort_order: number }[] | null) ?? []).reduce(
      (m, r) => Math.max(m, r.sort_order ?? 0),
      -1,
    ) + 1
  const { error } = await admin.from("doctor_articles").insert({
    doctor_id: doctorId,
    url: parsed.data.url,
    title: parsed.data.title,
    date: parsed.data.date,
    platform: parsed.data.platform,
    sort_order: nextOrder,
  })
  if (error) {
    if (error.code === "23505") return { ok: false, error: "이미 등록된 기고글이에요." }
    return { ok: false, error: error.message }
  }
  revalidateDoctor(await getDoctorSlug(doctorId))
  return { ok: true }
}

export async function removeDoctorArticle(
  doctorId: string,
  articleId: string,
): Promise<ContentMutationResult> {
  await requireDoctorAccess(doctorId)
  const admin = createAdminClient()
  const { error } = await admin
    .from("doctor_articles")
    .delete()
    .eq("id", articleId)
    .eq("doctor_id", doctorId)
  if (error) return { ok: false, error: error.message }
  revalidateDoctor(await getDoctorSlug(doctorId))
  return { ok: true }
}
