import { FileText, ExternalLink } from "lucide-react"
import { getAllArticles, getAllDoctors } from "@/lib/data/doctors-db"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "기고글",
  description:
    "정신건강의학과 선생님들이 직접 쓴 기고글로 정신건강·치료법·약물·상담에 대해 의사 관점에서 설명을 읽어보세요.",
  alternates: { canonical: "/articles" },
  openGraph: {
    title: "선생님 기고글 모아보기 | 닥터마음곰",
    description: "정신건강의학과 의사들이 직접 쓴 기고글 모음",
    type: "website",
  },
}

export default async function ArticlesPage() {
  const [articles, doctors] = await Promise.all([
    getAllArticles(),
    getAllDoctors(),
  ])
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="bg-gradient-to-b from-accent/30 to-background py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-medium text-primary mb-2">선생님이 직접 씁니다</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            마음에 관한 기고글
          </h1>
          <p className="text-muted-foreground text-sm word-keep">
            정신건강의학과 선생님들이 직접 쓴 글을 읽어보세요
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => {
            const doctor = doctors.find((d) => d.slug === article.doctorSlug)

            return (
              <a
                key={article.url}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all flex flex-col overflow-hidden"
              >
                {/* 대표 이미지 */}
                <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                  {article.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={article.thumbnailUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText size={32} className="text-muted-foreground/40" />
                    </div>
                  )}
                  {/* 플랫폼 뱃지 */}
                  {article.platform === "naver" && (
                    <span className="absolute top-2 left-2 rounded-full bg-[#03C75A] text-white text-[10px] font-bold px-2 py-0.5 shadow">
                      네이버
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm leading-snug word-keep group-hover:text-primary transition-colors line-clamp-3 flex-1 mb-4">
                    {article.title}
                  </h3>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold overflow-hidden"
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
                          article.doctor[0]
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{article.doctor}</p>
                        {article.date && (
                          <p className="text-[10px] text-muted-foreground">
                            {article.date}
                          </p>
                        )}
                      </div>
                    </div>
                    <ExternalLink
                      size={13}
                      className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                    />
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-20">
            <FileText size={40} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">아직 등록된 기고글이 없어요</p>
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">더 많은 기고글이 곧 추가돼요</p>
          <p className="text-xs text-muted-foreground">
            선생님들이 직접 작성한 정신건강 정보를 계속 업데이트할게요
          </p>
        </div>
      </div>
    </div>
  )
}
