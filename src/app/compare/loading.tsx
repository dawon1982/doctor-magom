export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-32 rounded bg-muted/60" />
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-40 rounded bg-muted/60" />
        </div>

        {/* 비교 카드 3열 */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="grid gap-3 px-4 sm:px-0 min-w-fit grid-cols-[120px_repeat(3,minmax(220px,1fr))]">
            <div />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted/40" />
            ))}
            {Array.from({ length: 5 }).map((_, row) => (
              <div key={row} className="contents">
                <div className="h-10 rounded bg-muted/60" />
                <div className="h-10 rounded bg-muted/40" />
                <div className="h-10 rounded bg-muted/40" />
                <div className="h-10 rounded bg-muted/40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
