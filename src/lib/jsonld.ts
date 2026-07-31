/**
 * JSON.stringify does not escape `<`, so a value containing `</script>` would
 * break out of the surrounding <script> tag. Patient review bodies and doctor
 * bios flow into our structured data, so every JSON-LD payload must go through
 * here before it reaches dangerouslySetInnerHTML.
 *
 * U+2028/U+2029 are valid inside JSON strings but terminate a line for older
 * JS parsers, so they are escaped too.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}
