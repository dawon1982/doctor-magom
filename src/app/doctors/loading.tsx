export default function DoctorsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-accent/30 to-background py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-9 w-64 rounded bg-muted" />
            <div className="h-4 w-80 max-w-full rounded bg-muted/60" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          {/* 검색 + 필터 바 */}
          <div className="h-11 rounded-xl bg-muted/60" />
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded-full bg-muted/60" />
            <div className="h-8 w-20 rounded-full bg-muted/60" />
            <div className="h-8 w-28 rounded-full bg-muted/60" />
          </div>

          {/* 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-muted/40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
