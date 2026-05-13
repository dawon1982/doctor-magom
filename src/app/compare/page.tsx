import Link from "next/link"
import type { Metadata } from "next"
import { ChevronLeft } from "lucide-react"
import { getAllDoctors, type Doctor } from "@/lib/data/doctors-db"
import { OpenStatusBadge } from "@/components/doctor/OpenStatusBadge"

export const metadata: Metadata = {
  title: "선생님 비교",
  description: "최대 3명의 정신건강의학과 선생님을 한눈에 비교해보세요.",
  alternates: { canonical: "/compare" },
}

type Search = Promise<{ ids?: string }>

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Search
}) {
  const { ids: idsRaw } = await searchParams
  const slugs = (idsRaw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)

  const all = await getAllDoctors()
  const picked = slugs
    .map((slug) => all.find((d) => d.slug === slug))
    .filter((d): d is Doctor => !!d)

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link
        href="/doctors"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft size={15} /> 선생님 목록으로
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">선생님 비교</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {picked.length === 0
          ? "비교할 선생님을 선생님 목록에서 선택해주세요. (최대 3명)"
          : `${picked.length}명을 비교 중`}
      </p>

      {picked.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-16 px-6 text-center">
          <p className="text-3xl mb-3">🐻</p>
          <p className="text-sm text-muted-foreground mb-4">
            아직 비교할 선생님이 없어요. 선생님 목록에서 “비교하기” 체크박스로
            골라보세요.
          </p>
          <Link
            href="/doctors"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            선생님 고르러 가기
          </Link>
        </div>
      ) : (
        <CompareGrid doctors={picked} />
      )}
    </div>
  )
}

function CompareGrid({ doctors }: { doctors: Doctor[] }) {
  const rows: { label: string; render: (d: Doctor) => React.ReactNode }[] = [
    {
      label: "병원",
      render: (d) => <span className="font-medium">{d.hospital}</span>,
    },
    {
      label: "지역",
      render: (d) => `${d.region} · ${d.district}`,
    },
    {
      label: "상세 위치",
      render: (d) => (
        <span className="text-xs text-muted-foreground word-keep">{d.location}</span>
      ),
    },
    {
      label: "지금 진료",
      render: (d) => (
        <OpenStatusBadge
          hours={d.hours}
          lunchBreak={d.lunchBreak}
          closedDays={d.closedDays}
          variant="card"
        />
      ),
    },
    {
      label: "전문분야",
      render: (d) => (
        <div className="flex flex-wrap gap-1">
          {d.specialties.map((s) => (
            <span
              key={s}
              className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "진료 스타일",
      render: (d) => (
        <div className="flex flex-wrap gap-1">
          {d.keywords.map((k) => (
            <span
              key={k}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
            >
              {k}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "주요 대상",
      render: (d) =>
        d.targetPatients.length ? d.targetPatients.join(", ") : "—",
    },
    {
      label: "치료·검사",
      render: (d) => (
        <div className="flex flex-wrap gap-1">
          {d.treatments.map((t) => (
            <span
              key={t}
              className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "진료시간",
      render: (d) => (
        <div className="space-y-0.5 text-xs">
          {d.hours.map((h) => (
            <div key={h.day} className="flex justify-between gap-2">
              <span className="text-muted-foreground shrink-0">{h.day}</span>
              <span>{h.time}</span>
            </div>
          ))}
          {d.lunchBreak && (
            <div className="flex justify-between gap-2 pt-1 mt-1 border-t border-border">
              <span className="text-muted-foreground shrink-0">점심</span>
              <span>{d.lunchBreak}</span>
            </div>
          )}
          {d.closedDays && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground shrink-0">휴진</span>
              <span>{d.closedDays}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      label: "영상",
      render: (d) => `${d.videos.length}개`,
    },
    {
      label: "기고글",
      render: (d) => `${d.articles.length}개`,
    },
    {
      label: "예약",
      render: (d) =>
        d.kakaoUrl ? (
          <a
            href={d.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-[#FEE500] text-[#3A1D1D] px-3 py-1 text-xs font-semibold hover:opacity-90"
          >
            카카오 예약
          </a>
        ) : (
          "—"
        ),
    },
  ]

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div
        className="grid gap-3 px-4 sm:px-0 min-w-fit"
        style={{
          gridTemplateColumns: `120px repeat(${doctors.length}, minmax(220px, 1fr))`,
        }}
      >
        {/* Header row: doctor cards */}
        <div />
        {doctors.map((d) => (
          <div
            key={d.id}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex gap-3 items-start">
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-base font-bold"
                style={{ backgroundColor: d.photoPlaceholderColor }}
              >
                {d.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/doctors/${d.slug}`}
                  className="block font-bold text-sm hover:text-primary truncate"
                >
                  {d.name}
                </Link>
                <p className="text-xs text-muted-foreground truncate">
                  {d.hospital}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Rows */}
        {rows.map((row) => (
          <FragmentRow key={row.label} label={row.label} doctors={doctors} render={row.render} />
        ))}
      </div>
    </div>
  )
}

function FragmentRow({
  label,
  doctors,
  render,
}: {
  label: string
  doctors: Doctor[]
  render: (d: Doctor) => React.ReactNode
}) {
  return (
    <>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide self-start pt-3">
        {label}
      </div>
      {doctors.map((d) => (
        <div
          key={d.id}
          className="rounded-xl border border-border/60 bg-card/60 p-3 text-sm self-start"
        >
          {render(d)}
        </div>
      ))}
    </>
  )
}
