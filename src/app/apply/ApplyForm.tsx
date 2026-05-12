"use client"

import { useState } from "react"

export default function ApplyForm() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const res = await fetch("/api/doctor-applications", {
      method: "POST",
      body: JSON.stringify({
        applicantName: fd.get("applicantName"),
        applicantEmail: fd.get("applicantEmail"),
        hospital: fd.get("hospital"),
        phone: fd.get("phone"),
        message: fd.get("message"),
      }),
      headers: { "Content-Type": "application/json" },
    })
    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(json.error ?? "신청 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.")
      setPending(false)
      return
    }
    setDone(true)
    setPending(false)
  }

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <p className="font-semibold mb-1">신청을 잘 받았어요!</p>
        <p className="text-sm text-muted-foreground">
          영업일 기준 3일 이내에 입력하신 이메일로 답변드릴게요.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field name="applicantName" label="이름" required />
      <Field name="applicantEmail" label="이메일" type="email" required />
      <Field name="hospital" label="병원명" required />
      <Field name="phone" label="연락처 (선택)" />
      <Textarea
        name="message"
        label="자기소개·진료 스타일·보유 자료 등"
        rows={5}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "전송 중…" : "신청하기"}
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
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  )
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string },
) {
  const { label, ...rest } = props
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <textarea
        {...rest}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  )
}
