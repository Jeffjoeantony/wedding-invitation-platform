import { getEventCopy } from '@/lib/eventCopy'
import { parseMediaList, type MediaItem } from '@/lib/invite-media'

export type InvitationConfig = {
  guestName: string
  guestToken?: string
  projectId?: string
  couple1: string
  couple2: string
  dateISO: string
  dateLabel: string
  time: string
  venue: string
  location: string
  address: string
  mapsUrl: string
  contact: string
  eventTemplate: string
  requestLine: string
  atLine: string
  countdownLabel: string
  footerTagline: string
  storyLine: string
  images: {
    hero: string
    accent: string
    portrait: string
  }
  /** Shared project gallery shown on every invite */
  galleryImages: MediaItem[]
  /** Personal guest moments (token invites only) */
  guestMoments: MediaItem[]
  /** Optional custom RSVP question (personal invites) */
  rsvpHeadline?: string
}

/** Guest-specific RSVP headings (matched case-insensitively on guest name). */
const RSVP_HEADLINE_BY_GUEST_NAME: Record<string, string> = {
  ponnambili: 'Will you be my maid of honor?',
}

function rsvpHeadlineForGuest(guest?: { name?: string; rsvp_headline?: string | null } | null) {
  const fromField = guest?.rsvp_headline?.trim()
  if (fromField) return fromField
  const key = guest?.name?.trim().toLowerCase()
  if (key && RSVP_HEADLINE_BY_GUEST_NAME[key]) return RSVP_HEADLINE_BY_GUEST_NAME[key]
  return undefined
}

const DEFAULT_IMAGES = {
  hero: '/invitations/couple-standing.png',
  accent: '/invitations/couple-sitting.png',
  portrait: '/invitations/couple-portrait.png',
}

function formatTime(time: string | undefined): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return time
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function formatDateLabel(date: string | undefined): string {
  if (!date) return ''
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getMapsUrl(raw: string | undefined, fallbackAddress: string): string {
  if (raw && /^https?:\/\//i.test(raw)) return raw
  const query = raw || fallbackAddress
  if (!query) return 'https://maps.google.com'
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function buildDateISO(date: string | undefined, time: string | undefined): string {
  if (!date) return new Date().toISOString()
  const clock = time && /^\d{1,2}:\d{2}/.test(time) ? time.slice(0, 5) : '17:00'
  const iso = new Date(`${date}T${clock}:00+05:30`)
  return Number.isNaN(iso.getTime()) ? `${date}T17:00:00+05:30` : iso.toISOString()
}

function storyLineFor(template: string | null | undefined, couple1: string, couple2: string) {
  if (template === 'Engagement') {
    return `From a chance meeting to a promise of forever, ${couple1} and ${couple2} invite you to celebrate their engagement.`
  }
  if (template === 'Birthday') {
    return `Join us as we celebrate ${couple1} with love, joy, and cherished memories.`
  }
  return `From a chance meeting to a lifetime of togetherness, ${couple1} and ${couple2} invite you to witness the beginning of their forever.`
}

/** Map platform event (+ optional guest) into the invitation UI config. */
export function buildInvitationConfig(
  event: {
    id?: string
    couple_1?: string
    couple_2?: string
    date?: string
    time?: string
    venue?: string
    location?: string
    contact?: string
    maps_url?: string
    event_template?: string
    gallery_images?: unknown
  },
  guest?: {
    name?: string
    unique_token?: string
    project_id?: string
    moments?: unknown
    rsvp_headline?: string | null
  } | null,
): InvitationConfig {
  const couple1 = event.couple_1?.trim() || 'Partner'
  const couple2 = event.couple_2?.trim() || 'Partner'
  const venue = event.venue?.trim() || ''
  const location = event.location?.trim() || ''
  const address = [venue, location].filter(Boolean).join(', ')
  const template = event.event_template || 'Wedding'
  const copy = getEventCopy(template)

  return {
    guestName: guest?.name?.trim() || 'Guest',
    guestToken: guest?.unique_token,
    projectId: event.id || guest?.project_id,
    couple1,
    couple2,
    dateISO: buildDateISO(event.date, event.time),
    dateLabel: formatDateLabel(event.date),
    time: formatTime(event.time),
    venue,
    location,
    address,
    mapsUrl: getMapsUrl(event.maps_url, address),
    contact: event.contact?.trim() || '',
    eventTemplate: template,
    requestLine: copy.requestLine,
    atLine: copy.atLine,
    countdownLabel: copy.countdownLabel,
    footerTagline: copy.footerTagline,
    storyLine: storyLineFor(template, couple1, couple2),
    images: DEFAULT_IMAGES,
    galleryImages: parseMediaList(event.gallery_images),
    guestMoments: parseMediaList(guest?.moments),
    rsvpHeadline: rsvpHeadlineForGuest(guest),
  }
}
