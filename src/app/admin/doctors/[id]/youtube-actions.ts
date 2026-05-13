"use server"

import { revalidatePath } from "next/cache"
import { requireDoctorAccess } from "@/lib/auth/dal"
import { createAdminClient } from "@/lib/supabase/admin"
import { resolveChannelId } from "@/lib/youtube/channel-id"
import { fetchLatestVideos } from "@/lib/youtube/fetch-videos"
import { invalidateAllDoctors } from "@/lib/data/doctors-db"

export type YoutubeFetchResult =
  | { ok: true; added: number; skipped: number }
  | { ok: false; error: string }

/**
 * Admin-triggered: resolve a YouTube channel URL to its UC ID, fetch the
 * latest 5 videos via RSS, and insert them into `doctor_videos`. Skips URLs
 * already present for this doctor. Persists the channel URL on the doctor
 * row so the admin doesn't re-enter it next time.
 */
export async function fetchYoutubeVideos(
  doctorId: string,
  channelUrl: string,
): Promise<YoutubeFetchResult> {
  await requireDoctorAccess(doctorId)

  if (!channelUrl?.trim()) {
    return { ok: false, error: "유튜브 채널 URL을 입력해주세요." }
  }

  const channelId = await resolveChannelId(channelUrl)
  if (!channelId) {
    return {
      ok: false,
      error: "채널 ID를 찾을 수 없어요. URL 형식 확인해주세요.",
    }
  }

  let videos
  try {
    videos = await fetchLatestVideos(channelId, 5)
  } catch (err) {
    return {
      ok: false,
      error: `RSS 가져오기 실패: ${(err as Error).message}`,
    }
  }
  if (!videos.length) {
    return { ok: false, error: "이 채널엔 공개 영상이 없어요." }
  }

  const admin = createAdminClient()

  // Determine next sort_order and skip URLs already present.
  const { data: existing } = await admin
    .from("doctor_videos")
    .select("url, sort_order")
    .eq("doctor_id", doctorId)
  const rows = (existing as { url: string; sort_order: number }[] | null) ?? []
  const existingUrls = new Set(rows.map((v) => v.url))
  const startOrder = rows.reduce((m, v) => Math.max(m, v.sort_order), -1) + 1

  const toInsert = videos
    .filter((v) => v.url && !existingUrls.has(v.url))
    .map((v, i) => ({
      doctor_id: doctorId,
      url: v.url,
      title: v.title,
      date: v.date ?? null,
      sort_order: startOrder + i,
    }))

  if (toInsert.length) {
    const { error } = await admin.from("doctor_videos").insert(toInsert)
    if (error) {
      return { ok: false, error: `DB insert 실패: ${error.message}` }
    }
  }

  // Persist channel URL so admin doesn't re-type it
  await admin
    .from("doctors")
    .update({ youtube_channel_url: channelUrl.trim() })
    .eq("id", doctorId)

  invalidateAllDoctors()
  revalidatePath(`/admin/doctors/${doctorId}`)
  revalidatePath("/videos")

  return {
    ok: true,
    added: toInsert.length,
    skipped: videos.length - toInsert.length,
  }
}
