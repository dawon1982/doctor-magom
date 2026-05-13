import "server-only"
import Anthropic from "@anthropic-ai/sdk"

/**
 * Anthropic 클라이언트 팩토리.
 *
 * 우선순위:
 *   1. AI_GATEWAY_API_KEY  → Vercel AI Gateway 경유 (Anthropic 호환 endpoint).
 *      결제는 Vercel 계정으로, $5/월 무료 크레딧 + 마크업 0%.
 *   2. ANTHROPIC_API_KEY   → Anthropic 직접 호출 (기존 경로).
 *
 * 둘 다 없으면 null — 호출 측에서 친절한 에러 메시지 노출.
 *
 * 모델 ID 표기:
 *   - Gateway 사용 시: "anthropic/claude-sonnet-4.6" (점 표기)
 *   - 직접 사용 시:    "claude-sonnet-4-6"            (하이픈)
 *   getModelId() 헬퍼로 자동 선택.
 */
export function getAnthropic(): Anthropic | null {
  const gatewayKey = process.env.AI_GATEWAY_API_KEY
  if (gatewayKey) {
    return new Anthropic({
      baseURL: "https://ai-gateway.vercel.sh",
      apiKey: gatewayKey,
      defaultHeaders: {
        Authorization: `Bearer ${gatewayKey}`,
      },
    })
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return new Anthropic()
  }
  return null
}

export function isUsingGateway(): boolean {
  return !!process.env.AI_GATEWAY_API_KEY
}

/** Resolve a model ID to the right slug for the active provider. */
export function getModelId(canonical: "sonnet-4-6" | "haiku-4-5" | "opus-4-6"): string {
  if (isUsingGateway()) {
    return {
      "sonnet-4-6": "anthropic/claude-sonnet-4.6",
      "haiku-4-5": "anthropic/claude-haiku-4.5",
      "opus-4-6": "anthropic/claude-opus-4.6",
    }[canonical]
  }
  return {
    "sonnet-4-6": "claude-sonnet-4-6",
    "haiku-4-5": "claude-haiku-4-5",
    "opus-4-6": "claude-opus-4-6",
  }[canonical]
}
