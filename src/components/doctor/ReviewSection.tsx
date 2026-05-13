"use client"

import { useState, useTransition } from "react"
import { Star, Trash2 } from "lucide-react"
import Link from "next/link"
import { submitReview, deleteReview } from "@/lib/actions/reviews"

export type Review = {
  id: string
  rating: number
  body: string
  created_at: string
  updated_at: string
  authorName: string | null
  isOwn: boolean
}

type Props = {
  doctorId: string
  doctorSlug: string
  isLoggedIn: boolean
  reviews: Review[]
  myReview: Review | null
}

export function ReviewSection({
  doctorId,
  doctorSlug,
  isLoggedIn,
  reviews,
  myReview,
}: Props) {
  const counts = reviews.length
  const avg =
    counts > 0
      ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / counts) * 10) / 10
      : null

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Star size={15} className="text-amber-500" fill="currentColor" />
          </div>
          <h2 className="font-bold text-base">환자 후기 ({counts})</h2>
        </div>
        {avg !== null && (
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Star size={13} className="text-amber-500" fill="currentColor" />
            {avg.toFixed(1)}
          </div>
        )}
      </div>

      {isLoggedIn ? (
        <ReviewForm
          doctorId={doctorId}
          initial={myReview}
          doctorSlug={doctorSlug}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-4 text-center mb-5">
          <p className="text-xs text-muted-foreground mb-2">
            진료 받으신 후 솔직한 후기를 남겨주세요. 다른 환자에게 큰 도움이 돼요.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(`/doctors/${doctorSlug}`)}`}
            className="text-xs font-semibold text-primary hover:underline"
          >
            로그인하고 후기 남기기 →
          </Link>
        </div>
      )}

      <ul className="space-y-4">
        {reviews.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground italic">
            아직 후기가 없어요. 첫 후기를 남겨보세요.
          </li>
        )}
        {reviews.map((r) => (
          <ReviewItem key={r.id} review={r} />
        ))}
      </ul>
    </div>
  )
}

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange?: (v: number) => void
}) {
  const interactive = !!onChange
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={interactive ? () => onChange?.(n) : undefined}
          className={`p-0.5 ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
          aria-label={`${n}점`}
          tabIndex={interactive ? 0 : -1}
        >
          <Star
            size={interactive ? 22 : 14}
            className={n <= value ? "text-amber-500" : "text-muted-foreground/40"}
            fill={n <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewForm({
  doctorId,
  initial,
}: {
  doctorId: string
  doctorSlug: string
  initial: Review | null
}) {
  const [rating, setRating] = useState(initial?.rating ?? 5)
  const [body, setBody] = useState(initial?.body ?? "")
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ kind: "info" | "error"; text: string } | null>(null)
  const editing = !!initial

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const res = await submitReview(doctorId, { rating, body })
      if (!res.ok) {
        setMsg({ kind: "error", text: res.error })
        return
      }
      setMsg({
        kind: "info",
        text: editing ? "후기를 수정했어요." : "후기를 등록했어요. 고마워요!",
      })
    })
  }

  function onDelete() {
    if (!initial) return
    if (!confirm("정말 후기를 삭제할까요?")) return
    setMsg(null)
    startTransition(async () => {
      const res = await deleteReview(initial.id)
      if (!res.ok) {
        setMsg({ kind: "error", text: res.error })
        return
      }
      setRating(5)
      setBody("")
      setMsg({ kind: "info", text: "후기를 삭제했어요." })
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-card/60 p-4 mb-6 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {editing ? "내 후기 수정" : "후기 남기기"}
        </p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        minLength={10}
        maxLength={2000}
        required
        placeholder="진료 받으신 경험을 솔직하게 적어주세요 (최소 10자, 최대 2000자)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          본인의 진료 경험만 적어주세요. 욕설·광고·개인정보는 운영진이 비공개 처리할 수 있어요.
        </p>
        <div className="flex items-center gap-2">
          {editing && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="text-xs text-red-600 hover:underline disabled:opacity-50"
            >
              삭제
            </button>
          )}
          <button
            type="submit"
            disabled={pending || body.trim().length < 10}
            className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-semibold disabled:opacity-50 active:scale-95 transition-transform"
          >
            {pending ? "저장 중…" : editing ? "수정" : "등록"}
          </button>
        </div>
      </div>
      {msg && (
        <p
          className={`text-xs ${msg.kind === "error" ? "text-red-600" : "text-green-700"}`}
        >
          {msg.text}
        </p>
      )}
    </form>
  )
}

function ReviewItem({ review }: { review: Review }) {
  const [pending, startTransition] = useTransition()
  const [deleted, setDeleted] = useState(false)

  function onDelete() {
    if (!confirm("정말 후기를 삭제할까요?")) return
    startTransition(async () => {
      const res = await deleteReview(review.id)
      if (res.ok) setDeleted(true)
    })
  }

  if (deleted) return null

  return (
    <li className="rounded-xl border border-border/60 bg-background p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} />
          <span className="text-xs text-muted-foreground">
            {review.authorName ?? "익명"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>
            {new Date(review.created_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
          {review.isOwn && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="text-red-600 hover:underline disabled:opacity-50 inline-flex items-center gap-0.5"
              aria-label="내 후기 삭제"
            >
              <Trash2 size={11} /> 삭제
            </button>
          )}
        </div>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap word-keep">
        {review.body}
      </p>
    </li>
  )
}
