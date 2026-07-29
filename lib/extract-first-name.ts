/** First word of a full name for compact invite display (hero, OG share). */
export function extractFirstName(fullName?: string | null): string {
  const trimmed = String(fullName ?? '').trim()
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0] || ''
}
