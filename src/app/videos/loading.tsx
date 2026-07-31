export default function VideosLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-accent/30 to-background py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-9 w-56 rounded bg-muted" />
            <div className="h-4 w-72 max-w-full rounded bg-muted/60" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[4/5] rounded-xl bg-muted/40" />
              <div className="h-4 w-3/4 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
