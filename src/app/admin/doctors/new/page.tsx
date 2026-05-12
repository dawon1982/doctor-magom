import Link from "next/link"
import DoctorForm from "@/components/admin/DoctorForm"
import { createDoctor } from "@/app/admin/actions"

export const dynamic = "force-dynamic"

export default function NewDoctorPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">새 의사 등록</h1>
        <Link
          href="/admin/doctors"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 목록
        </Link>
      </div>
      <DoctorForm action={createDoctor} submitLabel="등록" />
    </div>
  )
}
