/**
 * The Dr.마음곰 brand bear — solid blue silhouette extracted from the
 * Framer master design. Used wherever we used to render a 🐻 emoji.
 *
 * Tailwind size classes go on `className` (e.g. "h-6 w-6"). The bear PNG
 * has a slight tall aspect (~600×700) but we render as a square — the
 * leading-none + object-contain keeps it crisp at small sizes.
 */
type Props = {
  className?: string
  /** Set false for purely decorative usage (default true → empty alt + aria-hidden). */
  decorative?: boolean
  alt?: string
}

export function MagomBear({ className = "h-6 w-6", decorative = true, alt }: Props) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/magom-bear.png"
      alt={decorative ? "" : alt ?? "닥터마음곰"}
      aria-hidden={decorative}
      className={`inline-block object-contain ${className}`}
      draggable={false}
    />
  )
}
