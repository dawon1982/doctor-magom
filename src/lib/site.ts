/**
 * Canonical site origin for absolute URLs (metadata, sitemap, OG, JSON-LD).
 *
 * Priority:
 *   1. NEXT_PUBLIC_SITE_URL — set when running behind the custom domain
 *      (e.g. https://magom.io once that's live).
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel auto-provisioned production
 *      URL (no scheme), available on every deploy.
 *   3. Hard-coded fallback so dev/preview still get sane absolute URLs.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProd) return `https://${vercelProd.replace(/\/$/, "")}`

  return "https://doctor-magom.vercel.app"
}

export const SITE_NAME = "닥터마음곰"
export const SITE_TAGLINE = "나와 맞는 정신건강의학과 선생님 찾기"
