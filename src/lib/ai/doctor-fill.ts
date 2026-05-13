import "server-only"
import { htmlToText } from "html-to-text"
import Anthropic from "@anthropic-ai/sdk"
import { getAnthropic, getModelId } from "./anthropic"
import { AiDoctorFillSchema, type AiDoctorFill } from "@/lib/validation/ai"
import {
  DOCTOR_FILL_SYSTEM_PROMPT,
  DOCTOR_FILL_TOOL,
  buildUserMessage,
} from "./prompts"

const FETCH_TIMEOUT_MS = 15_000
const MAX_BODY_BYTES = 5_000_000 // 5 MB — Korean clinic sites are often 2-4MB with inline images
const MAX_TEXT_CHARS = 12_000

export type FillResult =
  | { ok: true; data: AiDoctorFill; usage: { input: number; output: number; cachedRead: number } }
  | { ok: false; error: string }

async function fetchPageText(url: string): Promise<string> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error("URL 형식이 올바르지 않아요.")
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("http(s) URL만 지원해요.")
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DoctorMagomBot/1.0; +https://doctor-magom.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    })
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("페이지 로딩이 10초를 넘었어요. 다른 URL을 시도해주세요.")
    }
    throw new Error(`페이지를 가져오지 못했어요: ${(err as Error).message}`)
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    throw new Error(`페이지가 ${res.status} 응답을 반환했어요.`)
  }

  // Read with size cap — if oversized, truncate (don't fail) so we can still
  // try extraction from the first chunk.
  const buf = await res.arrayBuffer()
  const slice = buf.byteLength > MAX_BODY_BYTES ? buf.slice(0, MAX_BODY_BYTES) : buf
  // fatal:false → tolerate cutting a multi-byte UTF-8 sequence at the boundary
  const html = new TextDecoder("utf-8", { fatal: false }).decode(slice)

  const text = htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: "img", format: "skip" },
      { selector: "script", format: "skip" },
      { selector: "style", format: "skip" },
      { selector: "a", options: { ignoreHref: true } },
    ],
  })

  return text.slice(0, MAX_TEXT_CHARS)
}

/**
 * Fetch a hospital webpage, ask Claude to extract structured doctor profile
 * fields, validate the response with Zod.
 *
 * Returns `{ok: false, error}` on any failure (URL invalid, fetch failed,
 * API key missing, Claude error, Zod parse failed). Never throws.
 */
export async function fillDoctorFromUrl(opts: {
  url: string
  hospital: string
}): Promise<FillResult> {
  const client = getAnthropic()
  if (!client) {
    return {
      ok: false,
      error:
        "AI Gateway 또는 Anthropic API key가 설정되지 않았어요. 관리자에게 문의해주세요.",
    }
  }

  let pageText: string
  try {
    pageText = await fetchPageText(opts.url)
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }

  if (pageText.trim().length < 100) {
    return {
      ok: false,
      error:
        "페이지 본문이 거의 비어 있어요 (SPA인 경우 추출이 어려울 수 있어요).",
    }
  }

  try {
    const response = await client.messages.create({
      model: getModelId("sonnet-4-6"),
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: DOCTOR_FILL_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [DOCTOR_FILL_TOOL],
      tool_choice: { type: "tool", name: "fill_doctor_profile" },
      messages: [
        {
          role: "user",
          content: buildUserMessage({
            hospital: opts.hospital,
            url: opts.url,
            pageText,
          }),
        },
      ],
    })

    // Find the tool_use block (forced via tool_choice).
    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    )
    if (!toolUse) {
      return { ok: false, error: "AI가 예상한 형식으로 응답하지 않았어요." }
    }

    const parsed = AiDoctorFillSchema.safeParse(toolUse.input)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return {
        ok: false,
        error: `AI 응답 검증 실패: ${first?.path.join(".")} — ${first?.message}`,
      }
    }

    return {
      ok: true,
      data: parsed.data,
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        cachedRead: response.usage.cache_read_input_tokens ?? 0,
      },
    }
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return { ok: false, error: "ANTHROPIC_API_KEY가 유효하지 않아요." }
    }
    if (err instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "API 호출 한도를 초과했어요. 잠시 후 다시 시도해주세요." }
    }
    if (err instanceof Anthropic.APIError) {
      return { ok: false, error: `AI 호출 실패 (${err.status}): ${err.message}` }
    }
    return { ok: false, error: `예상치 못한 오류: ${(err as Error).message}` }
  }
}
