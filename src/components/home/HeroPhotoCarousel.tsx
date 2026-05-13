"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

type HeroDoctor = {
  slug: string
  name: string
  hospital: string
  photoUrl?: string
}

const INTERVAL_MS = 1200

export function HeroPhotoCarousel({ doctors }: { doctors: HeroDoctor[] }) {
  const valid = doctors.filter((d) => !!d.photoUrl)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (valid.length < 2) return
    const id = setInterval(() => setIdx((i) => (i + 1) % valid.length), INTERVAL_MS)
    return () => clearInterval(id)
  }, [valid.length])

  if (valid.length === 0) return null
  const current = valid[idx]

  return (
    <div className="mt-10 mb-2 select-none">
      {/* Featured headline above the avatar strip */}
      <div className="text-center mb-3 min-h-[1.5rem]">
        <Link
          href={`/doctors/${current.slug}`}
          className="text-sm sm:text-base font-semibold text-foreground hover:text-primary transition-colors"
          key={current.slug}
        >
          {current.name}
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            {current.hospital}
          </span>
        </Link>
      </div>

      {/* Avatar strip — the active one scales up & is fully opaque */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        {valid.map((d, i) => {
          const isActive = i === idx
          return (
            <Link
              key={d.slug}
              href={`/doctors/${d.slug}`}
              aria-label={`${d.name} 선생님 프로필`}
              className="block transition-all duration-500 ease-out will-change-transform"
              style={{
                opacity: isActive ? 1 : 0.4,
                transform: isActive ? "scale(1.3)" : "scale(1)",
                zIndex: isActive ? 10 : 1,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.photoUrl!}
                alt={`${d.name} 선생님`}
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full object-cover ring-2 transition-all duration-500 ${
                  isActive
                    ? "ring-primary shadow-lg shadow-primary/30"
                    : "ring-background shadow-sm"
                }`}
                loading={i < 4 ? "eager" : "lazy"}
                draggable={false}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
