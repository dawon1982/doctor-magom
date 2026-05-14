import Link from "next/link"
import { Play } from "lucide-react"
import { getAllVideos, getAllDoctors } from "@/lib/data/doctors-db"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "영상 보기",
  description:
    "정신건강의학과 선생님들의 유튜브 영상을 한곳에서 모아보세요. 우울·불안·ADHD·관계 문제 등 의사가 직접 설명하는 영상을 보고 진료 스타일을 미리 확인할 수 있어요.",
  alternates: { canonical: "/videos" },
  openGraph: {
    title: "선생님 영상 모아보기 | 닥터마음곰",
    description: "정신건강의학과 선생님들의 유튜브 영상 모음",
    type: "website",
  },
}

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\n?#]+)/,
  )
  return match ? match[1] : null
}

export default async function VideosPage() {
  const [videos, doctors] = await Promise.all([getAllVideos(), getAllDoctors()])
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="bg-gradient-to-b from-accent/30 to-background py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-medium text-primary mb-2">영상으로 먼저 만나요</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            선생님 영상 보기
          </h1>
          <p className="text-muted-foreground text-sm word-keep">
            선생님의 말투와 설명 방식을 영상으로 미리 확인해보세요
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {/* 쇼츠/릴스 스타일 세로형 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {videos.map((video) => {
            const videoId = getYouTubeId(video.url)
            const doctor = doctors.find((d) => d.slug === video.doctorSlug)

            return (
              <a
                key={video.url}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-muted hover:shadow-lg transition-shadow">
                  {videoId ? (
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={40} className="text-muted-foreground" />
                    </div>
                  )}

                  {/* 재생 버튼 오버레이 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-red-500/90 group-hover:scale-110 transition-all duration-200">
                      <Play size={20} className="text-white ml-1" fill="white" />
                    </div>
                  </div>

                  {/* 하단 그라데이션 + 제목 + 의사 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent pt-12 pb-3 px-3">
                    <h3 className="font-semibold text-xs sm:text-sm text-white leading-snug word-keep line-clamp-2 mb-2 drop-shadow">
                      {video.title}
                    </h3>
                    <Link
                      href={`/doctors/${video.doctorSlug}`}
                      className="inline-flex items-center gap-1.5 max-w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden"
                        style={{ backgroundColor: doctor?.photoPlaceholderColor ?? "#D4895A" }}
                      >
                        {doctor?.photoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={doctor.photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          video.doctor[0]
                        )}
                      </span>
                      <span className="text-[11px] text-white/90 font-medium truncate hover:text-primary transition-colors">
                        {video.doctor}
                      </span>
                    </Link>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-20">
            <Play size={40} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">아직 등록된 영상이 없어요</p>
          </div>
        )}

        {/* 더 많은 영상 준비 중 */}
        <div className="mt-12 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            더 많은 영상이 곧 추가돼요
          </p>
          <p className="text-xs text-muted-foreground">
            선생님이 입점하면 자동으로 영상이 업데이트됩니다
          </p>
        </div>
      </div>
    </div>
  )
}
