export default function OnboardingLoading() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="animate-pulse space-y-3">
        <div className="h-7 w-48 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted/60 mb-4" />
        <div className="h-10 rounded-lg bg-muted/40" />
        <div className="h-10 rounded-lg bg-muted/40" />
        <div className="h-10 rounded-lg bg-muted/40" />
      </div>
    </div>
  )
}
