import type { Metadata } from "next"
import {
  getAllDoctors,
  getAllSpecialties,
} from "@/lib/data/doctors-db"
import DoctorsClient from "./DoctorsClient"

export const metadata: Metadata = {
  title: "선생님 찾기",
  description:
    "강남·서초·용산·경기 등 지역별, 우울·ADHD·공황·불면 등 전문분야별로 정신건강의학과 전문의를 검색하세요. 진료 스타일과 영상으로 미리 만나보고 마음에 드는 선생님을 직접 골라보세요.",
  alternates: { canonical: "/doctors" },
  openGraph: {
    title: "선생님 찾기 | 닥터마음곰",
    description: "지역·전문분야·진료 스타일로 정신건강의학과 의사를 찾아보세요.",
    type: "website",
  },
}

export default async function DoctorsPage() {
  const [doctors, specialties] = await Promise.all([
    getAllDoctors(),
    getAllSpecialties(),
  ])
  return <DoctorsClient doctors={doctors} specialties={specialties} />
}
