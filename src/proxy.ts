import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Optimistic cookie-only check. Real role enforcement happens in the
 * admin / doctor layouts via `requireRole()` — this just keeps anonymous
 * visitors out of protected URLs early.
 *
 * In Next.js 16 this file is `proxy.ts` (renamed from `middleware.ts`).
 */

const PROTECTED_PREFIXES = ["/admin", "/doctor/profile", "/account"]
const AUTH_PAGES = ["/login", "/signup"]

function hasSupabaseSession(req: NextRequest): boolean {
  // @supabase/ssr writes cookies named `sb-<ref>-auth-token`, potentially
  // split into `.0`, `.1` chunks. Presence of any sb-*-auth-token is enough
  // for an optimistic signal.
  return req.cookies
    .getAll()
    .some(
      (c) =>
        c.name.startsWith("sb-") &&
        (c.name.endsWith("-auth-token") ||
          c.name.includes("-auth-token.")),
    )
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const signedIn = hasSupabaseSession(req)

  // Bounce signed-in users away from /login and /signup.
  if (signedIn && AUTH_PAGES.includes(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    url.search = ""
    return NextResponse.redirect(url)
  }

  // Send anon users on protected paths to login (preserving the target).
  if (
    !signedIn &&
    PROTECTED_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    )
  ) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/doctor/profile/:path*",
    "/account/:path*",
    "/login",
    "/signup",
  ],
}
