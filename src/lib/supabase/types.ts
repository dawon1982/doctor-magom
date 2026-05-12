/**
 * Hand-maintained DB types for Phase 2.
 *
 * Once the Supabase project exists, regenerate this file with:
 *   npx supabase gen types typescript --project-id <id> --schema public > src/lib/supabase/types.ts
 */
export type Role = "patient" | "doctor" | "admin"
export type Region = "서울" | "경기" | "인천" | "기타"
export type ApplicationStatus = "pending" | "contacted" | "approved" | "rejected"
export type ArticlePlatform = "naver" | "other"
export type EmailStatus = "queued" | "sent" | "failed" | "skipped"

export type Hour = { day: string; time: string }
export type ReviewKeyword = { text: string; count: number }

export type DoctorRow = {
  id: string
  slug: string
  name: string
  hospital: string
  location: string
  district: string
  region: Region
  specialties: string[]
  keywords: string[]
  target_patients: string[]
  treatments: string[]
  bio: string
  hours: Hour[]
  lunch_break: string | null
  closed_days: string | null
  review_keywords: ReviewKeyword[]
  kakao_url: string | null
  website_url: string | null
  photo_placeholder_color: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export type DoctorVideoRow = {
  id: string
  doctor_id: string
  url: string
  title: string
  date: string | null
  sort_order: number
  created_at: string
}

export type DoctorArticleRow = {
  id: string
  doctor_id: string
  url: string
  title: string
  date: string | null
  platform: ArticlePlatform
  sort_order: number
  created_at: string
}

export type ProfileRow = {
  id: string
  role: Role
  display_name: string | null
  doctor_id: string | null
  created_at: string
  updated_at: string
}

export type DoctorApplicationRow = {
  id: string
  applicant_email: string
  applicant_name: string
  hospital: string
  phone: string | null
  message: string | null
  status: ApplicationStatus
  approved_doctor_id: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export type PatientSignupRow = {
  id: string
  user_id: string | null
  email: string
  display_name: string | null
  age_range: string | null
  gender: string | null
  preferred_region: string | null
  primary_concern: string | null
  marketing_consent: boolean
  source: string | null
  created_at: string
}

export type EmailLogRow = {
  id: string
  template: string
  to_email: string
  related_id: string | null
  status: EmailStatus
  resend_id: string | null
  error: string | null
  created_at: string
}

/** Minimal shape that satisfies `@supabase/ssr` and `@supabase/supabase-js`. */
export type Database = {
  public: {
    Tables: {
      doctors:             { Row: DoctorRow;             Insert: Partial<DoctorRow>             & Pick<DoctorRow, "slug"|"name"|"hospital"|"location"|"district"|"region">; Update: Partial<DoctorRow> }
      doctor_videos:       { Row: DoctorVideoRow;        Insert: Omit<DoctorVideoRow, "id"|"created_at">;                Update: Partial<DoctorVideoRow> }
      doctor_articles:     { Row: DoctorArticleRow;      Insert: Omit<DoctorArticleRow, "id"|"created_at">;              Update: Partial<DoctorArticleRow> }
      profiles:            { Row: ProfileRow;            Insert: Partial<ProfileRow> & Pick<ProfileRow, "id">;            Update: Partial<ProfileRow> }
      doctor_applications: { Row: DoctorApplicationRow;  Insert: Omit<DoctorApplicationRow, "id"|"created_at"|"status"> & { status?: ApplicationStatus }; Update: Partial<DoctorApplicationRow> }
      patient_signups:     { Row: PatientSignupRow;      Insert: Omit<PatientSignupRow, "id"|"created_at"|"marketing_consent"|"source"> & { marketing_consent?: boolean; source?: string }; Update: Partial<PatientSignupRow> }
      email_log:           { Row: EmailLogRow;           Insert: Omit<EmailLogRow, "id"|"created_at"|"status"> & { status?: EmailStatus }; Update: Partial<EmailLogRow> }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: Record<string, never>
  }
}
