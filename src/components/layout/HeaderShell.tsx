import Link from "next/link"
import { MagomBear } from "@/components/brand/MagomBear"

/**
 * Fully static Suspense fallback for the session-aware <Header />.
 *
 * Cannot use HeaderNav because that component calls usePathname(), which
 * cacheComponents treats as request-time data and disallows in a fallback.
 * Once <Header /> resolves the session it streams in and replaces this
 * skeleton with the full nav + auth slot.
 */
export function HeaderShell() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <MagomBear className="h-8 w-8" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight text-foreground">
                닥터마음곰
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Dr. Magom
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
