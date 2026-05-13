import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DoctorForm, { type DoctorFormValues } from "@/components/admin/DoctorForm"
import DoctorContentManager, {
  type ContentVideo,
  type ContentArticle,
} from "@/components/admin/DoctorContentManager"
import { updateDoctor } from "@/app/admin/actions"


export default async function EditDoctorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", id)
    .single()
  if (error || !data) notFound()

  const { data: videoRows } = await supabase
    .from("doctor_videos")
    .select("id, url, title, date, sort_order")
    .eq("doctor_id", id)
    .order("sort_order", { ascending: true })
  const { data: articleRows } = await supabase
    .from("doctor_articles")
    .select("id, url, title, date, platform, sort_order")
    .eq("doctor_id", id)
    .order("sort_order", { ascending: true })

  const videos: ContentVideo[] = (videoRows ?? []).map((v) => ({
    id: v.id as string,
    url: v.url as string,
    title: v.title as string,
    date: (v.date as string | null) ?? null,
  }))
  const articles: ContentArticle[] = (articleRows ?? []).map((a) => ({
    id: a.id as string,
    url: a.url as string,
    title: a.title as string,
    date: (a.date as string | null) ?? null,
    platform: ((a.platform as string) === "naver" ? "naver" : "other") as
      | "naver"
      | "other",
  }))

  const initial: DoctorFormValues = {
    slug: data.slug,
    name: data.name,
    hospital: data.hospital,
    location: data.location,
    district: data.district,
    region: data.region,
    specialties: data.specialties ?? [],
    keywords: data.keywords ?? [],
    targetPatients: data.target_patients ?? [],
    treatments: data.treatments ?? [],
    bio: data.bio ?? "",
    hours: (data.hours as DoctorFormValues["hours"]) ?? [],
    lunchBreak: data.lunch_break,
    closedDays: data.closed_days,
    reviewKeywords: (data.review_keywords as DoctorFormValues["reviewKeywords"]) ?? [],
    kakaoUrl: data.kakao_url,
    websiteUrl: data.website_url,
    youtubeChannelUrl: data.youtube_channel_url,
    photoPlaceholderColor: data.photo_placeholder_color,
    isPublished: data.is_published,
  }

  const boundAction = updateDoctor.bind(null, id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <p className="text-sm text-muted-foreground">{data.hospital}</p>
        </div>
        <Link
          href="/admin/doctors"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 목록
        </Link>
      </div>
      <DoctorForm
        initial={initial}
        action={boundAction}
        submitLabel="저장"
        doctorId={id}
      />
      <DoctorContentManager
        doctorId={id}
        initialVideos={videos}
        initialArticles={articles}
      />
    </div>
  )
}
