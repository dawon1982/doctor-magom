import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { DoctorApplicationSchema } from "@/lib/validation/auth"
import { sendEmail } from "@/lib/email/resend"

export async function POST(req: NextRequest) {
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
      phone: parsed.data.phone ?? null,
      message: parsed.data.message ?? null,
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json(
      { error: "저장에 실패했어요. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    )
  }

  await sendEmail({
    template: "applicationReceived",
    to: parsed.data.applicantEmail,
    data: {
      name: parsed.data.applicantName,
      hospital: parsed.data.hospital,
    },
    relatedId: data.id,
  })

  return NextResponse.json({ ok: true })
}
