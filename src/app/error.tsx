"use client"

import Link from "next/link"
import { useEffect } from "react"
import { RotateCw } from "lucide-react"
import { MagomBear } from "@/components/brand/MagomBear"

/**
 * Route-level error boundary. Never renders `error.message` — server errors can
 * carry internal details. Only `digest` is shown so the user can quote it to us.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] bg-background flex items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <MagomBear className="text-6xl" />
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          잠시 문제가 생겼어요
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed word-keep">
          일시적인 오류일 수 있어요. 다시 시도해보시고, 계속 같은 화면이 보이면
          잠시 후 다시 방문해주세요.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <RotateCw size={15} /> 다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-accent transition"
          >
            홈으로
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-muted-foreground">
            오류 코드{" "}
            <span className="font-mono text-foreground/70">{error.digest}</span>
          </p>
        )}
      </div>
    </div>
  )
}
