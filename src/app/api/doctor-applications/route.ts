import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { DoctorApplicationSchema } from "@/lib/validation/auth"
import { sendEmail } from "@/lib/email/resend"
import { checkIpRateLimit } from "@/lib/security/rate-limit"

// This endpoint both writes a row and sends mail to an address the caller
// chooses, so it's a spam/mail-relay amplifier if left open. Nobody legitimately
// applies more than a few times an hour.
const PER_IP_PER_HOUR = 3

export async function POST(req: NextRequest) {
  const limit = checkIpRateLimit({
    bucket: "doctor-applications",
    headers: req.headers,
    limit: PER_IP_PER_HOUR,
    windowMs: 60 * 60_000,
  })
  if (!limit.ok) {
    return NextResponse.json(
      { error: "신청이 너무 잦아요. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 })
  }

  const parsed = DoctorApplicationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctor_applications")
    .insert({
      applicant_email: parsed.data.applicantEmail,
      applicant_name: parsed.data.applicantName,
      hospital: parsed.data.hospital,
      hospital_phone: parsed.data.hospitalPhone,
      mobile_phone: parsed.data.mobilePhone,
      has_hospital_website: parsed.data.hasHospitalWebsite,
      has_personal_website: parsed.data.hasPersonalWebsite,
      has_blog: parsed.data.hasBlog,
      has_youtube: parsed.data.hasYoutube,
      has_instagram: parsed.data.hasInstagram,
      message: parsed.data.message,
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json(
      { error: "저장에 실패했어요. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    )
  }

  // The application is already saved at this point. sendEmail swallows Resend
  // failures itself, but its email_log write can still throw — never let a mail
  // problem turn a successful application into a 500 the applicant retries.
  try {
    await sendEmail({
      template: "applicationReceived",
      to: parsed.data.applicantEmail,
      data: {
        name: parsed.data.applicantName,
        hospital: parsed.data.hospital,
      },
      relatedId: data.id,
    })
  } catch (err) {
    console.error("[doctor-applications] confirmation email failed:", err)
  }

  return NextResponse.json({ ok: true })
}
