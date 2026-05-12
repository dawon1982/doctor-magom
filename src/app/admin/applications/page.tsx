import { createClient } from "@/lib/supabase/server"
import {
  approveApplication,
  rejectApplication,
} from "@/app/admin/actions"


export default async function AdminApplicationsPage() {
  const supabase = await createClient()
  const { data: apps } = await supabase
    .from("doctor_applications")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">입점 신청</h1>
      <div className="space-y-3">
        {(apps ?? []).map((a) => (
          <ApplicationCard key={a.id} app={a} />
        ))}
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
  hospital_website: string | null
  personal_website: string | null
  blog_url: string | null
  youtube_url: string | null
  instagram_url: string | null
  message: string | null
  status: string
  created_at: string
}

function ApplicationCard({ app }: { app: ApplicationRow }) {
  const channels: { label: string; url: string | null }[] = [
    { label: "병원 홈페이지", url: app.hospital_website },
    { label: "개인 홈페이지", url: app.personal_website },
    { label: "블로그", url: app.blog_url },
    { label: "유튜브", url: app.youtube_url },
    { label: "인스타그램", url: app.instagram_url },
  ]
  const presentChannels = channels.filter((c) => c.url)

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
      </div>

      {presentChannels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {presentChannels.map((c) => (
            <a
              key={c.label}
              href={c.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-primary hover:bg-accent transition"
            >
              {c.label} ↗
            </a>
          ))}
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
