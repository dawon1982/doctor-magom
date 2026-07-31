/**
 * Convert doctor hours into schema.org OpeningHoursSpecification entries.
 *
 * Deliberately conservative: entries whose day token carries markers we can't
 * resolve (parentheses, 격주, week-of-month) are skipped rather than guessed,
 * because publishing wrong opening hours to Google sends patients to a closed
 * clinic. This is separate from lib/hours.ts, which answers "open right now?"
 */

const DAY_MAP: Record<string, string> = {
  월: "https://schema.org/Monday",
  화: "https://schema.org/Tuesday",
  수: "https://schema.org/Wednesday",
  목: "https://schema.org/Thursday",
  금: "https://schema.org/Friday",
  토: "https://schema.org/Saturday",
  일: "https://schema.org/Sunday",
}
const ORDER = ["월", "화", "수", "목", "금", "토", "일"]
const TIME_RE = /^(\d{1,2}):(\d{2})\s*[-–~]\s*(\d{1,2}):(\d{2})$/

function expandDayToken(token: string): string[] | null {
  const t = token.trim()
  if (!t) return null
  if (/[()（）]/.test(t)) return null
  if (/격주|짝수|홀수|첫째|둘째|셋째|넷째|매월/.test(t)) return null
  if (t === "평일") return ["월", "화", "수", "목", "금"]
  if (t === "주말") return ["토", "일"]

  const range = t.split(/[-–~]/)
  if (range.length === 2) {
    const from = ORDER.indexOf(range[0].replace("요일", "").trim())
    const to = ORDER.indexOf(range[1].replace("요일", "").trim())
    if (from === -1 || to === -1 || to < from) return null
    return ORDER.slice(from, to + 1)
  }

  const days = t
    .split(/[·,、\s]+/)
    .map((d) => d.replace("요일", "").trim())
    .filter(Boolean)
  if (!days.length || days.some((d) => !(d in DAY_MAP))) return null
  return days
}

export function toOpeningHoursSpecification(
  hours: { day: string; time: string }[],
): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  for (const entry of hours) {
    const days = expandDayToken(entry.day)
    if (!days) continue
    const m = entry.time.trim().match(TIME_RE)
    if (!m) continue
    const opens = `${m[1].padStart(2, "0")}:${m[2]}`
    const closes = `${m[3].padStart(2, "0")}:${m[4]}`
    out.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days.map((d) => DAY_MAP[d]),
      opens,
      closes,
    })
  }
  return out
}
