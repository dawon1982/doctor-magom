"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import {
  LoginSchema,
  MagicLinkSchema,
  SignupSchema,
  PatientCrmSchema,
} from "@/lib/validation/auth"
import { sendEmail } from "@/lib/email/resend"

export type ActionState = { error?: string; ok?: boolean; message?: string }

async function siteOrigin() {
  const h = await headers()
  const proto = h.get("x-forwarded-proto") ?? "https"
  const host = h.get("host") ?? "doctor-magom.vercel.app"
  return `${proto}://${host}`
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: "로그인에 실패했어요. 이메일과 비밀번호를 확인해주세요." }

  const next = String(formData.get("next") ?? "") || "/"
  redirect(next)
}

export async function magicLinkAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = MagicLinkSchema.safeParse({ email: formData.get("email") })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "이메일을 확인해주세요" }
  }
  const supabase = await createClient()
  const origin = await siteOrigin()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })
  if (error) return { error: "매직링크 발송에 실패했어요." }
  return { ok: true, message: "이메일을 확인해 로그인 링크를 눌러주세요." }
}

export async function signupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = SignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" }
  }
  const supabase = await createClient()
  const { error: signupErr } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${await siteOrigin()}/auth/callback`,
    },
  })
  if (signupErr) return { error: signupErr.message }

  // If email confirmation is disabled in the Supabase project, the user
  // is signed in immediately. Persist the CRM seed row and fire the
  // welcome email. If confirmation is on, this branch silently no-ops
  // until the confirmation lands at /auth/callback.
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from("patient_signups").insert({
      user_id: user.id,
      email: parsed.data.email,
      display_name: parsed.data.displayName,
    })
    await sendEmail({
      template: "patientWelcome",
      to: parsed.data.email,
      data: { displayName: parsed.data.displayName },
      relatedId: user.id,
    })
    redirect("/onboarding")
  }

  return {
    ok: true,
    message: "이메일을 확인해 가입을 완료해주세요. 링크를 누른 뒤 다시 로그인하면 됩니다.",
  }
}

export async function completeOnboardingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = PatientCrmSchema.safeParse({
    ageRange: formData.get("ageRange") || null,
    gender: formData.get("gender") || null,
    preferredRegion: formData.get("preferredRegion") || null,
    primaryConcern: formData.get("primaryConcern") || null,
    marketingConsent: formData.get("marketingConsent") ?? false,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요해요." }

  const { error } = await supabase
    .from("patient_signups")
    .upsert(
      {
        user_id: user.id,
        email: user.email ?? "",
        age_range: parsed.data.ageRange ?? null,
        gender: parsed.data.gender ?? null,
        preferred_region: parsed.data.preferredRegion ?? null,
        primary_concern: parsed.data.primaryConcern ?? null,
        marketing_consent: parsed.data.marketingConsent ?? false,
      },
      { onConflict: "user_id" },
    )
  if (error) return { error: "저장에 실패했어요. 잠시 후 다시 시도해주세요." }

  redirect("/")
}
