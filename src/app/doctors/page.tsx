"use client"

import { useState, useMemo } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { doctors, allSpecialties, allRegions } from "@/lib/data/doctors"
import { DoctorCard } from "@/components/doctor/DoctorCard"
import type { Metadata } from "next"

const styleKeywords = [
  "지지적인", "공감적인", "명쾌한", "격려하는", "현실적 조언", "분석적인", "경청하는", "따뜻한",
]

export default function DoctorsPage() {
  const [search, setSearch] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const matchSearch =
        !search ||
        d.name.includes(search) ||
        d.hospital.includes(search) ||
        d.district.includes(search) ||
        d.specialties.some((s) => s.includes(search))

      const matchRegion = !selectedRegion || d.region === selectedRegion || d.district === selectedRegion
      const matchSpecialty = !selectedSpecialty || d.specialties.includes(selectedSpecialty)
      const matchStyle = !selectedStyle || d.keywords.includes(selectedStyle)

      return matchSearch && matchRegion && matchSpecialty && matchStyle
    })
  }, [search, selectedRegion, selectedSpecialty, selectedStyle])

  const hasFilters = selectedRegion || selectedSpecialty || selectedStyle
  const clearFilters = () => {
    setSelectedRegion(null)
    setSelectedSpecialty(null)
    setSelectedStyle(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="bg-gradient-to-b from-accent/30 to-background py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-medium text-primary mb-2">마음곰 선생님들</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            선생님 찾기
          </h1>
          <p className="text-muted-foreground text-sm word-keep">
            총 {doctors.length}명의 정신건강의학과 전문의가 함께해요
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* 검색 + 필터 토글 */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="이름, 병원, 전문분야로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              hasFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">필터</span>
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {[selectedRegion, selectedSpecialty, selectedStyle].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* 필터 패널 */}
        {showFilters && (
          <div className="rounded-2xl border border-border bg-card p-5 mb-6 space-y-5">
            {/* 지역 */}
            <div>
              <p className="text-sm font-semibold mb-3">지역</p>
              <div className="flex flex-wrap gap-2">
                {["서울", "강남구", "서초구", "용산구", "송파구", "강서구", "금천구", "경기", "안양시", "동두천시", "구리시"].map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      selectedRegion === region
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* 전문분야 */}
            <div>
              <p className="text-sm font-semibold mb-3">전문분야</p>
              <div className="flex flex-wrap gap-2">
                {allSpecialties.map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSelectedSpecialty(selectedSpecialty === sp ? null : sp)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      selectedSpecialty === sp
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* 진료 스타일 */}
            <div>
              <p className="text-sm font-semibold mb-3">진료 스타일</p>
              <div className="flex flex-wrap gap-2">
                {styleKeywords.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(selectedStyle === style ? null : style)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      selectedStyle === style
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <X size={13} /> 필터 초기화
              </button>
            )}
          </div>
        )}

        {/* 활성 필터 태그 */}
        {hasFilters && !showFilters && (
          <div className="flex flex-wrap gap-2 mb-5">
            {selectedRegion && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {selectedRegion}
                <button onClick={() => setSelectedRegion(null)}><X size={11} /></button>
              </span>
            )}
            {selectedSpecialty && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {selectedSpecialty}
                <button onClick={() => setSelectedSpecialty(null)}><X size={11} /></button>
              </span>
            )}
            {selectedStyle && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {selectedStyle}
                <button onClick={() => setSelectedStyle(null)}><X size={11} /></button>
              </span>
            )}
          </div>
        )}

        {/* 결과 수 */}
        <p className="text-sm text-muted-foreground mb-5">
          {filtered.length}명의 선생님
          {(search || hasFilters) && " (필터 적용됨)"}
        </p>

        {/* 그리드 */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-5xl">🐻</span>
            <p className="mt-4 text-muted-foreground font-medium">검색 결과가 없어요</p>
            <p className="text-sm text-muted-foreground mt-1">다른 검색어나 필터를 시도해보세요</p>
            <button
              onClick={() => { setSearch(""); clearFilters() }}
              className="mt-4 text-sm text-primary hover:underline"
            >
              전체 보기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
