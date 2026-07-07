/** Per-project open invite URL — no guest name, no RSVP. */
export function buildOpenInviteUrl(origin: string, projectId: string): string {
  const base = origin.replace(/\/$/, '')
  return `${base}/invite/open/${projectId}`
}
