import "server-only"
import Anthropic from "@anthropic-ai/sdk"

/**
 * Anthropic 클라이언트 팩토리. ANTHROPIC_API_KEY 부재 시엔 throw 하지 않고
 * null 을 반환해서 호출 측에서 친절한 에러 메시지를 사용자에게 보여줄 수
 * 있게 한다.
 */
export function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  return new Anthropic()
}
