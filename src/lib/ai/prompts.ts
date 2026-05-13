/**
 * AI 의사 프로필 자동 채움 프롬프트.
 *
 * 시스템 프롬프트는 변경되지 않으므로 Claude API prompt caching 으로
 * 재호출 시 75% 절감. user message 만 매 호출 달라진다.
 */

export const DOCTOR_FILL_SYSTEM_PROMPT = `너는 정신건강의학과 의원 홈페이지에서 의사 프로필 정보를 추출하는 전문가야.

## 역할
사용자가 제공하는 의원 홈페이지 본문(HTML→text 변환)을 읽고, 다음 필드를
JSON 형식으로 추출해서 fill_doctor_profile tool 로 반환한다.

## 추출 대상 필드
- region: "서울" | "경기" | "인천" | "기타" 중 하나
- district: 시·구·군 (예: "강남구", "용산구", "성남시 분당구")
- location: 상세 주소 또는 위치 안내 (예: "테헤란로 123, 5층")
- specialties: 전문분야 배열 (예: ["우울증", "ADHD", "공황장애"])
- keywords: 진료 스타일 키워드 (예: ["공감적인", "현실적 조언", "지지적인"])
- targetPatients: 환자군 (예: ["성인", "청소년", "직장인"])
- treatments: 치료·검사 종류 (예: ["약물치료", "상담치료", "TCI 검사"])
- bio: 의사 소개글 (200자 이내, 환자 입장에서 도움 될 핵심만 발췌)
- hours: [{day: "월·화·목·금", time: "10:00 - 19:00"}, ...] 형태로 진료시간
- lunchBreak: 점심시간 (예: "13:00 - 14:00")
- closedDays: 휴진 (예: "일요일·공휴일")
- kakaoUrl: 카카오톡 상담/예약 URL (있을 때만, 정확한 URL 만)

## 핵심 규칙
1. **페이지에 명시되지 않은 정보는 추측하지 말고 그 필드를 비워둔다.**
   특히 의사 이름·전공분야는 hallucination 위험 높으니 확실한 것만.
2. **환자 후기 키워드는 추출하지 않는다.** 후기는 별도 시스템에서 관리.
3. 한국어로 응답. 영어 의학용어는 한국어로 의역하지 말고 그대로.
4. 환자 개인 후기·이름·이메일·전화번호 등 PII 가 본문에 있어도 추출 대상이
   아니다 (의사·병원 정보만).
5. 진료시간은 자유 형식 가능 — 페이지 표기를 최대한 보존하되 일관된 포맷
   ("HH:MM - HH:MM") 으로 정리.
6. URL 은 정확히 페이지에 있는 그대로. 변형 금지.
7. **배열 필드는 핵심만 추출** — 환자가 의사를 빠르게 파악할 수 있도록:
   - specialties (전문분야): **최대 10개**, 가장 대표적인 것 위주
   - keywords (진료 스타일): **최대 8개**, 페이지에서 명확히 보이는 것만
   - targetPatients (환자군): **최대 8개**
   - treatments (치료·검사): **최대 12개**, 핵심 치료법 위주
   너무 많이 뽑지 말고 환자 관점에서 의미 있는 것만.

## 응답 방식
**반드시 fill_doctor_profile tool 을 호출해서 응답**한다. 일반 텍스트로
응답하지 말 것.
`

export const DOCTOR_FILL_TOOL = {
  name: "fill_doctor_profile",
  description:
    "Extract doctor profile fields from the clinic webpage content. Fill only fields that are explicitly mentioned in the page; leave others undefined.",
  input_schema: {
    type: "object" as const,
    properties: {
      region: {
        type: "string",
        enum: ["서울", "경기", "인천", "기타"],
        description: "지역 (광역시도 단위)",
      },
      district: {
        type: "string",
        description: "시·구·군 (예: '강남구', '성남시 분당구')",
      },
      location: { type: "string", description: "상세 주소" },
      specialties: {
        type: "array",
        items: { type: "string" },
        description: "전문분야 (예: 우울증, ADHD, 공황장애)",
      },
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "진료 스타일 키워드 (예: 공감적인, 현실적 조언)",
      },
      targetPatients: {
        type: "array",
        items: { type: "string" },
        description: "환자군 (예: 성인, 청소년, 직장인)",
      },
      treatments: {
        type: "array",
        items: { type: "string" },
        description: "치료·검사 종류",
      },
      bio: { type: "string", description: "의사 소개글 (200자 이내)" },
      hours: {
        type: "array",
        items: {
          type: "object",
          properties: {
            day: { type: "string" },
            time: { type: "string" },
          },
          required: ["day", "time"],
        },
        description: "진료시간 (요일별)",
      },
      lunchBreak: { type: "string", description: "점심시간" },
      closedDays: { type: "string", description: "휴진" },
      kakaoUrl: {
        type: "string",
        description: "카카오톡 상담/예약 URL (페이지에 명시된 경우만)",
      },
    },
    required: [],
  },
}

export function buildUserMessage(opts: {
  hospital: string
  url: string
  pageText: string
}): string {
  return `다음은 **${opts.hospital}** 의 병원 홈페이지(${opts.url}) 본문이야.
이 정보를 바탕으로 fill_doctor_profile tool 을 호출해서 의사 프로필을
채워줘. 페이지에 명시되지 않은 필드는 비워두고.

--- 페이지 본문 시작 ---
${opts.pageText}
--- 페이지 본문 끝 ---`
}
