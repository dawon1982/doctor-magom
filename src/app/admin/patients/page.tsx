import { createClient } from "@/lib/supabase/server"


export default async function AdminPatientsPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from("patient_signups")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">환자 CRM</h1>
        {rows && rows.length > 0 && (
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(toCsv(rows))}`}
            download={`patients-${new Date().toISOString().slice(0, 10)}.csv`}
            className="text-sm rounded-lg border border-border px-3 py-1.5 hover:bg-accent"
          >
            CSV 내보내기
          </a>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase">
            <tr>
              <th className="px-4 py-3">이메일</th>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">연령</th>
              <th className="px-4 py-3">지역</th>
              <th className="px-4 py-3">고민</th>
              <th className="px-4 py-3">동의</th>
              <th className="px-4 py-3">가입일</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{r.email}</td>
                <td className="px-4 py-3">{r.display_name ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.age_range ?? "-"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.preferred_region ?? "-"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.primary_concern ?? "-"}
                </td>
                <td className="px-4 py-3">
                  {r.marketing_consent ? (
                    <span className="text-xs text-green-700">예</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("ko-KR")}
                </td>
              </tr>
            ))}
            {!rows?.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  아직 가입한 환자가 없어요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return ""
  const headers = [
    "email",
    "display_name",
    "age_range",
    "gender",
    "preferred_region",
    "primary_concern",
    "marketing_consent",
    "created_at",
  ]
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n")
}
