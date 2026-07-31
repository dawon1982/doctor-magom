export default function DoctorProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-6">
        <div className="animate-pulse h-4 w-32 rounded bg-muted/60" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-16">
        <div className="animate-pulse space-y-6 pt-6">
          {/* 프로필 헤더 */}
          <div className="flex gap-4 items-start">
            <div className="h-24 w-24 shrink-0 rounded-2xl bg-muted" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-7 w-40 rounded bg-muted" />
              <div className="h-4 w-56 max-w-full rounded bg-muted/60" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded-full bg-muted/60" />
                <div className="h-6 w-20 rounded-full bg-muted/60" />
              </div>
            </div>
          </div>

          {/* 소개 */}
          <div className="h-32 rounded-xl bg-muted/40" />
          {/* 영상 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-40 rounded-xl bg-muted/40" />
            <div className="h-40 rounded-xl bg-muted/40" />
          </div>
          {/* 후기 */}
          <div className="h-48 rounded-xl bg-muted/40" />
        </div>
      </div>
    </div>
  )
}
