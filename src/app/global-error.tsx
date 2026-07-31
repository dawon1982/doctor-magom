"use client"

import "./globals.css"

/**
 * Last-resort boundary: replaces the root layout, so it must render its own
 * <html>/<body> and import global styles itself. next-themes isn't mounted
 * here, so only the base (light) token values apply — that's intentional.
 *
 * Like error.tsx, the raw error message is never rendered; only `digest`.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <title>문제가 생겼어요 | 닥터마음곰</title>
        <div className="min-h-screen flex items-center justify-center px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <span className="inline-block leading-none text-6xl" aria-hidden>
              🧸
            </span>
            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
              잠시 문제가 생겼어요
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed word-keep">
              페이지를 불러오는 중 오류가 났어요. 다시 시도해주세요.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                다시 시도
              </button>
              {/* global-error replaces the root layout, so the router context
                  next/link needs is not mounted here. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-accent transition"
              >
                홈으로
              </a>
            </div>

            {error.digest && (
              <p className="mt-8 text-xs text-muted-foreground">
                오류 코드{" "}
                <span className="font-mono text-foreground/70">
                  {error.digest}
                </span>
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
