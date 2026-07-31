import "server-only"
import { promises as dns } from "node:dns"

/**
 * SSRF guard for server-side fetches of user-supplied URLs.
 *
 * Anything that resolves into a private / loopback / link-local range is
 * rejected — otherwise a doctor-profile URL or a YouTube channel URL becomes a
 * probe against the Vercel metadata endpoint or an internal service.
 */

const MAX_REDIRECTS = 3

/** URL was rejected by the guard. `message` is safe to show to the user. */
export class BlockedUrlError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BlockedUrlError"
  }
}

function parseIpv4(host: string): number[] | null {
  const parts = host.split(".")
  if (parts.length !== 4) return null
  const nums: number[] = []
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null
    const n = Number(p)
    if (n > 255) return null
    nums.push(n)
  }
  return nums
}

function isPrivateIpv4(host: string): boolean | null {
  const o = parseIpv4(host)
  if (!o) return null
  const [a, b] = o as [number, number, number, number]
  if (a === 0) return true // 0.0.0.0/8
  if (a === 10) return true // 10/8
  if (a === 127) return true // 127/8 loopback
  if (a === 169 && b === 254) return true // 169.254/16 link-local (cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true // 172.16/12
  if (a === 192 && b === 168) return true // 192.168/16
  if (a === 100 && b >= 64 && b <= 127) return true // 100.64/10 CGNAT
  if (a >= 224) return true // multicast + reserved
  return false
}

function isPrivateIpv6(raw: string): boolean | null {
  const host = raw.toLowerCase().replace(/^\[|\]$/g, "")
  if (!host.includes(":")) return null
  if (host === "::" || host === "::1") return true
  // IPv4-mapped (::ffff:127.0.0.1) — judge by the embedded v4 address.
  const mapped = host.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPrivateIpv4(mapped[1]!) ?? true
  const head = host.split(":")[0] ?? ""
  if (!/^[0-9a-f]{0,4}$/.test(head)) return null
  const first = parseInt(head || "0", 16)
  if ((first & 0xfe00) === 0xfc00) return true // fc00::/7 unique-local
  if ((first & 0xffc0) === 0xfe80) return true // fe80::/10 link-local
  return false
}

/** true = blocked, false = public, null = not an IP literal */
function isPrivateIpLiteral(host: string): boolean | null {
  const v6 = isPrivateIpv6(host)
  if (v6 !== null) return v6
  return isPrivateIpv4(host)
}

/**
 * Validate that `raw` is an http(s) URL pointing at a public address.
 * Throws (Korean, user-facing) when it isn't.
 *
 * Note: DNS is resolved here and again by fetch(), so a determined attacker
 * could still win a DNS-rebinding race. That's an accepted residual risk —
 * closing it would require a custom agent with a pinned socket address.
 */
export async function assertPublicHttpUrl(
  raw: string,
  opts?: { allowHosts?: string[] },
): Promise<URL> {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new BlockedUrlError("URL 형식이 올바르지 않아요.")
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new BlockedUrlError("http(s) URL만 지원해요.")
  }

  const host = url.hostname.toLowerCase()
  if (opts?.allowHosts && !opts.allowHosts.includes(host)) {
    throw new BlockedUrlError("허용되지 않은 주소예요.")
  }

  if (!host) throw new BlockedUrlError("URL 형식이 올바르지 않아요.")

  const literal = isPrivateIpLiteral(host)
  if (literal === true) {
    throw new BlockedUrlError("내부 네트워크 주소는 사용할 수 없어요.")
  }
  if (literal === false) return url

  // Hostname — resolve and require every answer to be public.
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) {
    throw new BlockedUrlError("내부 네트워크 주소는 사용할 수 없어요.")
  }

  let addrs: { address: string }[]
  try {
    addrs = await dns.lookup(host, { all: true })
  } catch {
    throw new BlockedUrlError("도메인을 찾을 수 없어요.")
  }
  if (!addrs.length) throw new BlockedUrlError("도메인을 찾을 수 없어요.")
  for (const a of addrs) {
    if (isPrivateIpLiteral(a.address) !== false) {
      throw new BlockedUrlError("내부 네트워크 주소는 사용할 수 없어요.")
    }
  }

  return url
}

/**
 * fetch() with SSRF validation on the initial URL and on every redirect hop.
 * Redirects are followed manually (up to MAX_REDIRECTS) because
 * `redirect: "follow"` would let a public host bounce us to 169.254.169.254.
 */
export async function safeFetch(
  raw: string,
  init?: RequestInit,
  opts?: { allowHosts?: string[] },
): Promise<Response> {
  let target = raw
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicHttpUrl(target, opts)
    const res = await fetch(url.toString(), { ...init, redirect: "manual" })
    if (res.status < 300 || res.status >= 400) return res

    const location = res.headers.get("location")
    if (!location) return res
    target = new URL(location, url).toString()
  }
  throw new BlockedUrlError("리디렉션이 너무 많아요.")
}
