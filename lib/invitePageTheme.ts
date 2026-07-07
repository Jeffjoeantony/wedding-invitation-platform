export interface InvitePageTheme {
  background: string
  ringColor: string
  buttonGradient: string
  loadingTextClass: string
}

const weddingTheme: InvitePageTheme = {
  background: 'linear-gradient(180deg, #FAF7F2 0%, #F5F0E8 50%, #EDE6DA 100%)',
  ringColor: 'rgba(201, 169, 110, 0.45)',
  buttonGradient: 'linear-gradient(135deg, #1A1A1A, #2D2A26)',
  loadingTextClass: 'text-stone-500',
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
