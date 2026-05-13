"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Search, SlidersHorizontal, X, ArrowRight, User, Building2, Tag, MapPin } from "lucide-react"
import Link from "next/link"
import { DoctorCard } from "@/components/doctor/DoctorCard"
import type { Doctor } from "@/lib/data/doctors-db"

const MAX_COMPARE = 3
const SUGGESTION_LIMIT = 8

type Suggestion = {
  type: "doctor" | "hospital" | "specialty" | "keyword" | "district"
  value: string
  // For doctor type only — let the user jump straight to the profile
  slug?: string
  hospital?: string
}

function buildSuggestions(doctors: Doctor[], query: string): Suggestion[] {
  const q = query.trim()
  if (!q) return []
  const seen = new Set<string>()
  const out: Suggestion[] = []
  const push = (s: Suggestion) => {
    const key = `${s.type}:${s.value}`
    if (seen.has(key)) return
    seen.add(key)
    out.push(s)
  }

  // Doctor names first (highest signal)
  for (const d of doctors) {
    if (d.name.includes(q)) {
      push({ type: "doctor", value: d.name, slug: d.slug, hospital: d.hospital })
    }
  }
  // Hospital names
  for (const d of doctors) {
    if (d.hospital.includes(q)) push({ type: "hospital", value: d.hospital })
  }
  // Specialties
  for (const d of doctors) {
    for (const s of d.specialties) {
      if (s.includes(q)) push({ type: "specialty", value: s })
    }
  }
  // Styles
  for (const d of doctors) {
    for (const k of d.keywords) {
      if (k.includes(q)) push({ type: "keyword", value: k })
    }
  }
  // Districts
  for (const d of doctors) {
    if (d.district.includes(q)) push({ type: "district", value: d.district })
  }

  return out.slice(0, SUGGESTION_LIMIT)
}

const SUGGESTION_ICONS: Record<Suggestion["type"], React.ReactNode> = {
  doctor: <User size={13} />,
  hospital: <Building2 size={13} />,
  specialty: <Tag size={13} />,
  keyword: <Tag size={13} />,
  district: <MapPin size={13} />,
}

const SUGGESTION_LABELS: Record<Suggestion["type"], string> = {
  doctor: "선생님",
  hospital: "병원",
  specialty: "전문분야",
  keyword: "스타일",
  district: "지역",
}

const styleKeywords = [
  "지지적인", "공감적인", "명쾌한", "격려하는", "현실적 조언", "분석적인", "경청하는", "따뜻한",
]

const regionPills = [
  "서울", "강남구", "서초구", "용산구", "송파구", "강서구", "금천구",
  "경기", "안양시", "동두천시", "구리시",
]

export default function DoctorsClient({
  doctors,
  specialties,
}: {
  doctors: Doctor[]
  specialties: string[]
}) {
  const [search, setSearch] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [compareSlugs, setCompareSlugs] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(
    () => buildSuggestions(doctors, search),
    [doctors, search],
  )

  // Close suggestions on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!searchWrapperRef.current) return
      if (!searchWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Reset highlight when query changes
  useEffect(() => {
    setActiveSuggestion(-1)
  }, [search])

  function applySuggestion(s: Suggestion) {
    setShowSuggestions(false)
    if (s.type === "doctor" && s.slug) {
      // Defer navigation to the next tick so the dropdown closes cleanly
      window.location.assign(`/doctors/${s.slug}`)
      return
    }
    if (s.type === "specialty") setSelectedSpecialty(s.value)
    else if (s.type === "keyword") setSelectedStyle(s.value)
    else if (s.type === "district") setSelectedRegion(s.value)
    else setSearch(s.value)
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveSuggestion((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter") {
      if (activeSuggestion >= 0) {
        e.preventDefault()
        applySuggestion(suggestions[activeSuggestion])
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  function toggleCompare(slug: string) {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, slug]
    })
  }

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const matchSearch =
        !search ||
        d.name.includes(search) ||
        d.hospital.includes(search) ||
        d.district.includes(search) ||
        d.specialties.some((s) => s.includes(search))

      const matchRegion =
        !selectedRegion || d.region === selectedRegion || d.district === selectedRegion
      const matchSpecialty =
        !selectedSpecialty || d.specialties.includes(selectedSpecialty)
      const matchStyle = !selectedStyle || d.keywords.includes(selectedStyle)

      return matchSearch && matchRegion && matchSpecialty && matchStyle
    })
  }, [doctors, search, selectedRegion, selectedSpecialty, selectedStyle])

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
          <div className="relative flex-1" ref={searchWrapperRef}>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="이름, 병원, 전문분야로 검색..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={onSearchKeyDown}
              autoComplete="off"
              role="combobox"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-controls="doctor-search-suggestions"
              aria-autocomplete="list"
              className="w-full rounded-xl border border-border bg-card pl-10 pr-9 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setShowSuggestions(false)
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="검색 지우기"
              >
                <X size={15} />
              </button>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <ul
                id="doctor-search-suggestions"
                role="listbox"
                className="absolute left-0 right-0 top-full mt-2 z-30 max-h-96 overflow-auto rounded-xl border border-border bg-card shadow-lg py-1"
              >
                {suggestions.map((s, i) => (
                  <li
                    key={`${s.type}-${s.value}`}
                    role="option"
                    aria-selected={i === activeSuggestion}
                  >
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applySuggestion(s)}
                      onMouseEnter={() => setActiveSuggestion(i)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                        i === activeSuggestion ? "bg-muted" : "hover:bg-muted"
                      }`}
                    >
                      <span className="text-muted-foreground shrink-0">
                        {SUGGESTION_ICONS[s.type]}
                      </span>
                      <span className="flex-1 min-w-0 truncate">
                        {s.value}
                        {s.type === "doctor" && s.hospital && (
                          <span className="text-xs text-muted-foreground ml-1.5">
                            {s.hospital}
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
                        {SUGGESTION_LABELS[s.type]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
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

        {showFilters && (
          <div className="rounded-2xl border border-border bg-card p-5 mb-6 space-y-5">
            <div>
              <p className="text-sm font-semibold mb-3">지역</p>
              <div className="flex flex-wrap gap-2">
                {regionPills.map((region) => (
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

            <div>
              <p className="text-sm font-semibold mb-3">전문분야</p>
              <div className="flex flex-wrap gap-2">
                {specialties.map((sp) => (
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

        <p className="text-sm text-muted-foreground mb-5">
          {filtered.length}명의 선생님
          {(search || hasFilters) && " (필터 적용됨)"}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
            {filtered.map((doctor) => {
              const checked = compareSlugs.includes(doctor.slug)
              const reachedMax = compareSlugs.length >= MAX_COMPARE && !checked
              return (
                <div key={doctor.id} className="relative">
                  <DoctorCard doctor={doctor} />
                  <button
                    type="button"
                    disabled={reachedMax}
                    onClick={() => toggleCompare(doctor.slug)}
                    className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-background/95 backdrop-blur-sm border px-2.5 py-1 text-[11px] font-medium shadow-sm transition cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      checked
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                    aria-pressed={checked}
                  >
                    <span
                      className={`inline-block h-3 w-3 rounded-sm border ${
                        checked
                          ? "bg-primary border-primary text-primary-foreground flex items-center justify-center"
                          : "border-muted-foreground/40"
                      }`}
                      aria-hidden
                    >
                      {checked && (
                        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="2.5 6.5 5 9 9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    비교
                  </button>
                </div>
              )
            })}
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

      {compareSlugs.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md shadow-lg">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">
                비교 선택 ({compareSlugs.length}/{MAX_COMPARE})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {compareSlugs.map((slug) => {
                  const d = doctors.find((x) => x.slug === slug)
                  if (!d) return null
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {d.name}
                      <button
                        type="button"
                        onClick={() => toggleCompare(slug)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                        aria-label="제거"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCompareSlugs([])}
              className="text-xs text-muted-foreground hover:text-foreground shrink-0"
            >
              초기화
            </button>
            <Link
              href={`/compare?ids=${compareSlugs.join(",")}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
            >
              비교하기 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
