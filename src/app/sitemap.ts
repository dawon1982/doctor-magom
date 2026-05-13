import type { MetadataRoute } from "next"
import { getAllDoctorSlugs } from "@/lib/data/doctors-db"
import { getSiteUrl } from "@/lib/site"

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/match", changeFrequency: "weekly", priority: 0.95 },
  { path: "/doctors", changeFrequency: "daily", priority: 0.9 },
  { path: "/videos", changeFrequency: "daily", priority: 0.7 },
  { path: "/articles", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/apply", changeFrequency: "monthly", priority: 0.4 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  let doctorEntries: MetadataRoute.Sitemap = []
  try {
    const slugs = await getAllDoctorSlugs()
    doctorEntries = slugs.map((slug) => ({
      url: `${base}/doctors/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch {
    // If Supabase is unreachable at build time we still want a valid sitemap.
    doctorEntries = []
  }

  return [...staticEntries, ...doctorEntries]
}
