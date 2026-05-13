"use client"

import { useRef, useState, useTransition } from "react"
import { Upload, X } from "lucide-react"
import { uploadDoctorPhoto, removeDoctorPhoto } from "@/lib/actions/doctor-photo"

type Props = {
  doctorId: string
  initialUrl?: string | null
  placeholderColor?: string
  initial?: string
}

export function PhotoUploader({
  doctorId,
  initialUrl,
  placeholderColor = "#D4895A",
  initial = "?",
}: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl ?? null)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ kind: "info" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMsg(null)
    const fd = new FormData()
    fd.append("photo", file)
    startTransition(async () => {
      const res = await uploadDoctorPhoto(doctorId, fd)
      if (!res.ok) {
        setMsg({ kind: "error", text: res.error })
        return
      }
      // Cache-bust so the new image shows immediately
      setUrl(`${res.url}?t=${Date.now()}`)
      setMsg({ kind: "info", text: "사진을 업로드했어요." })
      if (fileInputRef.current) fileInputRef.current.value = ""
    })
  }

  function onRemove() {
    if (!url) return
    if (!confirm("프로필 사진을 삭제할까요?")) return
    setMsg(null)
    startTransition(async () => {
      const res = await removeDoctorPhoto(doctorId)
      if ("ok" in res && res.ok) {
        setUrl(null)
        setMsg({ kind: "info", text: "사진을 삭제했어요." })
      } else if ("error" in res) {
        setMsg({ kind: "error", text: res.error })
      }
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">프로필 사진</p>
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-sm"
          style={url ? undefined : { backgroundColor: placeholderColor }}
        >
          {url ? (
            // Use a regular img — Supabase Storage public URLs are remote so
            // next/image would need remotePatterns config. Avatar is small (80px).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="프로필 사진 미리보기"
              className="w-full h-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            disabled={pending}
            className="block text-xs file:mr-2 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-xs file:font-medium file:cursor-pointer hover:file:opacity-90"
          />
          <div className="flex items-center gap-2 text-xs">
            {url && (
              <button
                type="button"
                onClick={onRemove}
                disabled={pending}
                className="inline-flex items-center gap-1 text-red-600 hover:underline disabled:opacity-50"
              >
                <X size={11} /> 사진 삭제
              </button>
            )}
            <span className="text-muted-foreground">
              JPG/PNG/WebP, 5MB 이하
            </span>
          </div>
        </div>
        {pending && (
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Upload size={12} className="animate-pulse" /> 처리 중…
          </span>
        )}
      </div>
      {msg && (
        <p
          className={`text-xs ${msg.kind === "error" ? "text-red-600" : "text-green-700"}`}
        >
          {msg.text}
        </p>
      )}
    </div>
  )
}
