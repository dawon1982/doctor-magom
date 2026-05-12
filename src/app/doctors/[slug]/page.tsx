import { notFound } from "next/navigation"
import Link from "next/link"
import { MapPin, Clock, Phone, Globe, PlayCircle, FileText, ChevronLeft, Star } from "lucide-react"
import { getDoctorBySlug, doctors } from "@/lib/data/doctors"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return doctors.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doctor = getDoctorBySlug(slug)
  if (!doctor) return {}
  return {
    title: `${doctor.name} | ${doctor.hospital}`,
    description: `${doctor.name} 정신건강의학과 전문의 | ${doctor.hospital} | ${doctor.specialties.slice(0, 3).join(", ")}`,
  }
}

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\n?#]+)/
  )
  return match ? match[1] : null
}

export default async function DoctorDetailPage({ params }: Props) {
  const { slug } = await params
  const doctor = getDoctorBySlug(slug)
  if (!doctor) notFound()

  return (
    <div className="min-h-screen bg-background">
      {/* 뒤로가기 */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-6">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={15} /> 선생님 목록으로
        </Link>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-16">
        {/* ─── 프로필 헤더 ─── */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex gap-5 items-start">
            {/* 아바타 */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-3xl font-bold shadow-md"
              style={{ backgroundColor: doctor.photoPlaceholderColor }}
            >
              {doctor.name[0]}
            </div>

            {/* 기본 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{doctor.name}</h1>
                <span className="text-sm text-muted-foreground">정신건강의학과 전문의</span>
              </div>
              <p className="text-base font-semibold text-foreground/80 mt-1">{doctor.hospital}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                <MapPin size={13} className="flex-shrink-0" />
                <span className="word-keep">{doctor.location}</span>
              </div>

              {/* 키워드 */}
              <div className="flex flex-wrap gap-2 mt-4">
                {doctor.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 바이오 */}
          <div className="mt-6 rounded-xl bg-muted/50 p-4">
            <p className="text-sm text-foreground/80 leading-relaxed word-keep">{doctor.bio}</p>
          </div>

          {/* 전문분야 */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">전문분야</p>
            <div className="flex flex-wrap gap-1.5">
              {doctor.specialties.map((sp) => (
                <span key={sp} className="rounded-lg bg-muted px-3 py-1 text-sm font-medium text-foreground/80">
                  {sp}
                </span>
              ))}
            </div>
          </div>

          {/* 대상 환자 */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">주요 대상</p>
            <div className="flex flex-wrap gap-1.5">
              {doctor.targetPatients.map((tp) => (
                <span key={tp} className="rounded-lg bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
                  {tp}
                </span>
              ))}
            </div>
          </div>

          {/* 치료·검사 */}
          {doctor.treatments.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">치료·검사</p>
              <div className="flex flex-wrap gap-1.5">
                {doctor.treatments.map((t) => (
                  <span key={t} className="rounded-lg border border-border px-3 py-1 text-sm text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ─── 진료시간 ─── */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock size={15} className="text-primary" />
              </div>
              <h2 className="font-bold text-base">진료시간</h2>
            </div>
            <div className="space-y-2">
              {doctor.hours.map((h) => (
                <div key={h.day} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{h.day}</span>
                  <span className="font-medium">{h.time}</span>
                </div>
              ))}
              {doctor.lunchBreak && (
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">점심</span>
                  <span className="font-medium">{doctor.lunchBreak}</span>
                </div>
              )}
              {doctor.closedDays && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">휴진</span>
                  <span className="font-medium text-muted-foreground">{doctor.closedDays}</span>
                </div>
              )}
            </div>
          </div>

          {/* ─── 환자 후기 키워드 ─── */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star size={15} className="text-primary" />
              </div>
              <h2 className="font-bold text-base">환자 후기 키워드</h2>
            </div>
            <div className="space-y-3">
              {doctor.reviewKeywords.map((rk) => (
                <div key={rk.text}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm word-keep">{rk.text}</span>
                    <span className="text-sm font-bold text-primary ml-2 flex-shrink-0">{rk.count}명</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all"
                      style={{ width: `${Math.min((rk.count / 45) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 링크들 ─── */}
        {(doctor.kakaoUrl || doctor.websiteUrl) && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-bold text-base mb-4">예약 · 정보</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {doctor.kakaoUrl && (
                <a
                  href={doctor.kakaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[#3A1D1D] font-semibold py-3 text-sm hover:opacity-90 transition-opacity"
                >
                  <Phone size={15} /> 카카오 예약하기
                </a>
              )}
              {doctor.websiteUrl && (
                <a
                  href={doctor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-muted text-foreground font-medium py-3 text-sm hover:bg-muted/70 transition-colors"
                >
                  <Globe size={15} /> 병원 홈페이지
                </a>
              )}
            </div>
          </div>
        )}

        {/* ─── 유튜브 영상 ─── */}
        {doctor.videos.length > 0 && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <PlayCircle size={15} className="text-red-500" />
              </div>
              <h2 className="font-bold text-base">영상 보기</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctor.videos.map((video) => {
                const videoId = getYouTubeId(video.url)
                return (
                  <a
                    key={video.url}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {videoId ? (
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                            <PlayCircle size={16} className="text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <PlayCircle size={28} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-medium word-keep line-clamp-2">{video.title}</p>
                      {video.date && (
                        <p className="text-xs text-muted-foreground mt-1">{video.date}</p>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── 기고글 ─── */}
        {doctor.articles.length > 0 && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <FileText size={15} className="text-secondary" />
              </div>
              <h2 className="font-bold text-base">기고글</h2>
            </div>
            <div className="space-y-3">
              {doctor.articles.map((article, i) => (
                <a
                  key={`${article.url}-${i}`}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-border p-4 hover:border-primary/30 hover:bg-muted/30 transition-all"
                >
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors word-keep">
                      {article.title}
                    </p>
                    {article.date && (
                      <p className="text-xs text-muted-foreground mt-0.5">{article.date}</p>
                    )}
                  </div>
                  <FileText size={14} className="text-muted-foreground flex-shrink-0 ml-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ─── 다른 선생님 보기 ─── */}
        <div className="mt-8 text-center">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            다른 선생님 보기
          </Link>
        </div>
      </div>
    </div>
  )
}
