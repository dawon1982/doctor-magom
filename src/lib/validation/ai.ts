import { z } from "zod"

/**
 * AI 가 의사 홈페이지를 읽고 채워주는 필드들.
 * DoctorProfileInput 의 subset 이며 **모두 optional** — AI 가 페이지에서
 * 발견 못 한 필드는 비워둔다. Admin 이 검토 후 저장하므로 hallucination
 * 위험은 줄여주고, 빈 값을 그냥 두라고 시스템 프롬프트에서 지시한다.
 *
 * 배열 필드는 AI 가 너무 많이 뽑아도 fail 하지 않게 max 를 넉넉히 두고
 * transform 으로 핵심 항목 수만 남긴다.
 */
const cappedStringArray = (maxItems: number, sliceTo: number) =>
  z
    .array(z.string().max(40))
    .max(maxItems)
    .transform((arr) => arr.slice(0, sliceTo))

export const AiDoctorFillSchema = z.object({
  region: z.enum(["서울", "경기", "인천", "기타"]).optional(),
  district: z.string().max(40).optional(),
  location: z.string().max(120).optional(),
  specialties: cappedStringArray(60, 15).optional(),
  keywords: cappedStringArray(40, 10).optional(),
  targetPatients: cappedStringArray(40, 10).optional(),
  treatments: cappedStringArray(60, 15).optional(),
  bio: z.string().max(2000).optional(),
  hours: z
    .array(
      z.object({
        day: z.string().max(40),
        time: z.string().max(40),
      }),
    )
    .max(20)
    .transform((arr) => arr.slice(0, 10))
    .optional(),
  lunchBreak: z.string().max(40).optional(),
  closedDays: z.string().max(80).optional(),
  kakaoUrl: z.string().url().max(300).optional(),
})

export type AiDoctorFill = z.infer<typeof AiDoctorFillSchema>
