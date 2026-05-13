"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { UserMenu } from "@/components/auth/UserMenu"
import type { Role } from "@/lib/supabase/types"

const navItems: { href: string; label: string; highlight?: boolean }[] = [
  { href: "/match", label: "AI 추천", highlight: true },
  { href: "/doctors", label: "선생님 찾기" },
  { href: "/videos", label: "영상 보기" },
  { href: "/articles", label: "기고글" },
  { href: "/about", label: "서비스 소개" },
]

export type HeaderUser = {
  email: string | null
  displayName: string | null
  role: Role
} | null

export function HeaderNav({ user }: { user: HeaderUser }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/magom-bear.png"
              alt=""
              aria-hidden
              width={32}
              height={32}
              className="h-8 w-8 transition-transform group-hover:scale-110"
              draggable={false}
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight text-foreground">닥터마음곰</span>
              <span className="text-[10px] text-muted-foreground font-medium">Dr. Magom</span>
            </div>
          </Link>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const base = "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1"
              const cls = isActive
                ? "bg-primary text-primary-foreground"
                : item.highlight
                  ? "text-primary hover:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              return (
                <Link key={item.href} href={item.href} className={`${base} ${cls}`}>
                  {item.highlight && !isActive && <span aria-hidden>✨</span>}
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* 데스크탑 CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/apply"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              의사 입점 문의
            </Link>
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const base = "px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
              const cls = isActive
                ? "bg-primary text-primary-foreground"
                : item.highlight
                  ? "text-primary bg-primary/5"
                  : "text-foreground hover:bg-muted"
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`${base} ${cls}`}
                >
                  {item.highlight && !isActive && <span aria-hidden>✨</span>}
                  {item.label}
                </Link>
              )
            })}
            <div className="pt-3 border-t border-border mt-2 flex flex-col gap-2">
              <Link
                href="/apply"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted"
              >
                의사 입점 문의
              </Link>
              {user ? (
                <>
                  {(user.role === "admin" || user.role === "doctor") && (
                    <Link
                      href={user.role === "admin" ? "/admin" : "/doctor/profile"}
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-sm text-foreground hover:bg-muted"
                    >
                      {user.role === "admin" ? "관리자" : "내 프로필"}
                    </Link>
                  )}
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted"
                    >
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
