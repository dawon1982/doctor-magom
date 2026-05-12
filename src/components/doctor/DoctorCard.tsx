import Link from "next/link"
import { MapPin, PlayCircle, FileText } from "lucide-react"
import type { Doctor } from "@/lib/data/doctors-db"

type Props = {
  doctor: Doctor
  compact?: boolean
}

export function DoctorCard({ doctor, compact = false }: Props) {
  const topSpecialties = doctor.specialties.slice(0, 3)
  const topKeywords = doctor.keywords.slice(0, 3)

  return (
    <Link href={`/doctors/${doctor.slug}`} className="group block">
      <div className="rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* 의사 아바타 + 정보 */}
        <div className="p-5">
          <div className="flex gap-4 items-start">
            {/* 아바타 */}
            <div
              className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-sm"
              style={{ backgroundColor: doctor.photoPlaceholderColor }}
            >
              {doctor.name[0]}
            </div>

            {/* 기본 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {doctor.name}
                </h3>
                <span className="text-xs text-muted-foreground">정신건강의학과 전문의</span>
              </div>
              <p className="text-sm font-medium text-foreground/80 mt-0.5 truncate">{doctor.hospital}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={11} className="text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{doctor.district}</span>
              </div>
            </div>
          </div>

          {/* 키워드 뱃지 */}
          <div className="flex flex-wrap gap-1.5 mt-4">
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
          <div className="px-5 pb-4">
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

        {/* 콘텐츠 아이콘 */}
        <div className="px-5 pb-4 flex items-center gap-3">
          {(doctor.videos ?? []).length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <PlayCircle size={13} />
              <span>영상 {(doctor.videos ?? []).length}개</span>
            </div>
          )}
          {(doctor.articles ?? []).length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText size={13} />
              <span>기고글 {(doctor.articles ?? []).length}개</span>
            </div>
          )}
          {(doctor.videos ?? []).length === 0 && (doctor.articles ?? []).length === 0 && (
            <span className="text-xs text-muted-foreground/50">프로필 보기 →</span>
          )}
          <div className="ml-auto">
            <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              자세히 보기 →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
