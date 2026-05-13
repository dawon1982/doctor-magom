import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "닥터마음곰 — 나와 맞는 정신건강의학과 선생님 찾기"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #FBE9D9 0%, #F8DBC4 60%, #F4C99F 100%)",
          color: "#3F2A1D",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "84px" }}>🐻</span>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontSize: "44px", fontWeight: 800, letterSpacing: "-1px" }}>
              닥터마음곰
            </span>
            <span style={{ fontSize: "20px", marginTop: "8px", color: "#6B4A33" }}>
              Dr. Maum-gom
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span
            style={{
              fontSize: "26px",
              color: "#9B4D29",
              fontWeight: 600,
            }}
          >
            정신건강의학과계의 강남언니
          </span>
          <span
            style={{
              fontSize: "68px",
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1.15,
              maxWidth: "900px",
            }}
          >
            나와 맞는 정신건강의학과
            <br />
            선생님을 찾아드려요
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "#6B4A33",
            fontSize: "22px",
          }}
        >
          <span>AI 추천 · 영상으로 먼저 만나기 · 무료</span>
          <span>doctor-magom.vercel.app</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
