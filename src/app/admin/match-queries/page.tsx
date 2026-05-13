import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const PAGE_LIMIT = 100

type Row = {
  id: string
  created_at: string
  query: string
  region: string | null
  target_patient: string | null
  recommended_slugs: string[]
  input_tokens: number | null
  output_tokens: number | null
  cached_read_tokens: number | null
  error: string | null
}

export default async function MatchQueriesPage() {
  const supabase = await createClient()
  const { data: rowsRaw, error } = await supabase
    .from("match_queries")
    .select(
      "id, created_at, query, region, target_patient, recommended_slugs, input_tokens, output_tokens, cached_read_tokens, error",
    )
    .order("created_at", { ascending: false })
    .limit(PAGE_LIMIT)

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">AI 매칭 분석</h1>
        <p className="text-sm text-red-600">
          쿼리 로그 불러오기 실패: {error.message}
          <br />
          <span className="text-muted-foreground">
            (마이그레이션 006이 적용됐는지 확인해주세요)
          </span>
        </p>
      </div>
    )
  }

  const rows = (rowsRaw as Row[] | null) ?? []

  // Doctor slug → name·hospital lookup for the doctors that appear in
  // recommendations. Use admin client (cookieless) — we're already
  // inside admin layout so requireRole has gated this.
  const allSlugs = new Set<string>()
  rows.forEach((r) => r.recommended_slugs?.forEach((s) => allSlugs.add(s)))
  const slugList = [...allSlugs]
  const admin = createAdminClient()
  const { data: doctorRows } = slugList.length
    ? await admin
        .from("doctors")
        .select("slug, name, hospital")
        .in("slug", slugList)
    : { data: [] }
  const doctorMap = new Map<string, { name: string; hospital: string }>(
    (doctorRows ?? []).map((d) => [
      d.slug as string,
      { name: d.name as string, hospital: d.hospital as string },
    ]),
  )

  const total = rows.length
  const successful = rows.filter((r) => !r.error && r.recommended_slugs?.length).length
  const failed = total - successful
  const successRate = total === 0 ? 0 : Math.round((successful / total) * 100)
  const totalInput = rows.reduce((m, r) => m + (r.input_tokens ?? 0), 0)
  const totalOutput = rows.reduce((m, r) => m + (r.output_tokens ?? 0), 0)
  const totalCached = rows.reduce((m, r) => m + (r.cached_read_tokens ?? 0), 0)
  const cacheHitRate =
    totalInput === 0 ? 0 : Math.round((totalCached / totalInput) * 100)

  // Top recommended doctors (count across all successful queries)
  const recCount = new Map<string, number>()
  rows.forEach((r) =>
    r.recommended_slugs?.forEach((s) =>
      recCount.set(s, (recCount.get(s) ?? 0) + 1),
    ),
  )
  const topRecs = [...recCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-2xl font-bold">AI 매칭 분석</h1>
        <span className="text-xs text-muted-foreground">
          최근 {total}건 (최대 {PAGE_LIMIT})
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        환자가 /match 에 입력한 자연어 쿼리와 AI가 추천한 의사를 모두 모아봐요.
        프롬프트 튜닝·추천 품질 점검·핫한 환자 니즈 파악에 사용.
      </p>

      {/* ─── 통계 패널 ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="총 쿼리" value={total.toString()} />
        <Stat label="성공률" value={`${successRate}%`} sub={`${successful}/${total}`} />
        <Stat
          label="총 토큰 (in/out)"
          value={`${totalInput.toLocaleString()} / ${totalOutput.toLocaleString()}`}
          sub={`cache hit ${cacheHitRate}%`}
        />
        <Stat
          label="실패"
          value={failed.toString()}
          sub={failed > 0 ? "원인 확인 필요" : "—"}
          danger={failed > 0}
        />
      </div>

      {/* ─── Top recommended doctors ─── */}
      {topRecs.length > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold mb-3">자주 추천된 의사</h2>
          <ul className="space-y-1.5">
            {topRecs.map(([slug, count], i) => {
              const doc = doctorMap.get(slug)
              return (
                <li
                  key={slug}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground w-4">
                      #{i + 1}
                    </span>
                    {doc ? (
                      <Link
                        href={`/doctors/${slug}`}
                        className="hover:text-primary truncate"
                      >
                        {doc.name}{" "}
                        <span className="text-xs text-muted-foreground">
                          {doc.hospital}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground italic truncate">
                        {slug} (삭제됨?)
                      </span>
                    )}
                  </span>
                  <span className="font-semibold tabular-nums">{count}회</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* ─── 쿼리 리스트 ─── */}
      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="rounded-xl border border-border bg-card px-4 py-12 text-center text-muted-foreground">
            아직 매칭 쿼리 기록이 없어요.
          </div>
        )}
        {rows.map((r) => (
          <QueryCard key={r.id} row={r} doctorMap={doctorMap} />
        ))}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  danger,
}: {
  label: string
  value: string
  sub?: string
  danger?: boolean
}) {
  return (
    <div
      className={`rounded-xl border bg-card px-4 py-3 ${danger ? "border-red-200" : "border-border"}`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold mt-0.5 ${danger ? "text-red-600" : ""}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

function QueryCard({
  row,
  doctorMap,
}: {
  row: Row
  doctorMap: Map<string, { name: string; hospital: string }>
}) {
  const filters: string[] = []
  if (row.region) filters.push(`지역: ${row.region}`)
  if (row.target_patient) filters.push(`환자: ${row.target_patient}`)
  const isError = !!row.error || !row.recommended_slugs?.length

  return (
    <div
      className={`rounded-xl border bg-card p-4 ${
        isError ? "border-red-200 bg-red-50/40" : "border-border"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <p className="text-xs text-muted-foreground tabular-nums">
          {new Date(row.created_at).toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-[11px] text-muted-foreground tabular-nums shrink-0">
          {row.input_tokens != null
            ? `${row.input_tokens.toLocaleString()} in / ${row.output_tokens?.toLocaleString() ?? 0} out${
                row.cached_read_tokens
                  ? ` · cache ${row.cached_read_tokens.toLocaleString()}`
                  : ""
              }`
            : "—"}
        </p>
      </div>

      <p className="text-sm leading-relaxed whitespace-pre-wrap word-keep mb-3">
        {row.query}
      </p>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {filters.map((f) => (
            <span
              key={f}
              className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {row.error && (
        <p className="text-xs text-red-700 mb-2 font-mono">⚠️ {row.error}</p>
      )}

      {row.recommended_slugs?.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {row.recommended_slugs.map((slug, i) => {
            const doc = doctorMap.get(slug)
            return (
              <Link
                key={`${slug}-${i}`}
                href={`/doctors/${slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-2.5 py-0.5 text-[11px] text-primary hover:bg-primary/10 transition"
              >
                <span className="text-muted-foreground">#{i + 1}</span>
                {doc ? doc.name : slug}
              </Link>
            )
          })}
        </div>
      ) : (
        !row.error && (
          <p className="text-xs text-muted-foreground italic">추천 결과 없음</p>
        )
      )}
    </div>
  )
}
