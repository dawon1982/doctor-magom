import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/dal"
import DoctorForm, { type DoctorFormValues } from "@/components/admin/DoctorForm"
import { updateOwnDoctorProfile } from "./actions"

export const dynamic = "force-dynamic"

export default async function DoctorProfilePage() {
  const user = await requireRole(["doctor", "admin"])
  if (!user.doctorId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-bold mb-2">의사 프로필</h1>
        <p className="text-sm text-muted-foreground">
          아직 의사 프로필이 연결되지 않았어요. 관리자가 프로필을 연결해드릴 때까지 잠시만 기다려주세요.
        </p>
      </div>
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", user.doctorId)
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
    photoPlaceholderColor: data.photo_placeholder_color,
    isPublished: data.is_published,
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">내 프로필</h1>
      <p className="text-sm text-muted-foreground mb-8">
        환자에게 보여지는 내 정보를 직접 관리해주세요. URL slug는 운영팀만 변경할 수 있어요.
      </p>
      <DoctorForm
        initial={initial}
        action={updateOwnDoctorProfile}
        submitLabel="저장"
        slugEditable={false}
      />
    </div>
  )
}
