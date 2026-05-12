"use client"

import { useActionState, useState, useTransition } from "react"
import { fillDoctorAi } from "@/app/admin/doctors/[id]/ai-actions"

export type DoctorFormValues = {
  slug?: string
  name?: string
  hospital?: string
  location?: string
  district?: string
  region?: string
  specialties?: string[]
  keywords?: string[]
  targetPatients?: string[]
  treatments?: string[]
  bio?: string
  hours?: { day: string; time: string }[]
  lunchBreak?: string | null
  closedDays?: string | null
  reviewKeywords?: { text: string; count: number }[]
  kakaoUrl?: string | null
  websiteUrl?: string | null
  photoPlaceholderColor?: string
  isPublished?: boolean
}

type ActionState = { error?: string; ok?: boolean }

type State = {
  slug: string
  name: string
  hospital: string
  region: string
  district: string
  location: string
  bio: string
  specialties: string
  keywords: string
  targetPatients: string
  treatments: string
  hours: string
  lunchBreak: string
  closedDays: string
  reviewKeywords: string
  kakaoUrl: string
  websiteUrl: string
  photoPlaceholderColor: string
}

function initialState(v: DoctorFormValues): State {
  return {
    slug: v.slug ?? "",
    name: v.name ?? "",
    hospital: v.hospital ?? "",
    region: v.region ?? "서울",
    district: v.district ?? "",
    location: v.location ?? "",
    bio: v.bio ?? "",
    specialties: (v.specialties ?? []).join(", "),
    keywords: (v.keywords ?? []).join(", "),
    targetPatients: (v.targetPatients ?? []).join(", "),
    treatments: (v.treatments ?? []).join(", "),
    hours: JSON.stringify(v.hours ?? [], null, 2),
    lunchBreak: v.lunchBreak ?? "",
    closedDays: v.closedDays ?? "",
    reviewKeywords: JSON.stringify(v.reviewKeywords ?? [], null, 2),
    kakaoUrl: v.kakaoUrl ?? "",
    websiteUrl: v.websiteUrl ?? "",
    photoPlaceholderColor: v.photoPlaceholderColor ?? "#D4895A",
  }
}

export default function DoctorForm({
  initial,
  action,
  submitLabel = "저장",
  slugEditable = true,
  doctorId,
}: {
  initial?: DoctorFormValues
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  submitLabel?: string
  slugEditable?: boolean
  /** When present, shows the "AI 자동 채움" button (only on edit, not create). */
  doctorId?: string
}) {
  const [actionState, formAction, pending] = useActionState(action, {})
  const [s, setS] = useState<State>(() => initialState(initial ?? {}))
  const [isPublished, setIsPublished] = useState<boolean>(initial?.isPublished ?? true)
  const [aiPending, startAi] = useTransition()
  const [aiMsg, setAiMsg] = useState<
    { kind: "info" | "error"; text: string } | null
  >(null)

  const update = (patch: Partial<State>) => setS((prev) => ({ ...prev, ...patch }))

  function runAiFill() {
    if (!doctorId) return
    const url = s.websiteUrl.trim()
    if (!url) {
      setAiMsg({ kind: "error", text: "먼저 병원 홈페이지 URL을 입력해주세요." })
      return
    }
    setAiMsg(null)
    startAi(async () => {
      const result = await fillDoctorAi(doctorId, url)
      if (!result.ok) {
        setAiMsg({ kind: "error", text: result.error })
        return
      }
      const d = result.data
      const patch: Partial<State> = {}
      let filledCount = 0
      if (d.region) {
        patch.region = d.region
        filledCount++
      }
      if (d.district) {
        patch.district = d.district
        filledCount++
      }
      if (d.location) {
        patch.location = d.location
        filledCount++
      }
      if (d.bio) {
        patch.bio = d.bio
        filledCount++
      }
      if (d.specialties?.length) {
        patch.specialties = d.specialties.join(", ")
        filledCount++
      }
      if (d.keywords?.length) {
        patch.keywords = d.keywords.join(", ")
        filledCount++
      }
      if (d.targetPatients?.length) {
        patch.targetPatients = d.targetPatients.join(", ")
        filledCount++
      }
      if (d.treatments?.length) {
        patch.treatments = d.treatments.join(", ")
        filledCount++
      }
      if (d.hours?.length) {
        patch.hours = JSON.stringify(d.hours, null, 2)
        filledCount++
      }
      if (d.lunchBreak) {
        patch.lunchBreak = d.lunchBreak
        filledCount++
      }
      if (d.closedDays) {
        patch.closedDays = d.closedDays
        filledCount++
      }
      if (d.kakaoUrl) {
        patch.kakaoUrl = d.kakaoUrl
        filledCount++
      }
      update(patch)
      setAiMsg({
        kind: "info",
        text: `AI가 ${filledCount}개 필드를 제안했어요. 검토 후 저장하세요.`,
      })
    })
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field
          name="slug"
          label={slugEditable ? "Slug (URL)" : "Slug (URL) — 변경 불가"}
          value={s.slug}
          onChange={(e) => update({ slug: e.target.value })}
          required
          readOnly={!slugEditable}
          pattern="[a-z0-9-]+"
        />
        <Field
          name="name"
          label="이름"
          value={s.name}
          onChange={(e) => update({ name: e.target.value })}
          required
        />
        <Field
          name="hospital"
          label="병원명"
          value={s.hospital}
          onChange={(e) => update({ hospital: e.target.value })}
          required
        />
        <Field
          name="region"
          label="지역 (서울/경기/인천/기타)"
          value={s.region}
          onChange={(e) => update({ region: e.target.value })}
          required
        />
        <Field
          name="district"
          label="구·시"
          value={s.district}
          onChange={(e) => update({ district: e.target.value })}
          required
        />
        <Field
          name="location"
          label="상세 위치"
          value={s.location}
          onChange={(e) => update({ location: e.target.value })}
          required
        />
      </div>

      <Textarea
        name="bio"
        label="소개"
        value={s.bio}
        onChange={(e) => update({ bio: e.target.value })}
        rows={3}
      />

      <Field
        name="specialties"
        label="전문분야 (쉼표 구분)"
        value={s.specialties}
        onChange={(e) => update({ specialties: e.target.value })}
      />
      <Field
        name="keywords"
        label="진료 스타일 키워드 (쉼표 구분)"
        value={s.keywords}
        onChange={(e) => update({ keywords: e.target.value })}
      />
      <Field
        name="targetPatients"
        label="환자군 (쉼표 구분)"
        value={s.targetPatients}
        onChange={(e) => update({ targetPatients: e.target.value })}
      />
      <Field
        name="treatments"
        label="치료·검사 (쉼표 구분)"
        value={s.treatments}
        onChange={(e) => update({ treatments: e.target.value })}
      />

      <Textarea
        name="hours"
        label='진료시간 JSON (예: [{"day":"월·화·목·금","time":"10:00 - 19:00"}])'
        value={s.hours}
        onChange={(e) => update({ hours: e.target.value })}
        rows={4}
        mono
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field
          name="lunchBreak"
          label="점심 시간"
          value={s.lunchBreak}
          onChange={(e) => update({ lunchBreak: e.target.value })}
        />
        <Field
          name="closedDays"
          label="휴진"
          value={s.closedDays}
          onChange={(e) => update({ closedDays: e.target.value })}
        />
      </div>

      <Textarea
        name="reviewKeywords"
        label='후기 키워드 JSON (예: [{"text":"친절해요","count":28}])'
        value={s.reviewKeywords}
        onChange={(e) => update({ reviewKeywords: e.target.value })}
        rows={4}
        mono
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <Field
          name="kakaoUrl"
          label="카카오톡 채널 URL"
          value={s.kakaoUrl}
          onChange={(e) => update({ kakaoUrl: e.target.value })}
          type="url"
        />
        <div>
          <label className="block">
            <span className="block text-sm font-medium mb-1">
              병원 홈페이지 URL
            </span>
            <div className="flex gap-2">
              <input
                name="websiteUrl"
                type="url"
                value={s.websiteUrl}
                onChange={(e) => update({ websiteUrl: e.target.value })}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="https://..."
              />
              {doctorId && (
                <button
                  type="button"
                  onClick={runAiFill}
                  disabled={aiPending || !s.websiteUrl.trim()}
                  className="shrink-0 rounded-lg bg-secondary text-secondary-foreground px-3 py-2 text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-transform active:scale-95"
                  title="이 URL을 AI가 읽어 폼 필드를 자동으로 제안합니다 (저장은 수동)"
                >
                  {aiPending ? "AI 읽는 중…" : "✨ AI 자동 채움"}
                </button>
              )}
            </div>
          </label>
          {aiMsg && (
            <p
              className={`mt-1.5 text-xs ${
                aiMsg.kind === "error" ? "text-red-600" : "text-green-700"
              }`}
            >
              {aiMsg.text}
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 items-end">
        <Field
          name="photoPlaceholderColor"
          label="아바타 색상"
          value={s.photoPlaceholderColor}
          onChange={(e) => update({ photoPlaceholderColor: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4"
          />
          공개 (사이트에 노출)
        </label>
      </div>

      {actionState.error && (
        <p className="text-sm text-red-600">{actionState.error}</p>
      )}
      {actionState.ok && (
        <p className="text-sm text-green-700">저장되었어요.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-medium disabled:opacity-50 transition-transform active:scale-95"
      >
        {pending ? "저장 중…" : submitLabel}
      </button>
    </form>
  )
}

function Field(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string },
) {
  const { label, className, ...rest } = props
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        {...rest}
        className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-60 ${
          className ?? ""
        }`}
      />
    </label>
  )
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string
    mono?: boolean
  },
) {
  const { label, mono, className, ...rest } = props
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <textarea
        {...rest}
        className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ${
          mono ? "font-mono text-xs" : ""
        } ${className ?? ""}`}
      />
    </label>
  )
}
