import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DoctorForm, { type DoctorFormValues } from "@/components/admin/DoctorForm"
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
    </div>
  )
}
