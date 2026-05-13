import type { Metadata } from "next"
import ApplyForm from "./ApplyForm"

export const metadata: Metadata = {
  title: "의사 입점 신청",
  description:
    "정신건강의학과 전문의로서 닥터마음곰에 입점을 신청해주세요. 영상·기고글·블로그 등 보유 채널만 알려주시면 운영팀이 직접 프로필을 만들어드려요.",
  alternates: { canonical: "/apply" },
  openGraph: {
    title: "의사 입점 신청 | 닥터마음곰",
    description: "정신건강의학과 전문의 파트너 모집",
    type: "website",
  },
}

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <p className="text-sm text-primary font-medium mb-2">파트너십</p>
      <h1 className="text-2xl font-bold mb-2">의사 입점 신청</h1>
      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        닥터마음곰은 자발적으로 자료를 제출해주신 선생님만 소개해요.
        영상, 사진, 블로그 등 보유한 자료를 알려주시면 운영팀이 검토 후 영업일 기준 3일 이내에 회신드립니다.
      </p>
      <ApplyForm />
    </div>
  )
}
