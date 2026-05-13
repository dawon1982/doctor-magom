/**
 * Restore 김연진's original profile photo.
 *
 * The bulk uploader was run twice (first with the original portraits, then
 * again with framer-scraped versions). The second run overwrote
 * doctors.photo_url but did NOT delete the previous files in storage, so
 * the originals are still in the doctor-photos bucket.
 *
 * This script:
 *  1. Looks up 김연진's doctor_id
 *  2. Lists every file under doctor-photos/<doctor_id>/
 *  3. Picks the OLDEST file (by upload timestamp in the filename) — that's
 *     the original from the first run
 *  4. Sets photo_url back to that file's public URL
 *  5. Deletes the framer version (the newest file)
 *
 * Usage:
 *   export NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
 *   export SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *   npx tsx scripts/restore-kim-yeonjin.ts
 */
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  const { data: doc, error } = await supabase
    .from("doctors")
    .select("id, name, slug, photo_url")
    .eq("name", "김연진")
    .single()
  if (error || !doc) {
    console.error("Could not find 김연진:", error?.message)
    process.exit(1)
  }
  console.log(`Found doctor: ${doc.name} (id=${doc.id}, slug=${doc.slug})`)
  console.log(`Current photo_url: ${doc.photo_url}`)

  const { data: files, error: listErr } = await supabase.storage
    .from("doctor-photos")
    .list(doc.id, { limit: 100, sortBy: { column: "name", order: "asc" } })
  if (listErr || !files) {
    console.error("List failed:", listErr?.message)
    process.exit(1)
  }
  if (files.length === 0) {
    console.error("No files in storage for this doctor.")
    process.exit(1)
  }
  console.log(`\nFiles found in bucket:`)
  for (const f of files) {
    console.log(`  ${f.name}  (created_at=${f.created_at})`)
  }

  // Filenames are <timestamp>.<ext> — lexicographic sort = chronological
  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name))
  const oldest = sorted[0]
  const newest = sorted[sorted.length - 1]
  console.log(`\nOldest: ${oldest.name}`)
  console.log(`Newest: ${newest.name}`)

  if (oldest.name === newest.name) {
    console.error("Only one file — nothing to restore from.")
    process.exit(1)
  }

  const oldKey = `${doc.id}/${oldest.name}`
  const newKey = `${doc.id}/${newest.name}`
  const { data: pub } = supabase.storage
    .from("doctor-photos")
    .getPublicUrl(oldKey)
  const restoreUrl = pub.publicUrl
  console.log(`\nRestoring photo_url to: ${restoreUrl}`)

  const { error: updErr } = await supabase
    .from("doctors")
    .update({ photo_url: restoreUrl })
    .eq("id", doc.id)
  if (updErr) {
    console.error("DB update failed:", updErr.message)
    process.exit(1)
  }

  console.log(`Deleting newer (framer-scraped) file: ${newKey}`)
  await supabase.storage.from("doctor-photos").remove([newKey])

  console.log("\n✓ Done. Refresh production cache to see the change.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
