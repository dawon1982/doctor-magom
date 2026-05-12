"use client"

import Link from "next/link"
import { useActionState } from "react"
import { signupAction, type ActionState } from "@/app/(auth)/actions"

const initial: ActionState = {}

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initial)
  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-3">
        <Field
          name="displayName"
          label="이름 (혹은 닉네임)"
          type="text"
          required
          autoComplete="name"
        />
        <Field name="email" label="이메일" type="email" required autoComplete="email" />
        <Field
          name="password"
          label="비밀번호 (8자 이상)"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
        >
          {pending ? "가입 중…" : "가입하기"}
        </button>
      </form>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && state.message && (
        <p className="text-sm text-green-700">{state.message}</p>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">
        가입하시면 닥터마음곰의 이용약관과 개인정보 처리방침에 동의하신 것으로 간주됩니다.
        의사 분이시면 별도 입점 절차가 있어요 —{" "}
        <Link href="/apply" className="text-primary hover:underline">
          입점 신청
        </Link>
      </p>

      <p className="text-sm text-muted-foreground">
        이미 계정이 있으세요?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        {...rest}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  )
}
