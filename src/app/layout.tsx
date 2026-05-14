import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { HeaderShell } from "@/components/layout/HeaderShell"
import { Footer } from "@/components/layout/Footer"
import { getSiteUrl, SITE_NAME, SITE_TAGLINE } from "@/lib/site"

const SITE_URL = getSiteUrl()
const SITE_TITLE = `${SITE_NAME} | ${SITE_TAGLINE}`
const SITE_DESCRIPTION =
  "정신건강의학과 의사의 얼굴, 말투, 영상, 글을 보고 나와 잘 맞는 선생님을 직접 골라보세요. AI가 내 상황에 맞는 의사를 추천해줘요."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "정신건강의학과",
    "정신과",
    "정신과 추천",
    "ADHD",
    "우울증",
    "불안장애",
    "공황장애",
    "불면증",
    "의사 추천",
    "강남 정신과",
    "AI 의사 매칭",
    "닥터마음곰",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Icon is generated dynamically by src/app/icon.tsx — Next handles the
  // <link rel="icon"> tag automatically, no need to set it here.
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<HeaderShell />}>
          <Header />
        </Suspense>
        <main className="flex-1">
          <Suspense fallback={null}>{children}</Suspense>
        </main>
        <Footer />
      </body>
    </html>
  )
}
