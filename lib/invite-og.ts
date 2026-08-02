/** Canonical Open Graph size WhatsApp / Facebook prefer for large link cards. */
export const INVITE_OG_WIDTH = 1200
export const INVITE_OG_HEIGHT = 630

export function buildInviteOgImageUrl(origin: string, projectId?: string | null): string {
  const base = `${origin.replace(/\/$/, '')}/api/og/invite`
  if (projectId?.trim()) {
    return `${base}?projectId=${encodeURIComponent(projectId.trim())}`
  }
  return base
}

export function inviteOgImageMeta(
  origin: string,
  opts?: { projectId?: string | null; alt?: string },
) {
  return {
    url: buildInviteOgImageUrl(origin, opts?.projectId),
    width: INVITE_OG_WIDTH,
    height: INVITE_OG_HEIGHT,
    type: 'image/png' as const,
    alt: opts?.alt || 'Invitation',
  }
}
