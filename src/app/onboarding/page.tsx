import type { Metadata } from "next"
import { requireUser } from "@/lib/auth/dal"
import OnboardingForm from "./OnboardingForm"

export const metadata: Metadata = {
  title: "정보 입력",
}

export default async function OnboardingPage() {
  await requireUser()
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">조금 더 알려주세요</h1>
      <p className="text-sm text-muted-foreground mb-8">
        선택 입력이에요. 비워두고 넘어가도 괜찮아요. 입력하시면 더 잘 맞는 선생님을 추천해드릴 수 있어요.
      </p>
      <OnboardingForm />
    </div>
  )
}
