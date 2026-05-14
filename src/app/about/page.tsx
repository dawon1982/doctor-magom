import Link from "next/link"
import { ArrowRight, Video, Heart, Search, MessageCircle, Star, Zap } from "lucide-react"
import type { Metadata } from "next"
import { MagomBear } from "@/components/brand/MagomBear"

export const metadata: Metadata = {
  title: "서비스 소개",
  description:
    "닥터마음곰은 정신건강의학과 의사를 영상·말투·진료 스타일로 미리 확인하고 환자가 직접 고를 수 있게 도와주는 매칭 플랫폼이에요. AI가 내 상황을 듣고 잘 맞는 의사를 추천해드려요.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "닥터마음곰 서비스 소개",
    description: "정신건강의학과계의 강남언니 — 영상으로 의사를 먼저 만나는 매칭 플랫폼",
    type: "website",
  },
}

const features = [
  {
    icon: <Video size={22} className="text-primary" />,
    title: "영상·사진으로 먼저 확인",
    desc: "첫 진료 전에 유튜브 영상과 사진으로 선생님의 말투, 설명 방식, 분위기를 미리 알 수 있어요.",
  },
  {
    icon: <Heart size={22} className="text-primary" />,
    title: "나와 맞는 스타일 필터링",
    desc: "지지적인지, 명쾌한지, 공감적인지 — 나에게 맞는 진료 스타일의 선생님을 직접 선택하세요.",
  },
  {
    icon: <Search size={22} className="text-primary" />,
    title: "전문분야 + 지역 검색",
    desc: "ADHD, 우울증, 불면증 등 전문분야와 강남·서초·용산 등 내 동네 기준으로 검색해요.",
  },
  {
    icon: <MessageCircle size={22} className="text-primary" />,
    title: "기고글과 Q&A",
    desc: "선생님이 직접 쓴 기고글을 읽고, 정신건강에 관한 궁금증을 전문가에게 물어볼 수 있어요.",
  },
  {
    icon: <Star size={22} className="text-primary" />,
    title: "큐레이션된 의사 목록",
    desc: "자발적으로 자료를 제출한 선생님만 소개해요. 닥터마음곰이 직접 검토한 의사분들입니다.",
  },
  {
    icon: <Zap size={22} className="text-primary" />,
    title: "곧 출시 예정",
    desc: "AI 기반 맞춤 추천, 카테고리별 검색, 입원 가능 여부 표시 기능을 준비 중이에요.",
  },
]

const steps = [
  {
    step: "01",
    title: "선생님 탐색",
    desc: "영상과 프로필로 선생님을 알아가세요. 전문분야, 스타일, 지역으로 필터링할 수 있어요.",
  },
  {
    step: "02",
    title: "상세 프로필 확인",
    desc: "유튜브 영상, 기고글, 진료시간, 환자 후기 키워드를 보고 더 깊이 알아가세요.",
  },
  {
    step: "03",
    title: "예약 연결",
    desc: "마음에 드는 선생님의 카카오 채널이나 병원 홈페이지로 직접 예약하세요.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <section className="bg-gradient-to-b from-accent/30 to-background py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <MagomBear className="h-14 w-14 mx-auto" />
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
            닥터마음곰 소개
          </h1>
          <p className="mt-4 text-base text-muted-foreground word-keep max-w-2xl mx-auto leading-relaxed">
            마음이 맞는 선생님을 찾을 때까지, 닥터마음곰이 도와드릴게요.
            <br className="hidden sm:block" />
            정신건강의학과 계의 강남언니를 만들겠습니다.
          </p>
        </div>
      </section>

      {/* 서비스 목적 */}
      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/20 to-secondary/10 p-8 sm:p-10">
            <p className="text-sm font-medium text-primary mb-3">왜 닥터마음곰인가요?</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
              정신과 첫 예약,<br />막막하셨던 적 있으신가요?
            </h2>
            <p className="text-muted-foreground leading-relaxed word-keep text-sm sm:text-base">
              병원 이름과 위치만 보고 예약했다가 나와 맞지 않아 힘드셨던 경험,<br className="hidden sm:block" />
              닥터마음곰은 그 문제를 해결하고 싶어요.<br /><br />
              선생님의 얼굴, 말투, 설명 방식을 먼저 보고<br className="hidden sm:block" />
              &ldquo;이 분이라면 편하게 이야기할 수 있겠다&rdquo;라는 확신을 갖고 예약하세요.
            </p>
          </div>
        </div>
      </section>

      {/* 기능 */}
      <section className="py-14 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-primary mb-1">주요 기능</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              닥터마음곰으로 할 수 있는 것들
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-sm mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed word-keep">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 이용 방법 */}
      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-primary mb-1">이용 방법</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              3단계로 선생님을 만나보세요
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-base mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed word-keep">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 의사 입점 */}
      <section className="py-14 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 text-center">
            <p className="text-sm font-medium text-primary mb-2">정신건강의학과 선생님이신가요?</p>
            <h2 className="text-2xl font-extrabold tracking-tight mb-3">닥터마음곰에 입점하세요</h2>
            <p className="text-sm text-muted-foreground word-keep max-w-md mx-auto leading-relaxed mb-6">
              영상, 사진, 블로그 등 자료를 제출하시면 닥터마음곰이 프로필 페이지를 만들어드려요.
              환자분들이 선생님의 진료 스타일을 미리 알고 예약합니다.
            </p>
            <a
              href="https://whattime.co.kr/magom/meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              입점 문의하기 <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* 연락처 */}
      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-xl font-extrabold tracking-tight mb-2">연락처</h2>
          <p className="text-muted-foreground text-sm mb-4">문의사항이 있으시면 편하게 연락주세요</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a href="mailto:contact@magom.io" className="text-primary hover:underline">contact@magom.io</a>
            <span className="hidden sm:block text-muted-foreground">·</span>
            <a
              href="https://www.instagram.com/dr.magom.official"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @dr.magom.official
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/15 via-accent/20 to-secondary/10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-4">
            지금 바로 시작해보세요
          </h2>
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
          >
            선생님 찾기 <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  )
}
