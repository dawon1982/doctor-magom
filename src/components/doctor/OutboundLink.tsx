"use client"

/**
 * An external link that logs a conversion click before navigating away.
 * Uses navigator.sendBeacon so the POST survives the tab/navigation change
 * (target="_blank" keeps this tab, but sendBeacon is still the robust path).
 */
type Props = {
  href: string
  doctorId: string
  kind: "kakao" | "website" | "phone" | "naver"
  className?: string
  children: React.ReactNode
}

export function OutboundLink({
  href,
  doctorId,
  kind,
  className,
  children,
}: Props) {
  function onClick() {
    try {
      const payload = JSON.stringify({ doctorId, kind })
      const blob = new Blob([payload], { type: "application/json" })
      navigator.sendBeacon("/api/track-click", blob)
    } catch {
      // ignore — never block the user's navigation
    }
  }

  // tel: must stay in the same tab — a _blank dialer link opens a blank tab
  // on desktop and is inconsistent on mobile browsers.
  const isTel = href.startsWith("tel:")

  return (
    <a
      href={href}
      {...(isTel ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      onClick={onClick}
      className={className}
    >
      {children}
    </a>
  )
}
