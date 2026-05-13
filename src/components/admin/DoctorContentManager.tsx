"use client"

import { useState, useTransition } from "react"
import {
  addDoctorVideo,
  removeDoctorVideo,
  addDoctorArticle,
  removeDoctorArticle,
} from "@/lib/actions/doctor-content"

export type ContentVideo = {
  id: string
  url: string
  title: string
  date: string | null
}
export type ContentArticle = {
  id: string
  url: string
  title: string
  date: string | null
  platform: "naver" | "other"
}

export default function DoctorContentManager({
  doctorId,
  initialVideos,
  initialArticles,
}: {
  doctorId: string
  initialVideos: ContentVideo[]
  initialArticles: ContentArticle[]
}) {
  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-border">
      <VideoSection doctorId={doctorId} initial={initialVideos} />
      <ArticleSection doctorId={doctorId} initial={initialArticles} />
    </div>
  )
}

function VideoSection({
  doctorId,
  initial,
}: {
  doctorId: string
  initial: ContentVideo[]
}) {
  const [items, setItems] = useState<ContentVideo[]>(initial)
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function onAdd(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const res = await addDoctorVideo(doctorId, { url, title, date: date || null })
      if (!res.ok) {
        setMsg({ kind: "error", text: res.error })
        return
      }
      // Refresh: optimistic add with a fake ID, server revalidates list anyway.
      // Easiest: rely on revalidatePath and a manual setItems append.
      setItems((prev) => [
        ...prev,
        { id: `tmp-${Date.now()}`, url, title, date: date || null },
      ])
      setUrl("")
      setTitle("")
      setDate("")
      setMsg({ kind: "info", text: "영상이 추가됐어요." })
    })
  }

  function onDelete(id: string) {
    if (id.startsWith("tmp-")) {
      // Optimistically added but ID unknown — page reload needed for real delete.
      setMsg({
        kind: "info",
        text: "방금 추가한 항목은 페이지를 새로고침한 뒤 삭제할 수 있어요.",
      })
      return
    }
    setDeletingId(id)
    startTransition(async () => {
      const res = await removeDoctorVideo(doctorId, id)
      setDeletingId(null)
      if (!res.ok) {
        setMsg({ kind: "error", text: res.error })
        return
      }
      setItems((prev) => prev.filter((v) => v.id !== id))
      setMsg({ kind: "info", text: "영상을 삭제했어요." })
    })
  }

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-bold">유튜브 영상 ({items.length})</h2>
        <span className="text-xs text-muted-foreground">
          채널 URL을 입력하고 위 “📺 영상 수집” 버튼을 누르면 최신 5개가 자동 추가돼요
        </span>
      </div>

      <ul className="space-y-2 mb-4">
        {items.length === 0 && (
          <li className="text-sm text-muted-foreground italic py-4 text-center">
            아직 영상이 없어요. 아래에서 직접 추가하거나 채널 URL로 자동 수집하세요.
          </li>
        )}
        {items.map((v) => (
          <li
            key={v.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-primary truncate block"
              >
                {v.title}
              </a>
              <div className="text-xs text-muted-foreground truncate">
                {v.date ? `${v.date} · ` : ""}
                {v.url}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDelete(v.id)}
              disabled={deletingId === v.id || pending}
              className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 shrink-0"
            >
              {deletingId === v.id ? "삭제 중…" : "삭제"}
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={onAdd}
        className="rounded-lg border border-dashed border-border bg-muted/30 p-3 space-y-2"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          영상 직접 추가
        </p>
        <input
          type="url"
          required
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm"
        />
        <div className="grid sm:grid-cols-[1fr_140px] gap-2">
          <input
            type="text"
            required
            placeholder="영상 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm"
          />
          <input
            type="text"
            placeholder="YYYY-MM-DD (선택)"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending || !url.trim() || !title.trim()}
          className="rounded bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition-transform active:scale-95"
        >
          {pending ? "추가 중…" : "+ 영상 추가"}
        </button>
        {msg && (
          <p
            className={`text-xs ${msg.kind === "error" ? "text-red-600" : "text-green-700"}`}
          >
            {msg.text}
          </p>
        )}
      </form>
    </section>
  )
}

function ArticleSection({
  doctorId,
  initial,
}: {
  doctorId: string
  initial: ContentArticle[]
}) {
  const [items, setItems] = useState<ContentArticle[]>(initial)
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [platform, setPlatform] = useState<"naver" | "other">("other")
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function onAdd(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const res = await addDoctorArticle(doctorId, {
        url,
        title,
        date: date || null,
        platform,
      })
      if (!res.ok) {
        setMsg({ kind: "error", text: res.error })
        return
      }
      setItems((prev) => [
        ...prev,
        { id: `tmp-${Date.now()}`, url, title, date: date || null, platform },
      ])
      setUrl("")
      setTitle("")
      setDate("")
      setPlatform("other")
      setMsg({ kind: "info", text: "기고글이 추가됐어요." })
    })
  }

  function onDelete(id: string) {
    if (id.startsWith("tmp-")) {
      setMsg({
        kind: "info",
        text: "방금 추가한 항목은 페이지를 새로고침한 뒤 삭제할 수 있어요.",
      })
      return
    }
    setDeletingId(id)
    startTransition(async () => {
      const res = await removeDoctorArticle(doctorId, id)
      setDeletingId(null)
      if (!res.ok) {
        setMsg({ kind: "error", text: res.error })
        return
      }
      setItems((prev) => prev.filter((a) => a.id !== id))
      setMsg({ kind: "info", text: "기고글을 삭제했어요." })
    })
  }

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-bold">기고글 ({items.length})</h2>
        <span className="text-xs text-muted-foreground">
          네이버 블로그·브런치·기사 등 외부에 쓴 글 링크
        </span>
      </div>

      <ul className="space-y-2 mb-4">
        {items.length === 0 && (
          <li className="text-sm text-muted-foreground italic py-4 text-center">
            아직 기고글이 없어요.
          </li>
        )}
        {items.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-primary truncate block"
              >
                {a.title}
              </a>
              <div className="text-xs text-muted-foreground truncate">
                {a.platform === "naver" ? "네이버 · " : ""}
                {a.date ? `${a.date} · ` : ""}
                {a.url}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDelete(a.id)}
              disabled={deletingId === a.id || pending}
              className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 shrink-0"
            >
              {deletingId === a.id ? "삭제 중…" : "삭제"}
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={onAdd}
        className="rounded-lg border border-dashed border-border bg-muted/30 p-3 space-y-2"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          기고글 직접 추가
        </p>
        <input
          type="url"
          required
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm"
        />
        <input
          type="text"
          required
          placeholder="글 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm"
        />
        <div className="grid sm:grid-cols-[140px_140px] gap-2">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as "naver" | "other")}
            className="rounded border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="other">기타</option>
            <option value="naver">네이버</option>
          </select>
          <input
            type="text"
            placeholder="YYYY-MM-DD (선택)"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending || !url.trim() || !title.trim()}
          className="rounded bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition-transform active:scale-95"
        >
          {pending ? "추가 중…" : "+ 기고글 추가"}
        </button>
        {msg && (
          <p
            className={`text-xs ${msg.kind === "error" ? "text-red-600" : "text-green-700"}`}
          >
            {msg.text}
          </p>
        )}
      </form>
    </section>
  )
}
