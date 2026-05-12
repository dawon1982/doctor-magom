/**
 * Plain-HTML email templates. Keep simple until magom.io is on Resend —
 * then we can swap to React Email components without touching call sites
 * because callers reference templates by name through `sendEmail()`.
 */

export type EmailPayload = { subject: string; html: string; text: string }

export type TemplateName =
  | "applicationReceived"
  | "applicationApproved"
  | "patientWelcome"

type TemplateFn = (data: Record<string, string>) => EmailPayload

const wrap = (title: string, body: string) => `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,'Noto Sans KR',sans-serif;line-height:1.6;color:#222;max-width:560px;margin:0 auto;padding:32px 24px">
  <p style="font-size:22px;margin:0 0 16px"><span style="font-size:28px">🐻</span> <strong>닥터마음곰</strong></p>
  <h1 style="font-size:20px;margin:24px 0 12px">${title}</h1>
  ${body}
  <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px">
  <p style="font-size:12px;color:#888">닥터마음곰 — 마음이 맞는 정신건강의학과 선생님을 찾아드려요.<br>이 메일은 발신 전용입니다.</p>
</body></html>`

const TEMPLATES: Record<TemplateName, TemplateFn> = {
  applicationReceived: ({ name = "선생님", hospital = "" }) => ({
    subject: `[닥터마음곰] 입점 신청을 잘 받았어요`,
    html: wrap(
      `${name} 선생님, 입점 신청 잘 받았어요`,
      `<p>${hospital ? `${hospital}의 ` : ""}프로필 등록을 신청해주셔서 감사합니다.</p>
       <p>운영팀이 보내주신 자료를 검토한 뒤, 영업일 기준 3일 이내에 별도 이메일로 답변드릴게요.</p>`,
    ),
    text: `${name} 선생님, 입점 신청 잘 받았어요. 운영팀이 영업일 3일 내에 답변드립니다.`,
  }),

  applicationApproved: ({ name = "선생님", inviteUrl = "" }) => ({
    subject: `[닥터마음곰] 입점이 승인되었어요`,
    html: wrap(
      `${name} 선생님, 입점이 승인되었어요!`,
      `<p>닥터마음곰에 입점이 승인되었습니다. 아래 링크에서 계정을 만드시고 본인 프로필을 직접 편집해보세요.</p>
       ${inviteUrl ? `<p><a href="${inviteUrl}" style="display:inline-block;background:#D4895A;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">계정 만들기</a></p>` : ""}
       <p>문의 사항이 있으시면 contact@magom.io 로 회신 주세요.</p>`,
    ),
    text: `${name} 선생님, 입점이 승인되었어요. ${inviteUrl ? `초대 링크: ${inviteUrl}` : ""}`,
  }),

  patientWelcome: ({ displayName = "님" }) => ({
    subject: `[닥터마음곰] 가입을 환영해요`,
    html: wrap(
      `${displayName}님, 가입을 환영합니다`,
      `<p>닥터마음곰은 환자가 선생님의 영상·말투·진료 스타일을 미리 보고 직접 매칭할 수 있는 정신건강의학과 전문의 디렉터리입니다.</p>
       <p><a href="https://doctor-magom.vercel.app/doctors" style="color:#D4895A">선생님 찾아보러 가기 →</a></p>`,
    ),
    text: `${displayName}님, 닥터마음곰 가입을 환영합니다.`,
  }),
}

export function renderTemplate(
  name: TemplateName,
  data: Record<string, string> = {},
): EmailPayload {
  const fn = TEMPLATES[name]
  if (!fn) throw new Error(`Unknown email template: ${name}`)
  return fn(data)
}
