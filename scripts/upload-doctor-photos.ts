/**
 * One-shot bulk uploader for doctor profile photos.
 *
 * Reads every <name>.png from ~/Downloads/의사 대표 이미지 (or any path
 * passed as the first arg), matches the file basename to a doctor by name,
 * uploads to the doctor-photos bucket as `<doctor_id>/<timestamp>.png`,
 * then updates doctors.photo_url with the public URL.
 *
 * Usage:
 *   export NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
 *   export SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *   npx tsx scripts/upload-doctor-photos.ts
 *
 * Optional first arg: photo folder path (defaults to ~/Downloads/의사 대표 이미지).
 */
import { readFileSync, readdirSync } from "node:fs"
import { resolve, basename, extname, join } from "node:path"
import { homedir } from "node:os"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
  )
  process.exit(1)
}

const folder =
  process.argv[2] ?? join(homedir(), "Downloads", "의사 대표 이미지")
console.log(`Reading photos from: ${folder}`)

const files = readdirSync(folder).filter((f) =>
  [".png", ".jpg", ".jpeg", ".webp"].includes(extname(f).toLowerCase()),
)
if (files.length === 0) {
  console.error("No image files found.")
  process.exit(1)
}
console.log(`Found ${files.length} image(s): ${files.join(", ")}`)

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  for (const file of files) {
    const baseNoExt = basename(file, extname(file)).trim()
    // Find doctor by Korean name (exact match)
    const { data: doc, error } = await supabase
      .from("doctors")
      .select("id, name, slug")
      .eq("name", baseNoExt)
      .maybeSingle()

    if (error) {
      console.error(`  ✗ ${file}: lookup failed — ${error.message}`)
      continue
    }
    if (!doc) {
      console.warn(`  ⚠ ${file}: no doctor with name "${baseNoExt}" — skipping`)
      continue
    }

    const ext = extname(file).slice(1).toLowerCase() || "png"
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg"
    const key = `${doc.id}/${Date.now()}.${ext}`
    const bytes = readFileSync(resolve(folder, file))

    const { error: upErr } = await supabase.storage
      .from("doctor-photos")
      .upload(key, bytes, {
        contentType,
        upsert: false,
        cacheControl: "3600",
      })
    if (upErr) {
      console.error(`  ✗ ${file}: upload failed — ${upErr.message}`)
      continue
    }
    const { data: pub } = supabase.storage
      .from("doctor-photos")
      .getPublicUrl(key)
    const publicUrl = pub.publicUrl

    const { error: updErr } = await supabase
      .from("doctors")
      .update({ photo_url: publicUrl })
      .eq("id", doc.id)
    if (updErr) {
      console.error(`  ✗ ${file}: db update failed — ${updErr.message}`)
      continue
    }
    console.log(`  ✓ ${doc.name} (${doc.slug}) → ${publicUrl}`)
  }
  console.log("\nDone. Don't forget to refresh the cache:")
  console.log(
    "  curl -X POST https://doctor-magom.vercel.app/api/_admin/revalidate (if you add one)",
  )
  console.log(
    "  or simply re-deploy / visit /admin/doctors to trigger updateTag.",
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
