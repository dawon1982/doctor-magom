/**
 * Hand-maintained DB types matching `supabase/migrations/*.sql`.
 *
 * The Supabase CLI's `gen types typescript` needs an access token to fetch
 * the live schema, which adds a CI dependency we don't want. Instead we
 * keep this in sync with the migration files. When you add a column or a
 * table:
 *   1. Update the migration SQL
 *   2. Mirror the same change here
 *   3. The Database type below is used as the generic for all supabase
 *      clients, so usages get type-checked automatically
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
  /** Added in migration 005 */
  youtube_channel_url: string | null
  photo_placeholder_color: string
  /** Added in migration 009 — public Supabase Storage URL */
  photo_url: string | null
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

/**
 * doctor_applications: split phone fields + channel URL fields (migration 002),
 * has_* boolean channel flags (migration 003).
 */
export type DoctorApplicationRow = {
  id: string
  applicant_email: string
  applicant_name: string
  hospital: string
  hospital_phone: string | null
  mobile_phone: string | null
  hospital_website: string | null
  personal_website: string | null
  blog_url: string | null
  youtube_url: string | null
  instagram_url: string | null
  has_hospital_website: boolean
  has_personal_website: boolean
  has_blog: boolean
  has_youtube: boolean
  has_instagram: boolean
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

/** Added in migration 006 — patient match query telemetry. */
export type MatchQueryRow = {
  id: string
  created_at: string
  query: string
  region: string | null
  target_patient: string | null
  recommended_slugs: string[]
  input_tokens: number | null
  output_tokens: number | null
  cached_read_tokens: number | null
  error: string | null
}

/** Added in migration 007 — patient bookmarks. Composite PK (user_id, doctor_id). */
export type FavoriteRow = {
  user_id: string
  doctor_id: string
  created_at: string
}

/** Added in migration 008 — patient reviews. */
export type DoctorReviewRow = {
  id: string
  user_id: string
  doctor_id: string
  rating: number
  body: string
  is_published: boolean
  is_hidden_by_admin: boolean
  created_at: string
  updated_at: string
}

/**
 * Database generic consumed by `@supabase/ssr` and `@supabase/supabase-js`.
 * Per-table Insert types omit the columns the DB fills (id, created_at,
 * defaults) and accept partials for the rest.
 */
export type Database = {
  public: {
    Tables: {
      doctors: {
        Row: DoctorRow
        Insert: Partial<DoctorRow> &
          Pick<DoctorRow, "slug" | "name" | "hospital" | "location" | "district" | "region">
        Update: Partial<DoctorRow>
        Relationships: []
      }
      doctor_videos: {
        Row: DoctorVideoRow
        Insert: Partial<DoctorVideoRow> &
          Pick<DoctorVideoRow, "doctor_id" | "url" | "title">
        Update: Partial<DoctorVideoRow>
        Relationships: []
      }
      doctor_articles: {
        Row: DoctorArticleRow
        Insert: Partial<DoctorArticleRow> &
          Pick<DoctorArticleRow, "doctor_id" | "url" | "title">
        Update: Partial<DoctorArticleRow>
        Relationships: []
      }
      profiles: {
        Row: ProfileRow
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id">
        Update: Partial<ProfileRow>
        Relationships: []
      }
      doctor_applications: {
        Row: DoctorApplicationRow
        Insert: Partial<DoctorApplicationRow> &
          Pick<DoctorApplicationRow, "applicant_email" | "applicant_name" | "hospital">
        Update: Partial<DoctorApplicationRow>
        Relationships: []
      }
      patient_signups: {
        Row: PatientSignupRow
        Insert: Partial<PatientSignupRow> & Pick<PatientSignupRow, "email">
        Update: Partial<PatientSignupRow>
        Relationships: []
      }
      email_log: {
        Row: EmailLogRow
        Insert: Partial<EmailLogRow> &
          Pick<EmailLogRow, "template" | "to_email">
        Update: Partial<EmailLogRow>
        Relationships: []
      }
      match_queries: {
        Row: MatchQueryRow
        Insert: Partial<MatchQueryRow> & Pick<MatchQueryRow, "query">
        Update: Partial<MatchQueryRow>
        Relationships: []
      }
      favorites: {
        Row: FavoriteRow
        Insert: Partial<FavoriteRow> & Pick<FavoriteRow, "user_id" | "doctor_id">
        Update: Partial<FavoriteRow>
        Relationships: []
      }
      doctor_reviews: {
        Row: DoctorReviewRow
        Insert: Partial<DoctorReviewRow> &
          Pick<DoctorReviewRow, "user_id" | "doctor_id" | "rating" | "body">
        Update: Partial<DoctorReviewRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: Record<string, never>
  }
}
