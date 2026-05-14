import "server-only"
import { cacheLife, cacheTag, updateTag } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

// Re-export the Phase 1 type names so consumers don't need to change.
export type { Region, Hour, ReviewKeyword } from "@/lib/supabase/types"

export type VideoContent = { url: string; title: string; date?: string }
export type ArticleContent = {
  url: string
  title: string
  date?: string
  platform: "naver" | "other"
  thumbnailUrl?: string
}

export type Doctor = {
  id: string
  slug: string
  name: string
  hospital: string
  location: string
  district: string
  region: "서울" | "경기" | "인천" | "기타"
  specialties: string[]
  keywords: string[]
  targetPatients: string[]
  treatments: string[]
  bio: string
  hours: { day: string; time: string }[]
  lunchBreak?: string
  closedDays?: string
  reviewKeywords: { text: string; count: number }[]
  kakaoUrl?: string
  websiteUrl?: string
  photoPlaceholderColor: string
  photoUrl?: string
  videos: VideoContent[]
  articles: ArticleContent[]
}

export type VideoListItem = {
  url: string
  title: string
  date?: string
  doctor: string
  hospital: string
  doctorSlug: string
}

export type ArticleListItem = {
  url: string
  title: string
  date?: string
  platform: "naver" | "other"
  thumbnailUrl?: string
  doctor: string
  hospital: string
  doctorSlug: string
}

// ---------------------------------------------------------------------------
// Cache tags
// ---------------------------------------------------------------------------
export const DOCTORS_TAG = "doctors"
export const VIDEOS_TAG = "videos"
export const ARTICLES_TAG = "articles"
export const doctorTag = (slug: string) => `doctor:${slug}`

// ---------------------------------------------------------------------------
// Fetchers (cached with revalidate-by-tag, not request-coupled cookies)
// ---------------------------------------------------------------------------

async function getAllDoctorsRaw(): Promise<Doctor[]> {
  "use cache"
  cacheLife("hours")
  cacheTag(DOCTORS_TAG)
  // Cookieless service-role client — `use cache` scopes forbid cookies().
  // Doctor data is public; the query filters is_published.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("[doctors-db] Supabase env missing — returning empty list")
    return []
  }
  const supabase = createAdminClient()
  const fullSelect = `
      id, slug, name, hospital, location, district, region,
      specialties, keywords, target_patients, treatments, bio,
      hours, lunch_break, closed_days, review_keywords,
      kakao_url, website_url, photo_placeholder_color, photo_url, is_published,
      doctor_videos ( url, title, date, sort_order ),
      doctor_articles ( url, title, date, platform, sort_order, thumbnail_url )
    `
  // Fallback select without recent columns — used when a pending migration
  // (009 photo_url, 010 thumbnail_url) hasn't run yet or the PostgREST
  // schema cache hasn't refreshed.
  const fallbackSelect = `
      id, slug, name, hospital, location, district, region,
      specialties, keywords, target_patients, treatments, bio,
      hours, lunch_break, closed_days, review_keywords,
      kakao_url, website_url, photo_placeholder_color, is_published,
      doctor_videos ( url, title, date, sort_order ),
      doctor_articles ( url, title, date, platform, sort_order )
    `

  // Untype the result so we can swap between full/fallback shapes if the
  // photo_url column hasn't been migrated yet.
  let data: Record<string, unknown>[] | null
  let errorMsg: string | null
  {
    const res = await supabase
      .from("doctors")
      .select(fullSelect)
      .eq("is_published", true)
      .order("created_at", { ascending: true })
    data = res.data as unknown as Record<string, unknown>[] | null
    errorMsg = res.error?.message ?? null
  }

  if (errorMsg && /photo_url|thumbnail_url|column .* does not exist/i.test(errorMsg)) {
    // Retry without the newest columns so the site keeps working until the
    // migration lands. Affects 009 (photo_url) and 010 (thumbnail_url).
    console.warn(
      "[doctors-db] recent column missing — falling back to legacy select. Run pending migrations.",
    )
    const retry = await supabase
      .from("doctors")
      .select(fallbackSelect)
      .eq("is_published", true)
      .order("created_at", { ascending: true })
    data = retry.data as unknown as Record<string, unknown>[] | null
    errorMsg = retry.error?.message ?? null
  }

  if (errorMsg) {
    console.error("[doctors-db] fetchAllDoctors failed:", errorMsg)
    return []
  }
  if (!data) return []

  return data.map((row): Doctor => {
    type RawVideo = {
      url: string
      title: string
      date?: string | null
      sort_order?: number | null
    }
    type RawArticle = RawVideo & {
      platform?: string | null
      thumbnail_url?: string | null
    }
    const rawVideos = (row.doctor_videos as RawVideo[] | null) ?? []
    const rawArticles = (row.doctor_articles as RawArticle[] | null) ?? []
    const videos = rawVideos
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((v) => ({
        url: v.url,
        title: v.title,
        ...(v.date ? { date: v.date } : {}),
      }))

    const articles = rawArticles
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((a) => ({
        url: a.url,
        title: a.title,
        platform: (a.platform === "naver" ? "naver" : "other") as
          | "naver"
          | "other",
        ...(a.date ? { date: a.date } : {}),
        ...(a.thumbnail_url ? { thumbnailUrl: a.thumbnail_url } : {}),
      }))

    const lunchBreak = (row.lunch_break as string | null) ?? null
    const closedDays = (row.closed_days as string | null) ?? null
    const kakaoUrl = (row.kakao_url as string | null) ?? null
    const websiteUrl = (row.website_url as string | null) ?? null
    const photoUrl = (row.photo_url as string | null) ?? null

    return {
      id: row.id as string,
      slug: row.slug as string,
      name: row.name as string,
      hospital: row.hospital as string,
      location: row.location as string,
      district: row.district as string,
      region: row.region as Doctor["region"],
      specialties: (row.specialties as string[] | null) ?? [],
      keywords: (row.keywords as string[] | null) ?? [],
      targetPatients: (row.target_patients as string[] | null) ?? [],
      treatments: (row.treatments as string[] | null) ?? [],
      bio: (row.bio as string | null) ?? "",
      hours: (row.hours as Doctor["hours"] | null) ?? [],
      ...(lunchBreak ? { lunchBreak } : {}),
      ...(closedDays ? { closedDays } : {}),
      reviewKeywords:
        (row.review_keywords as Doctor["reviewKeywords"] | null) ?? [],
      ...(kakaoUrl ? { kakaoUrl } : {}),
      ...(websiteUrl ? { websiteUrl } : {}),
      photoPlaceholderColor:
        (row.photo_placeholder_color as string) ?? "#D4895A",
      ...(photoUrl ? { photoUrl } : {}),
      videos,
      articles,
    }
  })
}

export async function getAllDoctors(): Promise<Doctor[]> {
  return getAllDoctorsRaw()
}

/**
 * Build-time fallback when Supabase env vars are absent (e.g. running
 * `next build` locally without `.env.local` populated). Next 16 with
 * Cache Components requires `generateStaticParams` to return ≥1 entry.
 * These are the published doctor slugs as of last reseed — they 404
 * gracefully if outdated, and the public Vercel build always uses the
 * live DB list anyway.
 */
const FALLBACK_SLUGS = [
  "topnp", "snsp", "urmindclinic", "oneulclinic1", "yschaeum",
  "sinsayeon", "ddcmind", "familywellnessclinc", "mindstay", "yschaeum2",
  "magok-mind", "oneulclinic1-2", "drkidari-2", "facetimepsy", "drkidari",
]

export async function getAllDoctorSlugs(): Promise<string[]> {
  // Called from generateStaticParams at build time — must NOT use cookies().
  // Use the admin (service-role) client which is cookieless. The slug list
  // is public information regardless of role.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return FALLBACK_SLUGS
  }
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("doctors")
      .select("slug")
      .eq("is_published", true)
    if (error) {
      console.error("[doctors-db] getAllDoctorSlugs failed:", error.message)
      return FALLBACK_SLUGS
    }
    const live = (data ?? []).map((d) => d.slug)
    return live.length > 0 ? live : FALLBACK_SLUGS
  } catch (err) {
    console.error("[doctors-db] getAllDoctorSlugs threw:", (err as Error).message)
    return FALLBACK_SLUGS
  }
}

export async function getDoctorBySlug(slug: string): Promise<Doctor | undefined> {
  const raw = (await getAllDoctorsRaw()) as Doctor[]
  return raw.find((d) => d.slug === slug)
}

export async function getAllSpecialties(): Promise<string[]> {
  const ds = (await getAllDoctorsRaw()) as Doctor[]
  return Array.from(new Set(ds.flatMap((d) => d.specialties))).sort()
}

export async function getAllRegions(): Promise<string[]> {
  const ds = (await getAllDoctorsRaw()) as Doctor[]
  return Array.from(new Set(ds.map((d) => d.region)))
}

export async function getAllVideos(): Promise<VideoListItem[]> {
  const ds = (await getAllDoctorsRaw()) as Doctor[]
  return ds.flatMap((d) =>
    d.videos.map((v) => ({
      url: v.url,
      title: v.title,
      ...(v.date ? { date: v.date } : {}),
      doctor: d.name,
      hospital: d.hospital,
      doctorSlug: d.slug,
    })),
  )
}

export async function getAllArticles(): Promise<ArticleListItem[]> {
  const ds = (await getAllDoctorsRaw()) as Doctor[]
  return ds.flatMap((d) =>
    d.articles.map((a) => ({
      url: a.url,
      title: a.title,
      platform: a.platform,
      ...(a.date ? { date: a.date } : {}),
      ...(a.thumbnailUrl ? { thumbnailUrl: a.thumbnailUrl } : {}),
      doctor: d.name,
      hospital: d.hospital,
      doctorSlug: d.slug,
    })),
  )
}

// ---------------------------------------------------------------------------
// Invalidation helpers — call from server actions after mutations.
// `updateTag` immediately expires matching cache entries so subsequent
// reads (within the same action) see fresh data — read-your-own-writes.
// ---------------------------------------------------------------------------
export function invalidateAllDoctors() {
  updateTag(DOCTORS_TAG)
  updateTag(VIDEOS_TAG)
  updateTag(ARTICLES_TAG)
}
export function invalidateDoctor(slug: string) {
  invalidateAllDoctors()
  updateTag(doctorTag(slug))
}
