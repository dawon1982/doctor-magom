import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 해요"),
})
export type LoginInput = z.infer<typeof LoginSchema>

export const MagicLinkSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
})
export type MagicLinkInput = z.infer<typeof MagicLinkSchema>

export const SignupSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 해요"),
  displayName: z.string().min(1, "이름을 입력해주세요").max(40),
})
export type SignupInput = z.infer<typeof SignupSchema>

/** 가입 2단계: CRM 옵션 필드. 전체 skip 가능. */
export const PatientCrmSchema = z.object({
  ageRange: z.string().max(20).optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  preferredRegion: z.string().max(40).optional().nullable(),
  primaryConcern: z.string().max(120).optional().nullable(),
  marketingConsent: z.coerce.boolean().optional().default(false),
})
export type PatientCrmInput = z.infer<typeof PatientCrmSchema>

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v.trim() : null))

const optionalBool = z.coerce.boolean().optional().default(false)

export const DoctorApplicationSchema = z.object({
  applicantName: z.string().min(1, "이름을 입력해주세요").max(40),
  applicantEmail: z.string().email("올바른 이메일을 입력해주세요"),
  hospital: z.string().min(1, "병원명을 입력해주세요").max(80),
  hospitalPhone: optionalText(40),
  mobilePhone: optionalText(40),
  hasHospitalWebsite: optionalBool,
  hasPersonalWebsite: optionalBool,
  hasBlog: optionalBool,
  hasYoutube: optionalBool,
  hasInstagram: optionalBool,
  message: optionalText(2000),
})
export type DoctorApplicationInput = z.infer<typeof DoctorApplicationSchema>

const REGION = z.enum(["서울", "경기", "인천", "기타"])

export const DoctorProfileSchema = z.object({
  name: z.string().min(1).max(40),
  hospital: z.string().min(1).max(120),
  location: z.string().min(1).max(120),
  district: z.string().min(1).max(40),
  region: REGION,
  specialties: z.array(z.string().max(40)).max(40),
  keywords: z.array(z.string().max(40)).max(40),
  targetPatients: z.array(z.string().max(40)).max(40),
  treatments: z.array(z.string().max(40)).max(40),
  bio: z.string().max(4000),
  hours: z.array(z.object({ day: z.string().max(40), time: z.string().max(40) })).max(20),
  lunchBreak: z.string().max(40).optional().nullable(),
  closedDays: z.string().max(80).optional().nullable(),
  reviewKeywords: z
    .array(z.object({ text: z.string().max(80), count: z.coerce.number().int().nonnegative() }))
    .max(20),
  kakaoUrl: z.string().url().max(300).optional().nullable(),
  websiteUrl: z.string().url().max(300).optional().nullable(),
  youtubeChannelUrl: z.string().url().max(300).optional().nullable(),
  photoPlaceholderColor: z.string().max(20).default("#D4895A"),
  isPublished: z.coerce.boolean().optional().default(true),
})
export type DoctorProfileInput = z.infer<typeof DoctorProfileSchema>

/** Admin-only: slug is editable. */
export const DoctorAdminSchema = DoctorProfileSchema.extend({
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "영어 소문자·숫자·하이픈만 가능해요"),
})
export type DoctorAdminInput = z.infer<typeof DoctorAdminSchema>
