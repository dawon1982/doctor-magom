import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [doctors, applications, patients] = await Promise.all([
    supabase.from("doctors").select("*", { count: "exact", head: true }),
    supabase
      .from("doctor_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("patient_signups").select("*", { count: "exact", head: true }),
  ])

  const cards = [
    { label: "등록된 의사", value: doctors.count ?? 0, href: "/admin/doctors" },
    { label: "대기 중인 입점 신청", value: applications.count ?? 0, href: "/admin/applications" },
    { label: "가입 환자", value: patients.count ?? 0, href: "/admin/patients" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">대시보드</h1>
      <p className="text-sm text-muted-foreground mb-8">
        닥터마음곰 운영 현황이에요.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/60 transition"
          >
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="text-3xl font-bold mt-2">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
