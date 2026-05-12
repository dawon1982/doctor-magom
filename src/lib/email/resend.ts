import "server-only"
import { Resend } from "resend"
import { createAdminClient } from "@/lib/supabase/admin"
import { renderTemplate, type TemplateName } from "./templates"

/**
 * Single email sender. All triggers go through this — the only place that
 * references RESEND_FROM. When you move from onboarding@resend.dev to
 * no-reply@magom.io, change one env var.
 *
 * In Phase 2 the real send is intentionally suppressed (DRY_RUN=true if
 * RESEND_FROM is the resend.dev placeholder OR RESEND_API_KEY is missing).
 * The email_log row still gets written so we can see who would have been
 * notified once the real domain is wired up.
 */
export async function sendEmail(opts: {
  template: TemplateName
  to: string
  data?: Record<string, string>
  relatedId?: string | null
}) {
  const { template, to, data = {}, relatedId = null } = opts
  const supabase = createAdminClient()

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM || "onboarding@resend.dev"
  const dryRun = !apiKey || from === "onboarding@resend.dev"

  // Log first (status set after send attempt).
  const { data: logRow } = await supabase
    .from("email_log")
    .insert({
      template,
      to_email: to,
      related_id: relatedId,
      status: dryRun ? "skipped" : "queued",
    })
    .select("id")
    .single()

  if (dryRun) {
    console.info(`[email] skipped (dry-run): template=${template} to=${to}`)
    return { skipped: true as const }
  }

  const payload = renderTemplate(template, data)

  try {
    const resend = new Resend(apiKey!)
    const result = await resend.emails.send({
      from,
      to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    })

    if ((result as { error?: unknown }).error) {
      const msg = JSON.stringify((result as { error: unknown }).error)
      if (logRow)
        await supabase
          .from("email_log")
          .update({ status: "failed", error: msg })
          .eq("id", logRow.id)
      return { sent: false as const, error: msg }
    }

    const resendId = (result as { data?: { id?: string } }).data?.id ?? null
    if (logRow)
      await supabase
        .from("email_log")
        .update({ status: "sent", resend_id: resendId })
        .eq("id", logRow.id)
    return { sent: true as const, resendId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (logRow)
      await supabase
        .from("email_log")
        .update({ status: "failed", error: msg })
        .eq("id", logRow.id)
    return { sent: false as const, error: msg }
  }
}
