/**
 * Returns all UI copy that changes based on the event template type.
 * Add new templates here and all pages update automatically.
 */
export type EventTemplate = 'Wedding' | 'Engagement'

interface EventCopy {
  /** Splash screen top tag */
  splashTag: string
  /** Splash screen big heading */
  splashHeading: string
  /** Pre-heading on invitation card */
  preHeading: string
  /** "Request the honour…" line */
  requestLine: string
  /** "at their …" line */
  atLine: string
  /** Countdown label */
  countdownLabel: string
  /** Footer tagline */
  footerTagline: string
  /** Export filename prefix */
  exportPrefix: string
}

const copy: Record<EventTemplate, EventCopy> = {
  Wedding: {
    splashTag: 'You are cordially invited',
    splashHeading: 'A Celebration of Love',
    preHeading: 'Together with their families',
    requestLine: 'Request the honour of your presence',
    atLine: 'at their wedding celebration',
    countdownLabel: 'Counting down to forever',
    footerTagline: 'A Celebration of Love',
    exportPrefix: 'wedding',
  },
  Engagement: {
    splashTag: 'You are joyfully invited',
    splashHeading: 'A Celebration of Togetherness',
    preHeading: 'Together with their families',
    requestLine: 'Request the pleasure of your presence',
    atLine: 'at their engagement ceremony',
    countdownLabel: 'Counting down to the big moment',
    footerTagline: 'A Celebration of Togetherness',
    exportPrefix: 'engagement',
  },
}

export function getEventCopy(template?: string | null): EventCopy {
  if (template === 'Engagement') return copy.Engagement
  return copy.Wedding
}
