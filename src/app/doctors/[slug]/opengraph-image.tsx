import { ImageResponse } from "next/og"
import { getDoctorBySlug } from "@/lib/data/doctors-db"

export const alt = "닥터마음곰 의사 프로필"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function DoctorOG({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const doctor = await getDoctorBySlug(slug)
  if (!doctor) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FBE9D9",
            color: "#3F2A1D",
            fontSize: "48px",
            fontWeight: 800,
          }}
        >
          닥터마음곰
        </div>
      ),
      { ...size },
    )
  }

  const accent = doctor.photoPlaceholderColor || "#D4895A"
  const initial = doctor.name?.[0] ?? "?"
  const specialties = doctor.specialties.slice(0, 4).join(" · ")
  const keywords = doctor.keywords.slice(0, 3)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px",
          background: "linear-gradient(135deg, #FFFAF3 0%, #FBE9D9 60%, #F4C99F 100%)",
          color: "#2A1B10",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "48px" }}>🐻</span>
          <span style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.5px" }}>
            닥터마음곰
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "48px",
            marginTop: "60px",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "44px",
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "120px",
              fontWeight: 900,
              flexShrink: 0,
              boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
            }}
          >
            {initial}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
            <span style={{ fontSize: "78px", fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.05 }}>
              {doctor.name}
            </span>
            <span style={{ fontSize: "32px", color: "#6B4A33", fontWeight: 600 }}>
              {doctor.hospital}
            </span>
            <span style={{ fontSize: "24px", color: "#8B6549" }}>
              {doctor.region} · {doctor.district}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "auto" }}>
          {specialties && (
            <span style={{ fontSize: "28px", color: "#4A3320", fontWeight: 600 }}>
              {specialties}
            </span>
          )}
          {keywords.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {keywords.map((k) => (
                <span
                  key={k}
                  style={{
                    fontSize: "22px",
                    padding: "8px 20px",
                    borderRadius: "999px",
                    background: "rgba(155, 77, 41, 0.15)",
                    color: "#9B4D29",
                    fontWeight: 600,
                  }}
                >
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  )
}
