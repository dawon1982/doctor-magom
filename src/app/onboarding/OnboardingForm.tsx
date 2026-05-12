"use client"

import Link from "next/link"
import { useActionState } from "react"
import { completeOnboardingAction, type ActionState } from "@/app/(auth)/actions"

const AGE_OPTIONS = ["10대", "20대", "30대", "40대", "50대 이상"]
const GENDER_OPTIONS = ["여성", "남성", "기타", "응답 안 함"]
const REGION_OPTIONS = ["서울", "경기", "인천", "기타"]

const initial: ActionState = {}

export default function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    initial,
  )

  return (
    <form action={formAction} className="space-y-5">
      <PillSelect name="ageRange" label="연령대" options={AGE_OPTIONS} />
      <PillSelect name="gender" label="성별" options={GENDER_OPTIONS} />
      <PillSelect name="preferredRegion" label="진료 받고 싶은 지역" options={REGION_OPTIONS} />
      <label className="block">
        <span className="block text-sm font-medium mb-1">고민하는 주제 (선택)</span>
        <input
          name="primaryConcern"
          type="text"
          maxLength={120}
          placeholder="예: 우울, 불면, 직장 스트레스"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="marketingConsent" value="true" className="h-4 w-4" />
        새로운 의사 소식과 콘텐츠를 이메일로 받고 싶어요
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "저장 중…" : "저장하고 시작"}
        </button>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          나중에
        </Link>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  )
}

function PillSelect({
  name,
  label,
  options,
}: {
  name: string
  label: string
  options: string[]
}) {
  return (
    <fieldset>
      <legend className="block text-sm font-medium mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-sm hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-primary"
          >
            <input type="radio" name={name} value={opt} className="sr-only" />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
