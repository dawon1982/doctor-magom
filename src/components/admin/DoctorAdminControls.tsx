"use client"

import { useTransition } from "react"
import { Eye, EyeOff, Trash2 } from "lucide-react"
import { togglePublished, deleteDoctor } from "@/app/admin/actions"

type Props = {
  doctorId: string
  doctorName: string
  isPublished: boolean
}

/**
 * Header strip on /admin/doctors/[id]: clear publish-state pill that can be
 * toggled in one click, plus a destructive "삭제" button with a confirm
 * dialog. Both actions are server actions (no router shuffle, RSC refreshes
 * the page).
 */
export function DoctorAdminControls({
  doctorId,
  doctorName,
  isPublished,
}: Props) {
  const [pending, startTransition] = useTransition()

  function onToggle() {
    const fd = new FormData()
    fd.set("id", doctorId)
    fd.set("next", isPublished ? "false" : "true")
    startTransition(() => {
      void togglePublished(fd)
    })
  }

  function onDelete() {
    const ok = window.confirm(
      `'${doctorName}' 의사 프로필을 완전히 삭제할까요?\n\n` +
        `- 영상·기고글·후기·즐겨찾기 모두 함께 삭제됩니다.\n` +
        `- 이 작업은 되돌릴 수 없습니다.`,
    )
    if (!ok) return
    startTransition(() => {
      void deleteDoctor(doctorId)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 disabled:opacity-50 ${
          isPublished
            ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900/70"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
        }`}
        title={isPublished ? "클릭해서 숨김" : "클릭해서 공개"}
      >
        {isPublished ? (
          <>
            <Eye size={13} /> 공개 중
          </>
        ) : (
          <>
            <EyeOff size={13} /> 숨김
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-300 dark:hover:bg-red-950 transition active:scale-95 disabled:opacity-50"
        title="의사 프로필 완전 삭제"
      >
        <Trash2 size={13} /> 삭제
      </button>
    </div>
  )
}
