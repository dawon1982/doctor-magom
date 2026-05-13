import { z } from "zod"

/** Patient-side match request. Anonymous, no auth. */
export const MatchInputSchema = z.object({
  query: z
    .string()
    .min(10, "조금 더 자세히 적어주세요 (최소 10자)")
    .max(2000, "내용이 너무 길어요. 핵심만 2000자 이내로."),
  region: z
    .union([z.enum(["서울", "경기", "인천", "기타"]), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  targetPatient: z
    .string()
    .max(40)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
})
export type MatchInput = z.infer<typeof MatchInputSchema>

/** AI tool response shape. */
export const MatchPicksSchema = z.object({
  picks: z
    .array(
      z.object({
        slug: z.string().min(1).max(120),
        reason: z.string().min(5).max(400),
      }),
    )
    .min(1)
    .max(3),
  caveat: z.string().max(200).optional(),
})
export type MatchPicks = z.infer<typeof MatchPicksSchema>
