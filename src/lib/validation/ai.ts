import { z } from "zod"

/**
 * AI 가 의사 홈페이지를 읽고 채워주는 필드들.
 * DoctorProfileInput 의 subset 이며 **모두 optional** — AI 가 페이지에서
 * 발견 못 한 필드는 비워둔다. Admin 이 검토 후 저장하므로 hallucination
 * 위험은 줄여주고, 빈 값을 그냥 두라고 시스템 프롬프트에서 지시한다.
 */
export const AiDoctorFillSchema = z.object({
  region: z.enum(["서울", "경기", "인천", "기타"]).optional(),
  district: z.string().max(40).optional(),
  location: z.string().max(120).optional(),
  specialties: z.array(z.string().max(40)).max(20).optional(),
  keywords: z.array(z.string().max(40)).max(20).optional(),
  targetPatients: z.array(z.string().max(40)).max(20).optional(),
  treatments: z.array(z.string().max(40)).max(20).optional(),
  bio: z.string().max(2000).optional(),
  hours: z
    .array(
      z.object({
        day: z.string().max(40),
        time: z.string().max(40),
      }),
    )
    .max(10)
    .optional(),
  lunchBreak: z.string().max(40).optional(),
  closedDays: z.string().max(80).optional(),
  kakaoUrl: z.string().url().max(300).optional(),
})

export type AiDoctorFill = z.infer<typeof AiDoctorFillSchema>
