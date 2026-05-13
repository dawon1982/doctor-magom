import type { Metadata } from "next"
import Link from "next/link"
import { Heart } from "lucide-react"
import { getAllDoctors } from "@/lib/data/doctors-db"
import { getSessionUser } from "@/lib/auth/dal"
import { getMyFavoriteDoctorIds } from "@/lib/actions/favorites"
import { DoctorCard } from "@/components/doctor/DoctorCard"

export const metadata: Metadata = {
  title: "내 즐겨찾기",
  description:
    "닥터마음곰에서 마음에 든 정신건강의학과 선생님들을 한곳에 모아보세요.",
  alternates: { canonical: "/favorites" },
  robots: { index: false, follow: false },
}

export default async function FavoritesPage() {
  const user = await getSessionUser()
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <span className="text-4xl">🐻</span>
        <h1 className="text-2xl font-bold mt-3 mb-2">내 즐겨찾기</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          즐겨찾기 기능을 사용하려면 로그인이 필요해요. 회원가입은 무료이며,
          이메일·비밀번호 또는 매직링크로 1분 안에 가입할 수 있어요.
        </p>
        <Link
          href="/login?next=/favorites"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          로그인하러 가기
        </Link>
      </div>
    )
  }

  const [doctors, favoriteIds] = await Promise.all([
    getAllDoctors(),
    getMyFavoriteDoctorIds(),
  ])
  const favorited = doctors.filter((d) => favoriteIds.has(d.id))

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Heart size={22} className="text-rose-500" fill="currentColor" />
        <h1 className="text-2xl sm:text-3xl font-bold">내 즐겨찾기</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        총 {favorited.length}명 — 의사 프로필에서 하트 버튼으로 추가·해제할 수 있어요.
      </p>

      {favorited.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <span className="text-3xl">💛</span>
          <p className="text-sm text-muted-foreground mt-3 mb-4 leading-relaxed">
            아직 즐겨찾기에 추가한 선생님이 없어요.
            <br />
            마음에 드는 선생님을 발견하면 하트 버튼으로 저장해두세요.
          </p>
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            선생님 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorited.map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
        </div>
      )}
    </div>
  )
}
