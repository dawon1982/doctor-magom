export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-32 rounded bg-muted" />
        <div className="h-24 rounded-xl bg-muted/60" />
        <div className="h-24 rounded-xl bg-muted/60" />
      </div>
    </div>
  )
}
