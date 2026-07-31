/**
 * Doctor hours parser & "open now?" status calculator.
 *
 * Doctor `hours` entries are free-form Korean strings (day + time), so this
 * parser is intentionally conservative: when the day or time field has
 * special markers it can't interpret (격주, 2·4주, parenthetical notes), it
 * returns `unknown` rather than guessing.
 */

import { isKoreanHoliday } from "@/lib/holidays"

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const
type Weekday = (typeof WEEKDAYS)[number]

const RANGE_SEP_RE = /[-–~]/
const TIME_RE = /(\d{1,2}):(\d{2})\s*[-–~]\s*(\d{1,2}):(\d{2})/

/**
 * Qualifiers that make a day rule conditional (every-other-week, nth-week of
 * the month, half-day). We can't evaluate these from a plain string, so any
 * clause carrying one is treated as "unknown" instead of being applied.
 */
const QUALIFIER_RE = /격주|격월|홀수|짝수|첫째|둘째|셋째|넷째|다섯째|매월|\d\s*주|오전|오후/

const PAREN_RE = /[(（]([^)）]*)[)）]/g

const HANGUL_RUN_RE = /[가-힣]+/g

/**
 * Extract standalone weekday tokens from one clause: bare (월), suffixed
 * (월요일), bracketed ((일)) or enumerated (월화). Works on whole Hangul words
 * rather than single characters so it never fires on the 월 of "매월" or the
 * 일 of "공휴일".
 */
function weekdayTokensIn(clause: string): Weekday[] {
  const out: Weekday[] = []
  for (const run of clause.match(HANGUL_RUN_RE) ?? []) {
    if (run.includes("공휴")) continue
    const word = run.replace(/요일$/, "").replace(/(휴진|휴무|휴원)$/, "")
    if (!word) continue
    if (![...word].every((ch) => WEEKDAYS.includes(ch as Weekday))) continue
    for (const ch of word) out.push(ch as Weekday)
  }
  return out
}

/**
 * Convert a JS Date to today's weekday in Asia/Seoul. JS Date.getDay() is
 * tied to the runtime's locale; in browsers that's the user's local timezone
 * which is usually correct for Korean users but not guaranteed. We resolve
 * it via Intl to be safe.
 */
function seoulWeekday(now: Date): Weekday {
  // 'narrow' returns Sun/Mon-style → use 'short' in ko-KR which yields 일/월/...
  const fmt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    weekday: "short",
  })
  const ch = fmt.format(now).trim() // e.g. "월"
  return (WEEKDAYS.includes(ch as Weekday) ? (ch as Weekday) : "월")
}

function seoulMinutes(now: Date): number {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now)
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0")
  const min = Number(parts.find((p) => p.type === "minute")?.value ?? "0")
  return hour * 60 + min
}

/**
 * Expand a day token like "월·화·목·금" or "월–금" into a set of weekdays.
 * Returns null when the token contains uncertain markers (parentheses, 격주,
 * 2·4주 etc.) so the caller can fall through to next entry.
 */
function expandDays(token: string): Set<Weekday> | null {
  const raw = token.trim()
  if (!raw) return null

  // Parenthetical notes are only fatal when they encode a recurrence rule
  // ("격주", "2·4주"). Plain annotations ("저녁", "야간") are dropped and the
  // remaining day token is parsed normally.
  let ambiguousParen = false
  const unwrapped = raw.replace(PAREN_RE, (_m, inner: string) => {
    if (QUALIFIER_RE.test(inner)) ambiguousParen = true
    return " "
  })
  if (ambiguousParen) return null

  // Drop the "요일" suffix before any per-character scanning, otherwise
  // "월요일" reads as 월 + 일.
  const t = unwrapped.replace(/요일/g, "").replace(/\s+/g, " ").trim()
  if (!t) return null
  if (QUALIFIER_RE.test(t)) return null

  if (t === "평일") return new Set(["월", "화", "수", "목", "금"])
  if (t === "주말") return new Set(["토", "일"])

  // Range: "월–금" / "월-금"
  const rangeParts = t.split(RANGE_SEP_RE)
  if (rangeParts.length === 2) {
    const a = rangeParts[0].trim()
    const b = rangeParts[1].trim()
    if (WEEKDAYS.includes(a as Weekday) && WEEKDAYS.includes(b as Weekday)) {
      const start = WEEKDAYS.indexOf(a as Weekday)
      const end = WEEKDAYS.indexOf(b as Weekday)
      if (start >= 0 && end >= 0 && start <= end) {
        const out = new Set<Weekday>()
        for (let i = start; i <= end; i++) out.add(WEEKDAYS[i])
        return out
      }
    }
  }

  // Enumeration: "월·화·목·금" / "월, 화" / "월 화"
  const out = new Set<Weekday>()
  for (const ch of t) {
    if (WEEKDAYS.includes(ch as Weekday)) out.add(ch as Weekday)
  }
  return out.size > 0 ? out : null
}

function parseTimeRange(s: string): { start: number; end: number } | null {
  const m = s.match(TIME_RE)
  if (!m) return null
  const start = Number(m[1]) * 60 + Number(m[2])
  let end = Number(m[3]) * 60 + Number(m[4])
  // Overnight clinic (rare but possible): treat 24h+ end as next-day
  if (end < start) end += 24 * 60
  return { start, end }
}

export type ParsedClosedDays = {
  /** Indices into WEEKDAYS (0 = 월 … 6 = 일) that are closed every week. */
  closedWeekdays: number[]
  /**
   * True when at least one clause carried a qualifier we can't evaluate
   * ("매월 첫째 월요일", "토요일 오후 휴진"). Such clauses are ignored rather
   * than applied, so callers know the result is incomplete.
   */
  hasAmbiguousRule: boolean
}

/**
 * Parse a free-form `closedDays` string ("일요일, 공휴일", "주말, 공휴일") into
 * the set of weekdays that are closed every week.
 *
 * Only unconditional clauses are applied. Anything qualified by a recurrence
 * or a half-day marker is skipped and flagged via `hasAmbiguousRule`.
 * Note: "공휴일" is not a weekday and is not represented here — callers check
 * for it separately against the holiday calendar.
 */
export function parseClosedDays(
  closedDays: string | undefined | null,
): ParsedClosedDays {
  const closed = new Set<number>()
  let hasAmbiguousRule = false
  if (!closedDays) return { closedWeekdays: [], hasAmbiguousRule }

  for (const rawClause of closedDays.split(/[,、;·/]/)) {
    const clause = rawClause.trim()
    if (!clause) continue
    if (QUALIFIER_RE.test(clause)) {
      hasAmbiguousRule = true
      continue
    }
    if (clause.includes("주말")) {
      closed.add(WEEKDAYS.indexOf("토"))
      closed.add(WEEKDAYS.indexOf("일"))
      continue
    }
    if (clause.includes("평일")) {
      for (const wd of ["월", "화", "수", "목", "금"] as const) {
        closed.add(WEEKDAYS.indexOf(wd))
      }
      continue
    }
    for (const wd of weekdayTokensIn(clause)) {
      closed.add(WEEKDAYS.indexOf(wd))
    }
  }

  return {
    closedWeekdays: [...closed].sort((a, b) => a - b),
    hasAmbiguousRule,
  }
}

export type OpenStatus =
  | { state: "open"; until: string }
  | { state: "closing-soon"; until: string }
  | { state: "lunch"; until: string }
  | { state: "closed"; nextOpen?: string }
  | { state: "unknown" }

const CLOSING_SOON_MIN = 30

export function getOpenStatus(
  hours: { day: string; time: string }[],
  lunchBreak: string | null | undefined,
  closedDays: string | null | undefined,
  now: Date = new Date(),
): OpenStatus {
  if (!hours?.length) return { state: "unknown" }

  const today = seoulWeekday(now)
  const { closedWeekdays } = parseClosedDays(closedDays)
  if (closedWeekdays.includes(WEEKDAYS.indexOf(today))) {
    return { state: "closed" }
  }
  if (closedDays?.includes("공휴일") && isKoreanHoliday(now)) {
    return { state: "closed" }
  }

  const minutes = seoulMinutes(now)
  let bestMatch: { start: number; end: number } | null = null

  for (const h of hours) {
    const days = expandDays(h.day)
    if (!days || !days.has(today)) continue
    const range = parseTimeRange(h.time)
    if (!range) continue
    if (minutes >= range.start && minutes < range.end) {
      bestMatch = range
      break
    }
  }

  if (!bestMatch) {
    // Not currently in any range — find the next opening today
    for (const h of hours) {
      const days = expandDays(h.day)
      if (!days || !days.has(today)) continue
      const range = parseTimeRange(h.time)
      if (!range) continue
      if (range.start > minutes) {
        const hh = Math.floor(range.start / 60)
        const mm = String(range.start % 60).padStart(2, "0")
        return { state: "closed", nextOpen: `오늘 ${hh}:${mm} 진료` }
      }
    }
    return { state: "closed" }
  }

  // Inside opening hours — check lunch break
  if (lunchBreak) {
    const lb = parseTimeRange(lunchBreak)
    if (lb && minutes >= lb.start && minutes < lb.end) {
      const hh = Math.floor(lb.end / 60)
      const mm = String(lb.end % 60).padStart(2, "0")
      return { state: "lunch", until: `${hh}:${mm} 까지 점심시간` }
    }
  }

  const hh = Math.floor(bestMatch.end / 60) % 24
  const mm = String(bestMatch.end % 60).padStart(2, "0")
  const untilStr = `${hh}:${mm} 마감`
  if (bestMatch.end - minutes <= CLOSING_SOON_MIN) {
    return { state: "closing-soon", until: untilStr }
  }
  return { state: "open", until: untilStr }
}
