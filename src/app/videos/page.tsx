import Link from "next/link"
import { Video } from "lucide-react"
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
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\n?#]+)/
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((video) => {
            const videoId = getYouTubeId(video.url)
            const doctor = doctors.find((d) => d.slug === video.doctorSlug)

            return (
              <div key={video.url} className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow group">
                {/* 썸네일 */}
                <a href={video.url} target="_blank" rel="noopener noreferrer">
                  {videoId ? (
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                          <Video size={18} className="text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Video size={32} className="text-muted-foreground" />
                    </div>
                  )}
                </a>

                <div className="p-4">
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    <h3 className="font-semibold text-sm leading-snug word-keep group-hover:text-primary transition-colors line-clamp-2 mb-3">
                      {video.title}
                    </h3>
                  </a>

                  <div className="flex items-center justify-between">
                    <Link href={`/doctors/${video.doctorSlug}`} className="flex items-center gap-2 group/doctor">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: doctor?.photoPlaceholderColor ?? "#D4895A" }}
                      >
                        {video.doctor[0]}
                      </div>
                      <div>
                        <p className="text-xs font-medium group-hover/doctor:text-primary transition-colors">{video.doctor}</p>
                        <p className="text-[10px] text-muted-foreground">{video.hospital}</p>
                      </div>
                    </Link>
                    {video.date && (
                      <span className="text-xs text-muted-foreground">{video.date}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-20">
            <Video size={40} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">아직 등록된 영상이 없어요</p>
          </div>
        )}

        {/* 더 많은 영상 준비 중 */}
        <div className="mt-12 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">더 많은 영상이 곧 추가돼요</p>
          <p className="text-xs text-muted-foreground">
            선생님이 입점하면 자동으로 영상이 업데이트됩니다
          </p>
        </div>
      </div>
    </div>
  )
}
