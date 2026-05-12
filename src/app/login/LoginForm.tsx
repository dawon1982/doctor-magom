"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { loginAction, magicLinkAction, type ActionState } from "@/app/(auth)/actions"

const initial: ActionState = {}

export default function LoginForm({
  next,
  initialError,
}: {
  next?: string
  initialError?: string
}) {
  const [mode, setMode] = useState<"password" | "magic">("password")
  const [pwState, pwAction, pwPending] = useActionState(loginAction, initial)
  const [mlState, mlAction, mlPending] = useActionState(magicLinkAction, initial)

  const errMsg =
    (mode === "password" ? pwState.error : mlState.error) ||
    (initialError === "callback" ? "로그인 링크가 만료되었거나 잘못되었어요." : "")

  return (
    <div className="space-y-6">
      <div className="flex rounded-lg border border-border p-1 bg-card text-sm">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`flex-1 px-3 py-1.5 rounded-md transition ${
            mode === "password" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          비밀번호
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`flex-1 px-3 py-1.5 rounded-md transition ${
            mode === "magic" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          매직링크
        </button>
      </div>

      {mode === "password" ? (
        <form action={pwAction} className="space-y-3">
          <input type="hidden" name="next" value={next ?? "/"} />
          <Field name="email" label="이메일" type="email" required autoComplete="email" />
          <Field
            name="password"
            label="비밀번호"
            type="password"
            required
            autoComplete="current-password"
          />
          <SubmitButton pending={pwPending}>로그인</SubmitButton>
        </form>
      ) : (
        <form action={mlAction} className="space-y-3">
          <Field name="email" label="이메일" type="email" required autoComplete="email" />
          <SubmitButton pending={mlPending}>매직링크 보내기</SubmitButton>
          {mlState.ok && mlState.message && (
            <p className="text-sm text-green-700">{mlState.message}</p>
          )}
        </form>
      )}

      {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}

      <p className="text-sm text-muted-foreground">
        아직 계정이 없으세요?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          회원가입
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

function SubmitButton({
  pending,
  children,
}: {
  pending: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
    >
      {pending ? "처리 중…" : children}
    </button>
  )
}
