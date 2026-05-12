import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  approveApplication,
  rejectApplication,
  linkApplicationToProfile,
} from "@/app/admin/actions"


export default async function AdminApplicationsPage() {
  const supabase = await createClient()
  const { data: apps } = await supabase
    .from("doctor_applications")
    .select("*")
    .order("created_at", { ascending: false })

  // For approved applications, figure out whether the invitee has signed up
  // and whether their profile is already linked to the doctor row.
  const admin = createAdminClient()
  const approvedDoctorIds = (apps ?? [])
    .filter((a) => a.status === "approved" && a.approved_doctor_id)
    .map((a) => a.approved_doctor_id as string)

  const { data: linkedProfiles } =
    approvedDoctorIds.length > 0
      ? await admin
          .from("profiles")
          .select("doctor_id, role, display_name")
          .in("doctor_id", approvedDoctorIds)
      : { data: [] }
  const linkedDoctorIds = new Set(
    (linkedProfiles ?? [])
      .filter((p) => p.role === "doctor")
      .map((p) => p.doctor_id),
  )

  // Email → "did they sign up?" set. Listing once is fine while user count
  // is small; switch to a per-email lookup once we cross a few hundred.
  let signedUpEmails = new Set<string>()
  if ((apps ?? []).some((a) => a.status === "approved")) {
    const { data: usersList } = await admin.auth.admin.listUsers({
      perPage: 200,
    })
    signedUpEmails = new Set(
      (usersList?.users ?? [])
        .map((u) => u.email?.toLowerCase())
        .filter((v): v is string => !!v),
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">입점 신청</h1>
      <div className="space-y-3">
        {(apps ?? []).map((a) => {
          const linked = a.approved_doctor_id
            ? linkedDoctorIds.has(a.approved_doctor_id)
            : false
          const signedUp = signedUpEmails.has(
            (a.applicant_email ?? "").toLowerCase(),
          )
          return (
            <ApplicationCard
              key={a.id}
              app={a}
              linked={linked}
              signedUp={signedUp}
            />
          )
        })}
        {!apps?.length && (
          <div className="rounded-xl border border-border bg-card px-4 py-12 text-center text-muted-foreground">
            접수된 신청이 없어요.
          </div>
        )}
      </div>
    </div>
  )
}

type ApplicationRow = {
  id: string
  applicant_name: string
  applicant_email: string
  hospital: string
  hospital_phone: string | null
  mobile_phone: string | null
  has_hospital_website: boolean
  has_personal_website: boolean
  has_blog: boolean
  has_youtube: boolean
  has_instagram: boolean
  hospital_website: string | null
  personal_website: string | null
  blog_url: string | null
  youtube_url: string | null
  instagram_url: string | null
  message: string | null
  status: string
  approved_doctor_id: string | null
  created_at: string
}

function ApplicationCard({
  app,
  linked,
  signedUp,
}: {
  app: ApplicationRow
  linked: boolean
  signedUp: boolean
}) {
  const channels = [
    { label: "병원 홈페이지", has: app.has_hospital_website, url: app.hospital_website },
    { label: "개인 홈페이지", has: app.has_personal_website, url: app.personal_website },
    { label: "블로그", has: app.has_blog, url: app.blog_url },
    { label: "유튜브", has: app.has_youtube, url: app.youtube_url },
    { label: "인스타그램", has: app.has_instagram, url: app.instagram_url },
  ]
  const presentChannels = channels.filter((c) => c.has)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">{app.applicant_name}</p>
            <StatusBadge status={app.status} />
            <span className="text-xs text-muted-foreground">
              {new Date(app.created_at).toLocaleDateString("ko-KR")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {app.applicant_email} · {app.hospital}
          </p>
          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
            {app.hospital_phone && <span>병원 {app.hospital_phone}</span>}
            {app.mobile_phone && <span>휴대폰 {app.mobile_phone}</span>}
          </div>
        </div>

        {app.status === "pending" && (
          <div className="flex gap-2 shrink-0">
            <form action={approveApplication}>
              <input type="hidden" name="id" value={app.id} />
              <button
                type="submit"
                className="rounded-md bg-green-600 text-white px-2.5 py-1 text-xs"
              >
                승인
              </button>
            </form>
            <form action={rejectApplication}>
              <input type="hidden" name="id" value={app.id} />
              <button
                type="submit"
                className="rounded-md bg-gray-200 text-gray-700 px-2.5 py-1 text-xs"
              >
                거절
              </button>
            </form>
          </div>
        )}

        {app.status === "approved" && app.approved_doctor_id && (
          <div className="flex items-center gap-2 shrink-0">
            {linked ? (
              <span className="rounded-md bg-green-100 text-green-800 px-2.5 py-1 text-xs font-medium">
                ✓ 프로필 연결 완료
              </span>
            ) : signedUp ? (
              <form action={linkApplicationToProfile}>
                <input type="hidden" name="id" value={app.id} />
                <button
                  type="submit"
                  className="rounded-md bg-orange-500 text-white px-2.5 py-1 text-xs font-medium"
                  title="이 신청자의 가입 프로필을 doctor row에 연결"
                >
                  프로필 연결
                </button>
              </form>
            ) : (
              <span
                className="rounded-md bg-gray-100 text-gray-600 px-2.5 py-1 text-xs"
                title="신청자가 invite 링크로 아직 가입하지 않았어요"
              >
                가입 대기 중
              </span>
            )}
          </div>
        )}
      </div>

      {presentChannels.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-1.5">신청자가 보유한 채널</p>
          <div className="flex flex-wrap gap-2">
            {presentChannels.map((c) =>
              c.url ? (
                <a
                  key={c.label}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs text-primary hover:bg-primary/10 transition"
                >
                  {c.label} ↗
                </a>
              ) : (
                <span
                  key={c.label}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                  title="URL 미입력 — 운영팀이 확인 후 채워주세요"
                >
                  {c.label} · 주소 미입력
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {app.message && (
        <p className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-sm whitespace-pre-wrap text-foreground/80">
          {app.message}
        </p>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    contacted: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-gray-100 text-gray-600",
  }
  const label: Record<string, string> = {
    pending: "대기",
    contacted: "연락중",
    approved: "승인",
    rejected: "거절",
  }
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        map[status] ?? ""
      }`}
    >
      {label[status] ?? status}
    </span>
  )
}
