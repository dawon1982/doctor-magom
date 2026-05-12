import "server-only"
import { cacheLife, cacheTag, updateTag } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { doctors as staticDoctors } from "./doctors"

// Re-export the Phase 1 type names so consumers don't need to change.
export type { Region, Hour, ReviewKeyword } from "@/lib/supabase/types"

export type VideoContent = { url: string; title: string; date?: string }
export type ArticleContent = {
  url: string
  title: string
  date?: string
  platform: "naver" | "other"
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

function staticFallback(): Doctor[] {
  return staticDoctors.map((d) => ({
    ...d,
    videos: d.videos.map((v) => ({
      url: v.url,
      title: v.title,
      ...(v.date ? { date: v.date } : {}),
    })),
    articles: d.articles.map((a) => ({
      url: a.url,
      title: a.title,
      platform: (a.platform === "naver" ? "naver" : "other") as "naver" | "other",
      ...(a.date ? { date: a.date } : {}),
    })),
  }))
}

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
    return staticFallback()
  }
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("doctors")
    .select(
      `
      id, slug, name, hospital, location, district, region,
      specialties, keywords, target_patients, treatments, bio,
      hours, lunch_break, closed_days, review_keywords,
      kakao_url, website_url, photo_placeholder_color, is_published,
      doctor_videos ( url, title, date, sort_order ),
      doctor_articles ( url, title, date, platform, sort_order )
    `,
    )
    .eq("is_published", true)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[doctors-db] fetchAllDoctors:", error.message, "— falling back to static")
    return staticFallback()
  }
  if (!data || data.length === 0) {
    return staticFallback()
  }

  return (data as Array<Record<string, unknown>>).map((row): Doctor => {
    type RawVideo = {
      url: string
      title: string
      date?: string | null
      sort_order?: number | null
    }
    type RawArticle = RawVideo & { platform?: string | null }
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
      }))

    const lunchBreak = (row.lunch_break as string | null) ?? null
    const closedDays = (row.closed_days as string | null) ?? null
    const kakaoUrl = (row.kakao_url as string | null) ?? null
    const websiteUrl = (row.website_url as string | null) ?? null

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
      videos,
      articles,
    }
  })
}

export async function getAllDoctors(): Promise<Doctor[]> {
  return getAllDoctorsRaw()
}

export async function getAllDoctorSlugs(): Promise<string[]> {
  // Called from generateStaticParams at build time — must NOT use cookies().
  // Use the admin (service-role) client which is cookieless. The slug list
  // is public information regardless of role.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return staticDoctors.map((d) => d.slug)
  }
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("doctors")
      .select("slug")
      .eq("is_published", true)
    if (error || !data || data.length === 0) {
      return staticDoctors.map((d) => d.slug)
    }
    return data.map((d) => d.slug)
  } catch {
    return staticDoctors.map((d) => d.slug)
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
