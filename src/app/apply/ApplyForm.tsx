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
    const body = {
      applicantName: fd.get("applicantName"),
      applicantEmail: fd.get("applicantEmail"),
      hospital: fd.get("hospital"),
      hospitalPhone: fd.get("hospitalPhone"),
      mobilePhone: fd.get("mobilePhone"),
      hospitalWebsite: fd.get("hospitalWebsite"),
      personalWebsite: fd.get("personalWebsite"),
      blogUrl: fd.get("blogUrl"),
      youtubeUrl: fd.get("youtubeUrl"),
      instagramUrl: fd.get("instagramUrl"),
      message: fd.get("message"),
    }
    const res = await fetch("/api/doctor-applications", {
      method: "POST",
      body: JSON.stringify(body),
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <SectionTitle>기본 정보</SectionTitle>
      <Field name="applicantName" label="이름" required />
      <Field name="applicantEmail" label="이메일" type="email" required />
      <Field name="hospital" label="병원명" required />

      <SectionTitle>연락처</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field
          name="hospitalPhone"
          label="연락처 (병원)"
          type="tel"
          placeholder="02-1234-5678"
        />
        <Field
          name="mobilePhone"
          label="연락처 (휴대폰)"
          type="tel"
          placeholder="010-1234-5678"
        />
      </div>

      <SectionTitle>채널·자료 (있는 것만 입력)</SectionTitle>
      <Field
        name="hospitalWebsite"
        label="병원 홈페이지"
        type="url"
        placeholder="https://"
      />
      <Field
        name="personalWebsite"
        label="개인 홈페이지"
        type="url"
        placeholder="https://"
      />
      <Field name="blogUrl" label="블로그" type="url" placeholder="https://blog.naver.com/..." />
      <Field
        name="youtubeUrl"
        label="유튜브"
        type="url"
        placeholder="https://youtube.com/@..."
      />
      <Field
        name="instagramUrl"
        label="인스타그램"
        type="url"
        placeholder="https://instagram.com/..."
      />

      <SectionTitle>자기소개</SectionTitle>
      <Textarea
        name="message"
        label="진료 스타일·전문분야·하고 싶은 말 등"
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">
      {children}
    </p>
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
