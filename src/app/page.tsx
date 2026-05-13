import Link from "next/link"
import { ArrowRight, Heart, Video, FileText, Search, Shield, Sparkles } from "lucide-react"
import { getAllDoctors, getAllVideos, getAllArticles } from "@/lib/data/doctors-db"
import { DoctorCard } from "@/components/doctor/DoctorCard"
import { HeroPhotoCarousel } from "@/components/home/HeroPhotoCarousel"
import { getSiteUrl, SITE_NAME, SITE_TAGLINE } from "@/lib/site"

const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${getSiteUrl()}#org`,
      name: SITE_NAME,
      url: getSiteUrl(),
      logo: `${getSiteUrl()}/opengraph-image`,
      description: SITE_TAGLINE,
    },
    {
      "@type": "WebSite",
      "@id": `${getSiteUrl()}#site`,
      url: getSiteUrl(),
      name: SITE_NAME,
      inLanguage: "ko-KR",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${getSiteUrl()}/doctors?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
}

const prejudiceItems = [
  {
    myth: "정신과 가면 기록이 남아서 불이익이 생긴다?",
    fact: "진료 기록은 법적으로 보호되며, 생명보험 등 일부 예외를 제외하면 외부에 공개되지 않습니다.",
  },
  {
    myth: "정신과는 심하게 아픈 사람만 가는 곳이다?",
    fact: "스트레스, 수면 문제, 집중력 저하 등 일상적인 어려움도 정신과에서 도움받을 수 있습니다.",
  },
  {
    myth: "한번 약을 먹으면 평생 끊지 못한다?",
    fact: "정신과 약은 대부분 필요한 기간만 복용하며, 의사와 상의하며 조절합니다.",
  },
]

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\n?#]+)/
  )
  return match ? match[1] : null
}

export default async function Home() {
  const [doctors, videos, articles] = await Promise.all([
    getAllDoctors(),
    getAllVideos(),
    getAllArticles(),
  ])
  const featuredDoctors = doctors.slice(0, 6)
  const featuredVideos = videos.slice(0, 3)
  const featuredArticles = articles.slice(0, 3)

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
      />
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/40 via-background to-background pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <span>🐻</span>
            <span>정신건강의학과계의 강남언니</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground word-keep max-w-2xl mx-auto leading-[1.15]">
            마음이 맞는<br />
            <span className="text-primary">선생님</span>을 찾아드려요
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted-foreground word-keep max-w-xl mx-auto leading-relaxed">
            의사의 얼굴, 말투, 영상, 글을 먼저 보고<br className="hidden sm:block" />
            나와 잘 맞는 정신건강의학과 선생님을 직접 골라보세요.
          </p>

          <HeroPhotoCarousel
            doctors={doctors
              .filter((d) => !!d.photoUrl)
              .map((d) => ({
                slug: d.slug,
                name: d.name,
                hospital: d.hospital,
                photoUrl: d.photoUrl,
              }))}
          />

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/match"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-md shadow-primary/25"
            >
              <Sparkles size={17} /> AI로 의사 추천받기
            </Link>
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-7 py-3.5 text-base font-medium text-foreground hover:bg-muted transition-colors"
            >
              직접 찾아보기 <ArrowRight size={17} />
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[
              { num: "15+", label: "등록 선생님" },
              { num: "5+", label: "영상·기고글" },
              { num: "무료", label: "이용료" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-extrabold text-primary">{stat.num}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 서비스 특징 ─── */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Video size={22} className="text-primary" />,
                title: "영상으로 먼저 만나요",
                desc: "유튜브 영상과 사진으로 선생님의 말투와 분위기를 미리 확인하세요.",
              },
              {
                icon: <Heart size={22} className="text-primary" />,
                title: "나와 맞는 선생님 선택",
                desc: "전문분야, 진료 스타일, 대상 환자 등으로 필터링해 딱 맞는 선생님을 찾아보세요.",
              },
              {
                icon: <Search size={22} className="text-primary" />,
                title: "지역별 검색",
                desc: "강남, 서초, 용산, 경기 등 내가 다닐 수 있는 지역의 선생님을 바로 찾을 수 있어요.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed word-keep">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 의사 갤러리 ─── */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-primary mb-1">마음곰 선생님들</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                나와 맞는 선생님을 찾아보세요
              </h2>
            </div>
            <Link
              href="/doctors"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              전체 보기 <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-7 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              선생님 {doctors.length}명 전체 보기 <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 영상 섹션 ─── */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-primary mb-1">영상으로 먼저 만나요</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                선생님 영상 보기
              </h2>
            </div>
            <Link
              href="/videos"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              전체 보기 <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featuredVideos.map((video) => {
              const videoId = getYouTubeId(video.url)
              return (
                <a
                  key={video.url}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  {videoId ? (
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-primary transition-colors">
                          <Video size={18} className="text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Video size={32} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-sm leading-snug word-keep line-clamp-2">{video.title}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{video.doctor} · {video.hospital}</p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── 기고글 섹션 ─── */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-primary mb-1">선생님이 직접 씁니다</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                마음에 관한 기고글
              </h2>
            </div>
            <Link
              href="/articles"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              전체 보기 <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featuredArticles.map((article) => (
              <a
                key={article.url}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <FileText size={15} className="text-secondary" />
                </div>
                <h3 className="font-semibold text-sm leading-snug word-keep group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{article.doctor}</span>
                  {article.date && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-xs text-muted-foreground">{article.date}</span>
                    </>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 편견 해소 섹션 ─── */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-primary mb-1">정신과에 대한 오해</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              이런 생각, 해보셨나요?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground word-keep">
              정신건강의학과에 대한 오해를 함께 풀어봐요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {prejudiceItems.map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center text-destructive text-xs font-bold">
                    ?
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">오해</span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-4 word-keep leading-relaxed">
                  &ldquo;{item.myth}&rdquo;
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield size={13} className="text-primary" />
                  </div>
                  <span className="text-xs font-medium text-primary">사실</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed word-keep">{item.fact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA 배너 ─── */}
      <section className="py-20 bg-gradient-to-r from-primary/15 via-accent/30 to-secondary/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <span className="text-4xl">🐻</span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
            마음이 맞는 선생님을 찾을 때까지,<br />
            닥터마음곰이 함께해요
          </h2>
          <p className="mt-4 text-muted-foreground text-sm word-keep">
            지금 바로 나와 맞는 선생님을 찾아보세요.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/match"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              <Sparkles size={17} /> AI 추천받기
            </Link>
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-8 py-4 text-base font-medium hover:bg-background transition-colors"
            >
              <Search size={15} className="text-primary" /> 직접 찾아보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
