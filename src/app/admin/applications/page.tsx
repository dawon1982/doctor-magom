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
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase">
            <tr>
              <th className="px-4 py-3">신청자</th>
              <th className="px-4 py-3">병원</th>
              <th className="px-4 py-3">연락처</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">신청일</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(apps ?? []).map((a) => (
              <tr key={a.id} className="border-t border-border align-top">
                <td className="px-4 py-3">
                  <p className="font-medium">{a.applicant_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.applicant_email}
                  </p>
                </td>
                <td className="px-4 py-3">{a.hospital}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {a.phone ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3 text-right">
                  {a.status === "pending" && (
                    <div className="flex gap-2 justify-end">
                      <form action={approveApplication}>
                        <input type="hidden" name="id" value={a.id} />
                        <button
                          type="submit"
                          className="rounded-md bg-green-600 text-white px-2.5 py-1 text-xs"
                        >
                          승인
                        </button>
                      </form>
                      <form action={rejectApplication}>
                        <input type="hidden" name="id" value={a.id} />
                        <button
                          type="submit"
                          className="rounded-md bg-gray-200 text-gray-700 px-2.5 py-1 text-xs"
                        >
                          거절
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!apps?.length && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  접수된 신청이 없어요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
