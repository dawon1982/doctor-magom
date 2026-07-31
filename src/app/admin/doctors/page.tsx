import Link from "next/link"
import { Eye, EyeOff, MousePointerClick } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { togglePublished } from "@/app/admin/actions"
import { SubmitButton } from "@/components/ui/SubmitButton"


export default async function AdminDoctorsPage() {
  const supabase = await createClient()
  const { data: doctors } = await supabase
    .from("doctors")
    .select("id, slug, name, hospital, district, region, is_published")
    .order("created_at", { ascending: true })

  // Outbound-click totals per doctor (conversion signal). Graceful if the
  // table (migration 012) isn't applied yet.
  const clickCounts = new Map<string, number>()
  try {
    const { data: clicks } = await supabase
      .from("doctor_outbound_clicks")
      .select("doctor_id")
    for (const c of clicks ?? []) {
      const id = c.doctor_id as string
      clickCounts.set(id, (clickCounts.get(id) ?? 0) + 1)
    }
  } catch {
    // table missing — column simply shows 0
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">의사 관리</h1>
        <Link
          href="/admin/doctors/new"
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
        >
          + 의사 추가
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase">
            <tr>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">병원</th>
              <th className="px-4 py-3">지역</th>
              <th className="px-4 py-3">slug</th>
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1" title="예약·홈페이지 클릭 수">
                  <MousePointerClick size={12} /> 클릭
                </span>
              </th>
              <th className="px-4 py-3">공개</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(doctors ?? []).map((d) => (
              <tr key={d.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.hospital}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {d.region} {d.district}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{d.slug}</td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {clickCounts.get(d.id) ?? 0}
                </td>
                <td className="px-4 py-3">
                  <form action={togglePublished}>
                    <input type="hidden" name="id" value={d.id} />
                    <input
                      type="hidden"
                      name="next"
                      value={d.is_published ? "false" : "true"}
                    />
                    <SubmitButton
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition active:scale-95 ${
                        d.is_published
                          ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900/70"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                      }`}
                      pendingLabel="…"
                      title={d.is_published ? "클릭해서 숨김" : "클릭해서 공개"}
                    >
                      {d.is_published ? (
                        <>
                          <Eye size={12} /> 공개
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} /> 숨김
                        </>
                      )}
                    </SubmitButton>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/doctors/${d.id}`}
                    className="text-primary text-sm hover:underline"
                  >
                    편집
                  </Link>
                </td>
              </tr>
            ))}
            {!doctors?.length && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  등록된 의사가 없어요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
