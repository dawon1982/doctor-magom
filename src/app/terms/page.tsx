import type { Metadata } from "next"
import Link from "next/link"
import { SITE_NAME } from "@/lib/site"

export const metadata: Metadata = {
  title: "이용약관",
  description: `${SITE_NAME} 서비스 이용 조건과 이용자·의료기관의 책임을 안내합니다.`,
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
}

const UPDATED_AT = "2026년 7월 31일"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-extrabold">이용약관</h1>
      <p className="mt-2 text-sm text-muted-foreground">시행일 {UPDATED_AT}</p>

      <div className="mt-10 space-y-10">
        <Section title="1. 서비스의 성격">
          <p>
            {SITE_NAME}은 정신건강의학과 의료기관과 의사의 공개된 정보를 모아
            보여주는 정보 제공 서비스입니다. 의료행위를 하지 않으며, 진료 예약의
            당사자가 아닙니다.
          </p>
          <p className="rounded-xl border border-border bg-muted/50 p-4 text-foreground">
            본 서비스가 제공하는 정보와 AI 추천은 참고용이며, 의학적 진단·치료를
            대체하지 않습니다. 증상에 대한 판단과 치료는 반드시 의료기관에서
            의사와 직접 상담하시기 바랍니다.
          </p>
        </Section>

        <Section title="2. 응급 상황">
          <p>
            본 서비스는 응급 상황에 대응하지 않습니다. 자살 생각이나 자해 충동이
            있으시다면{" "}
            <a href="tel:109" className="font-medium text-foreground underline">
              자살예방상담 109
            </a>{" "}
            또는{" "}
            <a
              href="tel:1577-0199"
              className="font-medium text-foreground underline"
            >
              정신건강상담 1577-0199
            </a>
            로 연락해주세요. 생명이 위급한 상황이라면 119에 신고해주세요.
          </p>
        </Section>

        <Section title="3. 게시 정보의 출처와 정확성">
          <p>
            의사·의료기관 정보는 해당 의료기관이 제공했거나 공개된 자료를 바탕으로
            게시하며, 진료시간·연락처 등은 변경될 수 있습니다. 방문 전 해당
            의료기관에 직접 확인하시기 바랍니다.
          </p>
          <p>
            정보에 오류가 있는 경우 아래 연락처로 알려주시면 확인 후 수정합니다.
          </p>
        </Section>

        <Section title="4. 후기 작성 규칙">
          <p>이용자는 실제 방문 경험을 바탕으로 후기를 작성할 수 있습니다.</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              치료 효과나 완치를 단정·보장하는 내용, 다른 의료기관을 비방하는
              내용은 작성할 수 없습니다.
            </li>
            <li>
              타인의 개인정보나 진료 내용을 포함할 수 없습니다.
            </li>
            <li>
              허위·광고성 후기, 대가를 받고 작성한 후기는 금지되며 발견 시 삭제될
              수 있습니다.
            </li>
          </ul>
          <p>
            후기는 작성자 개인의 경험이며 {SITE_NAME}의 의견이 아닙니다. 동일한
            결과를 보장하지 않습니다.
          </p>
        </Section>

        <Section title="5. 금지 행위">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>자동화 수단을 이용한 대량 조회·수집</li>
            <li>서비스 운영을 방해하는 과도한 요청</li>
            <li>타인의 계정을 도용하거나 허위 정보로 가입하는 행위</li>
            <li>게시된 정보를 무단으로 복제해 상업적으로 이용하는 행위</li>
          </ul>
        </Section>

        <Section title="6. 의료기관 입점">
          <p>
            의료기관의 입점 신청과 게재는 별도 협의에 따르며, 게재된 내용에 대한
            책임은 정보를 제공한 의료기관에 있습니다. 의료광고에 해당하는 내용은
            의료법 등 관계 법령을 준수해야 합니다.
          </p>
        </Section>

        <Section title="7. 책임의 제한">
          <p>
            {SITE_NAME}은 이용자와 의료기관 사이에 발생한 진료·예약·비용 관련
            분쟁의 당사자가 아니며, 이에 대해 책임을 지지 않습니다. 다만 서비스
            운영상 고의 또는 중대한 과실이 있는 경우에는 그러하지 않습니다.
          </p>
        </Section>

        <Section title="8. 약관의 변경">
          <p>
            본 약관이 변경되는 경우 시행일과 변경 내용을 이 페이지에 공지합니다.
            문의는{" "}
            <a
              href="mailto:contact@magom.io"
              className="font-medium text-foreground underline"
            >
              contact@magom.io
            </a>
            로 보내주세요.
          </p>
        </Section>
      </div>

      <div className="mt-12 border-t border-border pt-6">
        <Link
          href="/privacy"
          className="text-sm font-medium text-primary hover:underline"
        >
          개인정보처리방침 보기 →
        </Link>
      </div>
    </div>
  )
}
