"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { toggleFavorite } from "@/lib/actions/favorites"

type Props = {
  doctorId: string
  initialFavorited: boolean
  /** Show as small icon-only pill (card) vs full label button (detail page) */
  variant?: "icon" | "labeled"
  /** When the user isn't signed in we route them to /login instead of calling the action */
  isLoggedIn: boolean
}

export function FavoriteButton({
  doctorId,
  initialFavorited,
  variant = "icon",
  isLoggedIn,
}: Props) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) {
      window.location.assign(
        `/login?next=${encodeURIComponent(window.location.pathname)}`,
      )
      return
    }
    setError(null)
    // Optimistic
    const next = !favorited
    setFavorited(next)
    startTransition(async () => {
      const res = await toggleFavorite(doctorId)
      if (!res.ok) {
        setFavorited(!next) // revert
        setError(res.error)
        return
      }
      // Server-confirmed value (in case of races)
      setFavorited(res.favorited)
    })
  }

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95 disabled:opacity-50 ${
          favorited
            ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
            : "border-border bg-card hover:bg-muted"
        }`}
        aria-pressed={favorited}
        title={error ?? undefined}
      >
        <Heart
          size={15}
          fill={favorited ? "currentColor" : "none"}
          className={favorited ? "text-rose-500" : ""}
        />
        {favorited ? "즐겨찾기에 있어요" : "즐겨찾기에 추가"}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/95 backdrop-blur-sm border shadow-sm transition active:scale-90 disabled:opacity-50 ${
        favorited
          ? "border-rose-300 text-rose-500 hover:bg-rose-50"
          : "border-border text-muted-foreground hover:text-rose-500 hover:border-rose-200"
      }`}
      aria-label={favorited ? "즐겨찾기 해제" : "즐겨찾기에 추가"}
      aria-pressed={favorited}
      title={error ?? undefined}
    >
      <Heart size={14} fill={favorited ? "currentColor" : "none"} />
    </button>
  )
}
