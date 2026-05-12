import type { Metadata } from "next"
import SignupForm from "./SignupForm"

export const metadata: Metadata = {
  title: "회원가입",
}

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">회원가입</h1>
      <p className="text-sm text-muted-foreground mb-8">
        닥터마음곰에 오신 걸 환영해요. 이메일과 비밀번호로 시작하세요.
      </p>
      <SignupForm />
    </div>
  )
}
