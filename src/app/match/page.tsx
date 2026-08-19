import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import MatchForm from "./MatchForm"
import { CrisisNotice } from "@/components/safety/CrisisNotice"
import { AI_MATCH_ENABLED } from "@/lib/flags"

export const metadata: Metadata = {
  title: "AI 의사 추천",
  description:
    "내 상황·증상·원하는 진료 스타일을 자유롭게 적으면 AI가 닥터마음곰에 등록된 정신건강의학과 의사 중에서 가장 잘 맞는 3명을 골라드려요. 익명, 무료.",
  alternates: { canonical: "/match" },
  openGraph: {
    title: "AI 의사 추천 | 닥터마음곰",
    description: "내 상황에 맞는 정신건강의학과 의사를 AI가 골라드려요",
    type: "website",
  },
}

export default function MatchPage() {
  if (!AI_MATCH_ENABLED) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <p className="text-sm text-primary font-medium mb-2">AI 추천</p>
        <h1 className="text-3xl font-bold mb-2 leading-tight">
          AI 추천은 잠시 쉬어가는 중이에요
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          지금은 AI 추천을 잠시 멈추고 정비하고 있어요. 그동안은 선생님
          목록에서 지역·진료 분야로 직접 찾아보실 수 있어요 — 모든 선생님
          프로필에 진료 스타일과 예약 방법이 정리되어 있습니다.
        </p>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          선생님 목록에서 찾아보기 <ArrowRight size={15} />
        </Link>
        <div className="mt-10">
          <CrisisNotice compact />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <p className="text-sm text-primary font-medium mb-2">AI 추천</p>
      <h1 className="text-3xl font-bold mb-2 leading-tight">
        나에게 맞는 의사 찾기
      </h1>
      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        의사가 너무 많아서 누구를 골라야 할지 막막하다면 — 지금 어떤 상황인지
        몇 줄 적어주세요. 닥터마음곰이 등록된 정신건강의학과 의사 프로필을
        분석해서 잘 맞을 만한 분 3명을 골라드려요.
      </p>
      <MatchForm />
    </div>
  )
}
