import type { Metadata } from "next"
import Link from "next/link"
import { SITE_NAME } from "@/lib/site"

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${SITE_NAME}이 수집하는 개인정보의 항목과 이용·보관·파기 기준을 안내합니다.`,
  alternates: { canonical: "/privacy" },
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

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-extrabold">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        시행일 {UPDATED_AT}
      </p>

      <div className="mt-10 space-y-10">
        <Section title="1. 수집하는 개인정보 항목">
          <p>{SITE_NAME}은 다음의 정보를 수집합니다.</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">회원가입</strong> — 이메일,
              비밀번호(암호화 저장), 이름 또는 닉네임
            </li>
            <li>
              <strong className="text-foreground">온보딩(선택)</strong> — 연령대,
              성별, 관심 지역
            </li>
            <li>
              <strong className="text-foreground">AI 의사 추천</strong> — 이용자가
              직접 입력한 상황·증상 서술, 선호 지역, 환자 유형, 접속 IP를 복원
              불가능하게 해시한 값
            </li>
            <li>
              <strong className="text-foreground">후기 작성</strong> — 별점, 후기
              본문, 작성자 표시 이름
            </li>
            <li>
              <strong className="text-foreground">의사 입점 신청</strong> — 신청자
              이름, 이메일, 연락처, 소속 의료기관 정보
            </li>
            <li>
              <strong className="text-foreground">자동 수집</strong> — 로그인
              유지를 위한 쿠키, 외부 예약 링크 클릭 여부(의사 단위 집계)
            </li>
          </ul>
        </Section>

        <Section title="2. 민감정보 처리에 대한 안내">
          <p>
            AI 의사 추천 기능에 입력하시는 상황·증상 서술에는 건강에 관한 정보가
            포함될 수 있으며, 이는 개인정보 보호법상 민감정보에 해당합니다.
          </p>
          <p>
            해당 내용은 <strong className="text-foreground">추천 품질 개선과 서비스
            운영 점검 목적</strong>으로 저장되며, 회원 계정 정보와 연결하지 않는
            형태로 보관합니다. 저장을 원하지 않으시면 이 기능을 이용하지 않으셔도
            의사 목록·검색 기능은 그대로 사용하실 수 있습니다.
          </p>
          <p>
            입력하신 내용은 추천 생성을 위해 AI 처리 업체(Anthropic)로 전송되며,
            해당 업체는 이를 모델 학습에 사용하지 않습니다.
          </p>
        </Section>

        <Section title="3. 이용 목적">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>회원 식별 및 로그인 유지</li>
            <li>의사 추천·검색·즐겨찾기·비교 기능 제공</li>
            <li>후기 게시 및 부적절한 게시물 관리</li>
            <li>입점 신청 처리 및 회신</li>
            <li>서비스 이용 통계 분석과 품질 개선</li>
            <li>과도한 요청·자동화 접근 차단 등 서비스 보호</li>
          </ul>
        </Section>

        <Section title="4. 보유 및 파기">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>회원 정보 — 회원 탈퇴 시 지체 없이 파기</li>
            <li>후기 — 작성자가 삭제하거나 회원 탈퇴 시 함께 삭제</li>
            <li>
              AI 추천 입력 내용 — 수집일로부터 1년 보관 후 파기(계정과 연결되지
              않은 형태)
            </li>
            <li>입점 신청 정보 — 처리 완료 후 3년 보관 후 파기</li>
            <li>
              관계 법령에서 별도 보존을 요구하는 경우 해당 기간 동안 보관
            </li>
          </ul>
        </Section>

        <Section title="5. 제3자 제공 및 처리 위탁">
          <p>
            {SITE_NAME}은 이용자의 개인정보를 제3자에게 판매하거나 마케팅 목적으로
            제공하지 않습니다. 서비스 운영에 필요한 범위에서 다음 업체에 처리를
            위탁합니다.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Supabase — 데이터베이스 및 회원 인증</li>
            <li>Vercel — 웹 서비스 호스팅</li>
            <li>Anthropic — AI 의사 추천 생성</li>
            <li>Resend — 입점 신청 관련 이메일 발송</li>
          </ul>
        </Section>

        <Section title="6. 이용자의 권리">
          <p>
            이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를
            요청할 수 있습니다. 로그인 후 마이페이지에서 직접 수정하시거나, 아래
            연락처로 요청해주시면 지체 없이 처리합니다. 만 14세 미만 아동의
            회원가입은 받지 않습니다.
          </p>
        </Section>

        <Section title="7. 쿠키">
          <p>
            로그인 상태 유지와 테마(라이트·다크) 설정을 위해 필수 쿠키를
            사용합니다. 광고·추적 목적의 제3자 쿠키는 사용하지 않습니다. 브라우저
            설정에서 쿠키를 차단하면 로그인이 필요한 기능은 이용할 수 없습니다.
          </p>
        </Section>

        <Section title="8. 문의">
          <p>
            개인정보 관련 문의는{" "}
            <a
              href="mailto:contact@magom.io"
              className="font-medium text-foreground underline"
            >
              contact@magom.io
            </a>
            로 보내주세요.
          </p>
          <p>
            본 방침이 변경되는 경우 시행일과 변경 내용을 이 페이지에 공지합니다.
          </p>
        </Section>
      </div>

      <div className="mt-12 border-t border-border pt-6">
        <Link
          href="/terms"
          className="text-sm font-medium text-primary hover:underline"
        >
          이용약관 보기 →
        </Link>
      </div>
    </div>
  )
}
