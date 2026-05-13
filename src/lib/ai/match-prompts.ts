/**
 * AI 환자-의사 매칭 프롬프트.
 *
 * 시스템 프롬프트 + 의사 카탈로그는 거의 변하지 않으니 Claude prompt caching
 * 으로 묶어서 호출 비용을 90% 가깝게 줄인다. 환자 쿼리만 매 호출 다르다.
 */

export const MATCH_SYSTEM_PROMPT = `너는 한국 정신건강의학과 의원을 환자에게 추천해주는 매칭 도우미야.

## 역할
환자가 자기 상황·증상·원하는 스타일을 자유롭게 적으면, 제공된 의사 카탈로그
중에서 **가장 잘 맞는 의사 3명**을 골라서 \`recommend_doctors\` tool 로
반환한다.

## 매칭 기준 (우선순위 순)
1. **전문분야 일치** — 환자가 호소하는 증상(우울, 불안, ADHD, 공황, 불면 등)을
   다루는 의사를 우선. specialties / treatments 필드 활용.
2. **환자군 적합성** — targetPatients 필드. 청소년·여성·직장인·노인 등.
3. **진료 스타일** — 환자가 원하는 분위기(공감적, 단호한, 약 위주, 상담 위주
   등). keywords / bio 필드.
4. **지역 접근성** — 환자가 지역을 명시했으면 region / district 우선.
   명시 안 했으면 지역은 무시하고 위 1-3번에 집중.
5. **다양성** — 가능하면 한 의원에 몰리지 않게 분산. 비슷한 의사 3명보단
   서로 다른 강점의 의사 3명이 환자 입장에서 도움.

## 핵심 규칙
1. **반드시 카탈로그 안의 의사만 추천.** slug 를 정확히 옮길 것. 카탈로그에
   없는 의사를 만들어내지 않는다.
2. **추천 이유는 환자가 읽고 이해할 한국어로 1-2문장.** "OO 증상을 주로 다루고,
   OO 스타일로 진료해서 잘 맞을 거예요" 형태. 의사 이름·병원명 반복 금지
   (UI 가 이미 보여주니까).
3. **환자가 호소하지 않은 증상은 끌어들이지 않는다.** 환자가 "잠이 안 와요"
   라고만 했는데 "ADHD 진단도 가능해요" 같은 헛다리 금지.
4. **확신이 부족하면 추천 수를 줄여도 OK** — 정말 맞는 의사가 2명뿐이면 2명만.
   억지로 3명 채우지 말 것.
5. **민감 표현 주의** — 환자 호소 내용을 그대로 옮겨 의사 평가하지 말고,
   "환자가 호소한 OO에 대해" 정도로 중립적으로.

## 응답 방식
**반드시 \`recommend_doctors\` tool 을 호출해서 응답**한다. 일반 텍스트로
응답하지 말 것.
`

export const MATCH_TOOL = {
  name: "recommend_doctors",
  description:
    "Pick the top 1-3 doctors from the provided catalog that best fit the patient's query. Each pick includes the doctor's exact slug and a short Korean reason.",
  input_schema: {
    type: "object" as const,
    properties: {
      picks: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description:
                "의사의 slug. 카탈로그에 있는 값과 정확히 일치해야 함.",
            },
            reason: {
              type: "string",
              description:
                "환자에게 보여줄 추천 이유 (1-2문장, 한국어). 의사 이름·병원명 반복 금지.",
            },
          },
          required: ["slug", "reason"],
        },
      },
      caveat: {
        type: "string",
        description:
          "환자에게 추가로 안내할 짧은 한 줄 (선택). 예: '비슷한 의사가 더 있어요, 지역을 좁히면 정확도가 올라가요'.",
      },
    },
    required: ["picks"],
  },
}

export type DoctorCatalogEntry = {
  slug: string
  name: string
  hospital: string
  region: string
  district: string
  specialties: string[]
  keywords: string[]
  targetPatients: string[]
  treatments: string[]
  bio: string
}

/**
 * Doctor catalog as compact JSON-y text. Stable per cache window so prompt
 * caching kicks in. Render order matters — keep field order identical across
 * calls or cache misses every time.
 */
export function buildCatalogText(doctors: DoctorCatalogEntry[]): string {
  const lines = doctors.map((d) => {
    const parts = [
      `slug=${d.slug}`,
      `name=${d.name}`,
      `hospital=${d.hospital}`,
      `region=${d.region}`,
      `district=${d.district}`,
      `specialties=[${d.specialties.join(", ")}]`,
      `keywords=[${d.keywords.join(", ")}]`,
      `targetPatients=[${d.targetPatients.join(", ")}]`,
      `treatments=[${d.treatments.join(", ")}]`,
      `bio=${d.bio.slice(0, 300).replace(/\s+/g, " ").trim()}`,
    ]
    return `- ${parts.join(" | ")}`
  })
  return [
    "## 의사 카탈로그",
    `(총 ${doctors.length}명)`,
    "",
    ...lines,
  ].join("\n")
}

export function buildUserMessage(opts: {
  query: string
  region?: string | null
  targetPatient?: string | null
}): string {
  const filters: string[] = []
  if (opts.region) filters.push(`선호 지역: ${opts.region}`)
  if (opts.targetPatient) filters.push(`환자 유형: ${opts.targetPatient}`)
  const filterLine = filters.length ? `\n[필터] ${filters.join(" / ")}` : ""

  return `환자가 보낸 매칭 요청:${filterLine}

[자유 입력]
${opts.query}

위 환자에게 가장 잘 맞는 의사 1-3명을 카탈로그에서 골라서 \`recommend_doctors\`
tool 로 답해줘. slug 는 카탈로그에 있는 값을 그대로 옮기고, 추천 이유는 환자
입장에서 한국어 1-2문장.`
}
