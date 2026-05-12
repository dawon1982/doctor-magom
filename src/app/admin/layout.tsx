import Link from "next/link"
import { requireRole } from "@/lib/auth/dal"


const NAV = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/doctors", label: "의사 관리" },
  { href: "/admin/applications", label: "입점 신청" },
  { href: "/admin/patients", label: "환자 CRM" },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole("admin")

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 grid gap-8 md:grid-cols-[200px_1fr]">
      <aside className="md:sticky md:top-20 self-start">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          관리자
        </p>
        <nav className="flex md:flex-col gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 hover:bg-accent transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-xs text-muted-foreground">
          {user.displayName ?? user.email}
        </p>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  )
}
