export default function DoctorLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-7 w-40 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted/60" />
        <div className="h-64 rounded-xl bg-muted/40" />
      </div>
    </div>
  )
}
