export interface InvitePageTheme {
  background: string
  ringColor: string
  buttonGradient: string
  loadingTextClass: string
}

const weddingTheme: InvitePageTheme = {
  background: 'linear-gradient(160deg, #1a0010 0%, #3d0020 35%, #6d1040 65%, #3d0020 100%)',
  ringColor: 'rgba(255,100,130,0.35)',
  buttonGradient: 'linear-gradient(135deg, #be123c, #9f1239)',
  loadingTextClass: 'text-rose-300/70',
}

const birthdayTheme: InvitePageTheme = {
  background: 'linear-gradient(160deg, #0f0520 0%, #1e0938 30%, #2d1060 60%, #1a0530 100%)',
  ringColor: 'rgba(251,191,36,0.35)',
  buttonGradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
  loadingTextClass: 'text-yellow-300/70',
}

/** Default (wedding/engagement) when event type is not yet known — avoids birthday purple flash. */
export function getInvitePageTheme(eventTemplate?: string | null): InvitePageTheme {
  if (eventTemplate === 'Birthday') return birthdayTheme
  return weddingTheme
}
