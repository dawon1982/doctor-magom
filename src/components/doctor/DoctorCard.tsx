import Link from "next/link"
import { MapPin, PlayCircle, FileText } from "lucide-react"
import type { Doctor } from "@/lib/data/doctors-db"
import { OpenStatusBadge } from "@/components/doctor/OpenStatusBadge"

type Props = {
  doctor: Doctor
  compact?: boolean
}

export function DoctorCard({ doctor, compact = false }: Props) {
  const topSpecialties = doctor.specialties.slice(0, 3)
  const topKeywords = doctor.keywords.slice(0, 3)

  return (
    <Link href={`/doctors/${doctor.slug}`} className="group block">
      <div className="rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* ── 대형 대표 이미지 ── */}
        <div
          className="relative aspect-[4/5] w-full overflow-hidden bg-muted"
          style={doctor.photoUrl ? undefined : { backgroundColor: doctor.photoPlaceholderColor }}
        >
          {doctor.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doctor.photoUrl}
              alt={`${doctor.name} 선생님 프로필 사진`}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-extrabold tracking-tighter">
              {doctor.name[0]}
            </div>
          )}

          {/* 영상·기고글 카운트 — 사진 아래 가운데 (그라데이션 위) */}
          {((doctor.videos ?? []).length > 0 || (doctor.articles ?? []).length > 0) && (
            <div className="absolute bottom-3 right-3 flex gap-1.5 z-[1]">
              {(doctor.videos ?? []).length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 text-[11px] font-medium">
                  <PlayCircle size={11} />
                  {doctor.videos.length}
                </span>
              )}
              {(doctor.articles ?? []).length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 text-[11px] font-medium">
                  <FileText size={11} />
                  {doctor.articles.length}
                </span>
              )}
            </div>
          )}

          {/* 하단 그라데이션 + 이름·병원 — 사진 위에 오버레이 */}
          {doctor.photoUrl && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent pt-12 pb-4 px-4">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <h3 className="font-bold text-lg text-white drop-shadow group-hover:text-primary transition-colors">
                  {doctor.name}
                </h3>
                <span className="text-[11px] text-white/80">정신건강의학과 전문의</span>
              </div>
              <p className="text-sm font-medium text-white/90 mt-0.5 truncate">{doctor.hospital}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin size={11} className="text-white/70 flex-shrink-0" />
                  <span className="text-xs text-white/80 truncate">{doctor.district}</span>
                </div>
                <OpenStatusBadge
                  hours={doctor.hours}
                  lunchBreak={doctor.lunchBreak}
                  closedDays={doctor.closedDays}
                  variant="card"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── 본문 (이름 오버레이가 없는 fallback 시 명시적으로) ── */}
        {!doctor.photoUrl && (
          <div className="px-5 pt-4">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {doctor.name}
              </h3>
              <span className="text-xs text-muted-foreground">정신건강의학과 전문의</span>
            </div>
            <p className="text-sm font-medium text-foreground/80 mt-0.5 truncate">{doctor.hospital}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin size={11} className="text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{doctor.district}</span>
              </div>
              <OpenStatusBadge
                hours={doctor.hours}
                lunchBreak={doctor.lunchBreak}
                closedDays={doctor.closedDays}
                variant="card"
              />
            </div>
          </div>
        )}

        <div className="px-5 pt-4">
          {/* 키워드 뱃지 */}
          <div className="flex flex-wrap gap-1.5">
            {topKeywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary"
              >
                {kw}
              </span>
            ))}
          </div>

          {/* 전문분야 */}
          <div className="flex flex-wrap gap-1 mt-2">
            {topSpecialties.map((sp) => (
              <span
                key={sp}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {sp}
              </span>
            ))}
            {doctor.specialties.length > 3 && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                +{doctor.specialties.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* 리뷰 키워드 */}
        {!compact && doctor.reviewKeywords.length > 0 && (
          <div className="px-5 pt-4">
            <div className="rounded-xl bg-muted/60 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1.5">환자 후기 키워드</p>
              <div className="flex flex-col gap-1">
                {doctor.reviewKeywords.slice(0, 2).map((rk) => (
                  <div key={rk.text} className="flex items-center justify-between">
                    <span className="text-xs text-foreground/80 word-keep">{rk.text}</span>
                    <span className="text-xs font-semibold text-primary ml-2 flex-shrink-0">{rk.count}명</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 더 보기 indicator */}
        <div className="px-5 py-4 flex items-center justify-end">
          <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            자세히 보기 →
          </span>
        </div>
      </div>
    </Link>
  )
}
