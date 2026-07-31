import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { MagomBear } from "@/components/brand/MagomBear"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] bg-background flex items-center justify-center px-4 py-16">
      {/* Streamed (PPR) routes have already sent a 200 by the time notFound()
          runs, so the status code alone can't tell crawlers this is a dead
          page. React hoists this into <head>. */}
      <meta name="robots" content="noindex, follow" />
      <div className="mx-auto max-w-md text-center">
        <MagomBear className="text-6xl" />
        <p className="mt-4 text-sm font-medium text-primary">404</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          찾으시는 페이지가 없어요
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed word-keep">
          주소가 바뀌었거나 삭제된 페이지일 수 있어요.
          선생님 목록에서 다시 찾아보세요.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            선생님 목록 보기 <ArrowRight size={15} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-accent transition"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
