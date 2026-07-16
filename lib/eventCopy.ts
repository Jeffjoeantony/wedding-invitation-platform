/**
 * Returns all UI copy that changes based on the event template type.
 * Add new templates here and all pages update automatically.
 */
export type EventTemplate = 'Wedding' | 'Engagement' | 'Birthday'

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
    requestLine: 'Request the honour of your presence',
    atLine: 'at their engagement ceremony',
    countdownLabel: 'Counting down to the big moment',
    footerTagline: 'A Celebration of Togetherness',
    exportPrefix: 'engagement',
  },
  Birthday: {
    splashTag: 'You are warmly invited',
    splashHeading: 'A Celebration of Life & Joy',
    preHeading: 'Join us for a special day',
    requestLine: 'Request the joy of your presence',
    atLine: 'at this birthday celebration',
    countdownLabel: 'Counting down to the big day',
    footerTagline: 'A Celebration of Life & Joy',
    exportPrefix: 'birthday',
  },
}

export function getEventCopy(template?: string | null): EventCopy {
  if (template === 'Engagement') return copy.Engagement
  if (template === 'Birthday') return copy.Birthday
  return copy.Wedding
}
