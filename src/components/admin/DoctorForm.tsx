"use client"

import { useActionState } from "react"

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

export default function DoctorForm({
  initial,
  action,
  submitLabel = "저장",
  slugEditable = true,
}: {
  initial?: DoctorFormValues
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  submitLabel?: string
  slugEditable?: boolean
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const v = initial ?? {}

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field
          name="slug"
          label={slugEditable ? "Slug (URL)" : "Slug (URL) — 변경 불가"}
          defaultValue={v.slug ?? ""}
          required
          readOnly={!slugEditable}
          pattern="[a-z0-9-]+"
        />
        <Field name="name" label="이름" defaultValue={v.name ?? ""} required />
        <Field
          name="hospital"
          label="병원명"
          defaultValue={v.hospital ?? ""}
          required
        />
        <Field
          name="region"
          label="지역 (서울/경기/인천/기타)"
          defaultValue={v.region ?? "서울"}
          required
        />
        <Field
          name="district"
          label="구·시"
          defaultValue={v.district ?? ""}
          required
        />
        <Field
          name="location"
          label="상세 위치"
          defaultValue={v.location ?? ""}
          required
        />
      </div>

      <Textarea
        name="bio"
        label="소개"
        defaultValue={v.bio ?? ""}
        rows={3}
      />

      <Field
        name="specialties"
        label="전문분야 (쉼표 구분)"
        defaultValue={(v.specialties ?? []).join(", ")}
      />
      <Field
        name="keywords"
        label="진료 스타일 키워드 (쉼표 구분)"
        defaultValue={(v.keywords ?? []).join(", ")}
      />
      <Field
        name="targetPatients"
        label="환자군 (쉼표 구분)"
        defaultValue={(v.targetPatients ?? []).join(", ")}
      />
      <Field
        name="treatments"
        label="치료·검사 (쉼표 구분)"
        defaultValue={(v.treatments ?? []).join(", ")}
      />

      <Textarea
        name="hours"
        label='진료시간 JSON (예: [{"day":"월·화·목·금","time":"10:00 - 19:00"}])'
        defaultValue={JSON.stringify(v.hours ?? [], null, 2)}
        rows={4}
        mono
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field
          name="lunchBreak"
          label="점심 시간"
          defaultValue={v.lunchBreak ?? ""}
        />
        <Field
          name="closedDays"
          label="휴진"
          defaultValue={v.closedDays ?? ""}
        />
      </div>

      <Textarea
        name="reviewKeywords"
        label='후기 키워드 JSON (예: [{"text":"친절해요","count":28}])'
        defaultValue={JSON.stringify(v.reviewKeywords ?? [], null, 2)}
        rows={4}
        mono
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <Field
          name="kakaoUrl"
          label="카카오톡 채널 URL"
          defaultValue={v.kakaoUrl ?? ""}
          type="url"
        />
        <Field
          name="websiteUrl"
          label="병원 홈페이지 URL"
          defaultValue={v.websiteUrl ?? ""}
          type="url"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 items-end">
        <Field
          name="photoPlaceholderColor"
          label="아바타 색상"
          defaultValue={v.photoPlaceholderColor ?? "#D4895A"}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={v.isPublished ?? true}
            className="h-4 w-4"
          />
          공개 (사이트에 노출)
        </label>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">저장되었어요.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "저장 중…" : submitLabel}
      </button>
    </form>
  )
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        {...rest}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
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
