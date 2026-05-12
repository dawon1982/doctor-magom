import type { Metadata } from "next"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: {
    default: "닥터마음곰 | 나와 맞는 정신건강의학과 선생님 찾기",
    template: "%s | 닥터마음곰",
  },
  description:
    "정신건강의학과 의사의 얼굴, 말투, 영상, 글을 보고 나와 잘 맞는 선생님을 직접 골라보세요. 강남언니처럼, 마음 맞는 정신건강의학과 선생님과 연결됩니다.",
  keywords: ["정신건강의학과", "정신과", "ADHD", "우울증", "공황장애", "의사 추천", "닥터마음곰"],
  openGraph: {
    title: "닥터마음곰 | 나와 맞는 정신건강의학과 선생님 찾기",
    description: "정신건강의학과 의사의 얼굴, 말투, 영상, 글을 보고 나와 맞는 선생님을 직접 골라보세요.",
    locale: "ko_KR",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
