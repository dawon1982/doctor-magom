import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { togglePublished } from "@/app/admin/actions"

export const dynamic = "force-dynamic"

export default async function AdminDoctorsPage() {
  const supabase = await createClient()
  const { data: doctors } = await supabase
    .from("doctors")
    .select("id, slug, name, hospital, district, region, is_published")
    .order("created_at", { ascending: true })

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

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase">
            <tr>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">병원</th>
              <th className="px-4 py-3">지역</th>
              <th className="px-4 py-3">slug</th>
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
                <td className="px-4 py-3">
                  <form action={togglePublished}>
                    <input type="hidden" name="id" value={d.id} />
                    <input
                      type="hidden"
                      name="next"
                      value={d.is_published ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        d.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.is_published ? "공개" : "숨김"}
                    </button>
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
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
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
