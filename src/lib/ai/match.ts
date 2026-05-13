import "server-only"
import Anthropic from "@anthropic-ai/sdk"
import { getAnthropic, getModelId } from "./anthropic"
import { getAllDoctors, type Doctor } from "@/lib/data/doctors-db"
import {
  MATCH_SYSTEM_PROMPT,
  MATCH_TOOL,
  buildCatalogText,
  buildUserMessage,
  type DoctorCatalogEntry,
} from "./match-prompts"
import { MatchPicksSchema, type MatchInput, type MatchPicks } from "@/lib/validation/match"

export type MatchedDoctor = {
  slug: string
  reason: string
  doctor: Doctor
}

export type MatchResult =
  | {
      ok: true
      picks: MatchedDoctor[]
      caveat?: string
      usage: { input: number; output: number; cachedRead: number }
    }
  | { ok: false; error: string }

function toCatalogEntry(d: Doctor): DoctorCatalogEntry {
  return {
    slug: d.slug,
    name: d.name,
    hospital: d.hospital,
    region: d.region,
    district: d.district,
    specialties: d.specialties,
    keywords: d.keywords,
    targetPatients: d.targetPatients,
    treatments: d.treatments,
    bio: d.bio,
  }
}

/**
 * Run a patient-doctor match. Sends the whole published doctor list to Claude
 * (alongside the system prompt) and lets the model pick the top 1-3.
 *
 * Both system prompt and doctor catalog get `cache_control: ephemeral` so
 * subsequent calls within the 5-minute cache window read the prefix cheaply.
 */
export async function runMatch(input: MatchInput): Promise<MatchResult> {
  const client = getAnthropic()
  if (!client) {
    return {
      ok: false,
      error:
        "AI Gateway가 아직 설정되지 않았어요. 관리자에게 문의해주세요.",
    }
  }

  const doctors = await getAllDoctors()
  if (doctors.length === 0) {
    return { ok: false, error: "등록된 의사가 없어요." }
  }

  // Catalog is sorted by slug for deterministic prompt-cache hits.
  const catalogSorted = [...doctors].sort((a, b) => a.slug.localeCompare(b.slug))
  const catalogText = buildCatalogText(catalogSorted.map(toCatalogEntry))

  try {
    const response = await client.messages.create({
      model: getModelId("sonnet-4-6"),
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: MATCH_SYSTEM_PROMPT,
        },
        {
          type: "text",
          text: catalogText,
          // Catalog rarely changes — cache the prefix through here.
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [MATCH_TOOL],
      tool_choice: { type: "tool", name: "recommend_doctors" },
      messages: [
        {
          role: "user",
          content: buildUserMessage({
            query: input.query,
            region: input.region,
            targetPatient: input.targetPatient,
          }),
        },
      ],
    })

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    )
    if (!toolUse) {
      return { ok: false, error: "AI가 예상한 형식으로 응답하지 않았어요." }
    }

    const parsed = MatchPicksSchema.safeParse(toolUse.input)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return {
        ok: false,
        error: `AI 응답 검증 실패: ${first?.path.join(".")} — ${first?.message}`,
      }
    }

    const bySlug = new Map(doctors.map((d) => [d.slug, d]))
    const picks: MatchedDoctor[] = []
    for (const p of parsed.data.picks) {
      const doc = bySlug.get(p.slug)
      if (!doc) {
        // AI hallucinated a slug — skip silently. Better fewer good picks
        // than a broken link.
        continue
      }
      if (picks.some((x) => x.slug === doc.slug)) continue // dedup
      picks.push({ slug: doc.slug, reason: p.reason, doctor: doc })
    }

    if (picks.length === 0) {
      return {
        ok: false,
        error:
          "AI가 카탈로그 밖의 의사를 골랐어요. 다시 시도해주세요 — 다른 표현으로 적어보면 도움이 돼요.",
      }
    }

    return {
      ok: true,
      picks,
      ...(parsed.data.caveat ? { caveat: parsed.data.caveat } : {}),
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        cachedRead: response.usage.cache_read_input_tokens ?? 0,
      },
    }
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return { ok: false, error: "AI 인증 실패. 관리자에게 문의해주세요." }
    }
    if (err instanceof Anthropic.RateLimitError) {
      return {
        ok: false,
        error: "지금 너무 많은 요청이 들어왔어요. 잠시 후 다시 시도해주세요.",
      }
    }
    if (err instanceof Anthropic.APIError) {
      return { ok: false, error: `AI 호출 실패 (${err.status}): ${err.message}` }
    }
    return { ok: false, error: `예상치 못한 오류: ${(err as Error).message}` }
  }
}

export type { MatchPicks }
