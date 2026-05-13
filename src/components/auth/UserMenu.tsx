"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import type { HeaderUser } from "@/components/layout/HeaderNav"

export function UserMenu({ user }: { user: NonNullable<HeaderUser> }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  const initial =
    (user.displayName ?? user.email ?? "?").trim().charAt(0).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1 hover:bg-accent transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          {initial}
        </span>
        <span className="hidden lg:inline text-sm text-muted-foreground max-w-[120px] truncate">
          {user.displayName ?? user.email}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg overflow-hidden text-sm"
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="font-medium truncate">{user.displayName ?? "사용자"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="block px-3 py-2 hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              관리자 대시보드
            </Link>
          )}
          {user.role === "doctor" && (
            <Link
              href="/doctor/profile"
              className="block px-3 py-2 hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              내 프로필
            </Link>
          )}
          <Link
            href="/favorites"
            className="block px-3 py-2 hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            ❤️ 즐겨찾기
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full text-left px-3 py-2 hover:bg-accent text-muted-foreground"
            >
              로그아웃
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
