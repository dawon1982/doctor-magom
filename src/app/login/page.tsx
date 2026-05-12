import type { Metadata } from "next"
import LoginForm from "./LoginForm"

export const metadata: Metadata = {
  title: "로그인",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const sp = await searchParams
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">로그인</h1>
      <p className="text-sm text-muted-foreground mb-8">
        닥터마음곰 계정으로 로그인해주세요.
      </p>
      <LoginForm next={sp.next} initialError={sp.error} />
    </div>
  )
}
