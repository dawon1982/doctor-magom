"use client"

import { useEffect, useState } from "react"
import { getOpenStatus, type OpenStatus } from "@/lib/hours"

type Props = {
  hours: { day: string; time: string }[]
  lunchBreak?: string | null
  closedDays?: string | null
  /** "card" = small inline pill (doctor list), "panel" = larger detail-page version */
  variant?: "card" | "panel"
}

export function OpenStatusBadge({
  hours,
  lunchBreak,
  closedDays,
  variant = "card",
}: Props) {
  // Compute on mount + every 60s so the badge stays accurate without
  // requiring a page reload. Initial server render shows a placeholder
  // because Date.now() varies between server and client.
  const [status, setStatus] = useState<OpenStatus | null>(null)

  useEffect(() => {
    const compute = () =>
      setStatus(getOpenStatus(hours, lunchBreak, closedDays))
    compute()
    const id = setInterval(compute, 60_000)
    return () => clearInterval(id)
  }, [hours, lunchBreak, closedDays])

  if (!status) return null

  let dotClass = "bg-muted-foreground"
  let label = "정보 없음"
  let detail: string | undefined

  switch (status.state) {
    case "open":
      dotClass = "bg-green-500"
      label = "진료중"
      detail = status.until
      break
    case "closing-soon":
      dotClass = "bg-amber-500"
      label = "곧 마감"
      detail = status.until
      break
    case "lunch":
      dotClass = "bg-amber-500"
      label = "점심시간"
      detail = status.until
      break
    case "closed":
      dotClass = "bg-rose-400"
      label = "진료 마감"
      detail = status.nextOpen
      break
    case "unknown":
      return null
  }

  if (variant === "card") {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-background/80 border border-border/60 px-2 py-0.5 text-[11px] font-medium"
        title={detail}
      >
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`} />
        {label}
      </span>
    )
  }

  // panel
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        className={`inline-block h-2 w-2 rounded-full ${dotClass} ring-2 ring-background`}
      />
      <span className="text-sm font-semibold">{label}</span>
      {detail && (
        <span className="text-xs text-muted-foreground">· {detail}</span>
      )}
    </div>
  )
}
