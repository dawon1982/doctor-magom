import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/doctor/profile",
          "/api",
          "/auth",
          "/onboarding",
          "/login",
          "/signup",
          // ?ids= combinations are effectively infinite and hold no unique
          // content of their own.
          "/compare",
          "/favorites",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
