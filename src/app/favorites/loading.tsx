export default function FavoritesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="animate-pulse space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded bg-muted" />
          <div className="h-4 w-64 max-w-full rounded bg-muted/60" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-muted/40" />
          ))}
        </div>
      </div>
    </div>
  )
}
