/**
 * Open-redirect guard for user-supplied `next` / `returnTo` values.
 *
 * Only same-origin absolute paths are allowed through. Everything else
 * (absolute URLs, protocol-relative `//evil.com`, backslash tricks that some
 * browsers normalize to `//`, control characters used for header/response
 * splitting) collapses to the fallback.
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = "/",
): string {
  if (typeof raw !== "string") return fallback
  if (raw.length === 0 || raw.length > 2048) return fallback

  // Reject newlines and other control chars (C0 range + DEL) anywhere in the
  // value — those are what header/response-splitting payloads rely on.
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i)
    if (code < 0x20 || code === 0x7f) return fallback
  }

  if (!raw.startsWith("/")) return fallback
  // Protocol-relative ("//evil.com") and the backslash variant browsers
  // normalize into it ("/\evil.com").
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback

  return raw
}
