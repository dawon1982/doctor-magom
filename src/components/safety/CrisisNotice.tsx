import { LifeBuoy } from "lucide-react"

/**
 * Crisis hotline notice. Anyone describing their symptoms to find a doctor may
 * be in immediate danger, and a directory that only says "here are three
 * doctors" is the wrong answer for that person.
 *
 * Numbers are Korea-wide, free, and staffed 24/7.
 */
export function CrisisNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-muted-foreground">
        지금 많이 힘들거나 위험하다고 느끼신다면 잠시 멈추고{" "}
        <a href="tel:109" className="font-semibold text-foreground underline">
          자살예방상담 109
        </a>{" "}
        또는{" "}
        <a href="tel:1577-0199" className="font-semibold text-foreground underline">
          정신건강상담 1577-0199
        </a>
        로 전화해주세요. 24시간 무료로 연결됩니다.
      </p>
    )
  }

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <LifeBuoy size={16} className="text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold">지금 많이 힘드신가요?</p>
          <p className="text-sm text-muted-foreground">
            죽고 싶다는 생각이 들거나 스스로를 해치고 싶은 마음이 든다면, 의사를
            찾기 전에 먼저 전화해주세요. 24시간 무료로 상담사와 연결됩니다.
          </p>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <a
              href="tel:109"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              자살예방상담 109
            </a>
            <a
              href="tel:1577-0199"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              정신건강상담 1577-0199
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            생명이 위급한 상황이라면 119에 신고해주세요.
          </p>
        </div>
      </div>
    </div>
  )
}
