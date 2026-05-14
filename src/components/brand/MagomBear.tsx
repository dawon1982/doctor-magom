/**
 * The Dr.마음곰 brand mascot — teddy bear emoji.
 *
 * Used wherever we want a friendly "마음곰" visual cue (header, footer,
 * empty states, hero, etc.). Wrapped in a component so the choice of
 * mascot lives in one place — change the MASCOT constant to swap.
 *
 * Size with Tailwind `text-*` classes via className
 *   (e.g. `text-2xl`, `text-5xl`). For emoji, font-size controls visual
 *   size. Height/width are inferred from font metrics.
 */
type Props = {
  className?: string
  /** False to expose the mascot to screen readers (rare). */
  decorative?: boolean
}

const MASCOT = "🧸"

export function MagomBear({ className = "text-base", decorative = true }: Props) {
  return (
    <span
      className={`inline-block leading-none ${className}`}
      role="img"
      aria-label={decorative ? undefined : "닥터마음곰"}
      aria-hidden={decorative}
    >
      {MASCOT}
    </span>
  )
}
