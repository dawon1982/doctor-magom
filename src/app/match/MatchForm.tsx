"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { matchDoctorsAction, type SerializedPick } from "./actions"

const REGIONS = ["서울", "경기", "인천", "기타"] as const
const TARGETS = [
  "성인",
  "청소년",
  "직장인",
  "여성",
  "남성",
  "노인",
  "대학생",
]

const EXAMPLES = [
  "30대 직장인이에요. 최근 잠을 못 자고 출근이 너무 힘들어요. 약물보다는 상담 위주로 진료해주시는 분이면 좋겠어요.",
  "20대 여성, 공황발작이 한 달째 반복돼요. 강남 근처에서 공감적으로 들어주시는 선생님 추천해주세요.",
  "고등학생 자녀가 우울감을 호소해요. 청소년 진료 경험 많고 부드러운 분으로요.",
]

export default function MatchForm() {
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState<string>("")
  const [targetPatient, setTargetPatient] = useState<string>("")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    picks: SerializedPick[]
    caveat?: string
  } | null>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setResult(null)
    startTransition(async () => {
      const res = await matchDoctorsAction({ query, region, targetPatient })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setResult({
        picks: res.picks,
        ...(res.caveat ? { caveat: res.caveat } : {}),
      })
    })
  }

  function reset() {
    setQuery("")
    setRegion("")
    setTargetPatient("")
    setError(null)
    setResult(null)
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-sm font-semibold text-primary mb-1">
            🐻 닥터마음곰의 추천
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            아래 {result.picks.length}분이 가장 잘 맞아 보여요. 추천 이유를 읽고
            마음에 드는 분의 프로필을 살펴보세요.
          </p>
          {result.caveat && (
            <p className="mt-3 text-xs text-muted-foreground italic">
              ※ {result.caveat}
            </p>
          )}
        </div>

        <ul className="space-y-4">
          {result.picks.map((p, i) => (
            <li
              key={p.slug}
              className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ backgroundColor: p.photoPlaceholderColor }}
                  aria-hidden
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <p className="font-semibold text-base">
                      {p.name}{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        {p.hospital}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {p.region} · {p.district}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed mb-3">{p.reason}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.specialties.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                    {p.keywords.map((k) => (
                      <span
                        key={k}
                        className="rounded-full border border-primary/30 px-2 py-0.5 text-[11px] text-primary"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/doctors/${p.slug}`}
                    className="inline-block text-sm font-medium text-primary hover:underline"
                  >
                    프로필 자세히 보기 →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={reset}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← 다시 검색
          </button>
          <p className="text-xs text-muted-foreground">
            추천은 참고용이에요. 실제 진료는 의사와 직접 상담하시는 게 좋아요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">
          어떤 상황이세요?{" "}
          <span className="text-xs text-muted-foreground font-normal">
            (증상·상황·원하는 스타일을 자유롭게 적어주세요)
          </span>
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={6}
          minLength={10}
          maxLength={2000}
          required
          placeholder="예: 최근 한 달째 잠을 못 자고 출근이 힘들어요. 약물보다 상담 위주로 진료해주시는 분이면 좋겠어요."
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">최소 10자, 최대 2000자</p>
          <p className="text-xs text-muted-foreground">{query.length}/2000</p>
        </div>
      </div>

      <details className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground select-none">
          💡 예시 보기
        </summary>
        <ul className="mt-2 space-y-1.5">
          {EXAMPLES.map((ex, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setQuery(ex)}
                className="block w-full text-left text-xs text-muted-foreground hover:text-foreground py-1 leading-relaxed"
              >
                · {ex}
              </button>
            </li>
          ))}
        </ul>
      </details>

      <div className="grid sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            선호 지역{" "}
            <span className="text-xs text-muted-foreground font-normal">
              (선택)
            </span>
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">상관없음</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            환자 유형{" "}
            <span className="text-xs text-muted-foreground font-normal">
              (선택)
            </span>
          </label>
          <select
            value={targetPatient}
            onChange={(e) => setTargetPatient(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">상관없음</option>
            {TARGETS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || query.trim().length < 10}
        className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "🐻 닥터마음곰이 고민 중..." : "✨ 의사 추천받기"}
      </button>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        AI가 등록된 의사 프로필을 분석해 맞는 분을 골라드려요.<br />
        익명으로 처리되며 개인정보는 저장하지 않아요.
      </p>
    </form>
  )
}
