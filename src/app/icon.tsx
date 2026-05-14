import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

/**
 * Browser tab favicon — teddy bear mascot.
 * Emoji is rendered via the Twemoji loader so it shows the same shape
 * on every platform (Apple's curly-haired teddy or Samsung's flat
 * variant would look different across browsers otherwise).
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 26,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        🧸
      </div>
    ),
    {
      ...size,
      emoji: "twemoji",
    },
  )
}
