import type { Metadata } from "next"
import {
  getAllDoctors,
  getAllSpecialties,
} from "@/lib/data/doctors-db"
import DoctorsClient from "./DoctorsClient"

export const metadata: Metadata = {
  title: "선생님 찾기",
  description: "닥터마음곰에 등록된 정신건강의학과 전문의를 검색하고 필터링하세요.",
}

export default async function DoctorsPage() {
  const [doctors, specialties] = await Promise.all([
    getAllDoctors(),
    getAllSpecialties(),
  ])
  return <DoctorsClient doctors={doctors} specialties={specialties} />
}
