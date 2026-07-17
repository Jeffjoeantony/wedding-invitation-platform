import { getEventCopy } from '@/lib/eventCopy'
import { parseMediaList, type MediaItem } from '@/lib/invite-media'
import {
  buildEventDateISO,
  eventLabel,
  formatEventDateLabel,
  formatEventTime,
  fullEventAddress,
  getMapsUrl,
  guestVisibleEvents,
  parseRsvpByEvent,
  resolveProjectEvents,
  type ProjectEvent,
  type RsvpByEvent,
} from '@/lib/project-events'

export type InvitationEventConfig = {
  id: string
  type: string
  label: string
  dateISO: string
  dateLabel: string
  time: string
  venue: string
  location: string
  address: string
  mapsUrl: string
  rsvpStatus?: 'pending' | 'yes' | 'no'
}

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
  /** Hero greeting line; null when hidden */
  heroGreeting?: string | null
  /** Events visible to this guest (filtered by invited_to) */
  events: InvitationEventConfig[]
  /** Raw per-event RSVP map */
  rsvpByEvent: RsvpByEvent
}

function rsvpHeadlineForGuest(guest?: { rsvp_headline?: string | null } | null) {
  const fromField = guest?.rsvp_headline?.trim()
  return fromField || undefined
}

function heroGreetingForGuest(
  guest?: { name?: string; greeting_line?: string | null; hide_greeting?: boolean | null } | null,
): string | null {
  if (guest?.hide_greeting) return null
  const custom = guest?.greeting_line?.trim()
  if (custom) return custom
  const name = guest?.name?.trim()
  if (name) return `Dear ${name}`
  return null
}

/** Split RSVP headline for styled display (default: Will you join us?). */
export function rsvpHeadlineParts(headline?: string | null): {
  mode: 'default' | 'will-you' | 'full'
  prefix?: string
  emphasis?: string
  full?: string
} {
  const h = headline?.trim()
  if (!h) return { mode: 'default' }
  if (/^will you\s+/i.test(h)) {
    const rest = h.replace(/^will you\s+/i, '').replace(/\?$/, '').trim()
    return { mode: 'will-you', prefix: 'Will you', emphasis: `${rest}?` }
  }
  return { mode: 'full', full: h.endsWith('?') ? h : `${h}?` }
}

const DEFAULT_IMAGES = {
  hero: '/invitations/couple-standing.png',
  accent: '/invitations/couple-sitting.png',
  portrait: '/invitations/couple-portrait.png',
}

function toInviteEvent(
  event: ProjectEvent,
  rsvpByEvent: RsvpByEvent,
): InvitationEventConfig {
  const venue = event.venue?.trim() || ''
  const location = event.location?.trim() || ''
  const address = fullEventAddress(venue, location)
  return {
    id: event.id,
    type: event.type,
    label: eventLabel(event),
    dateISO: buildEventDateISO(event.date, event.time),
    dateLabel: formatEventDateLabel(event.date),
    time: formatEventTime(event.time),
    venue,
    location,
    address,
    mapsUrl: getMapsUrl(event.maps_url, address),
    rsvpStatus: rsvpByEvent[event.id]?.status,
  }
}

function storyLineFor(
  template: string | null | undefined,
  couple1: string,
  couple2: string,
  eventCount: number,
) {
  if (eventCount > 1) {
    return `From a chance meeting to a lifetime of togetherness, ${couple1} and ${couple2} invite you to celebrate their engagement and wedding.`
  }
  if (template === 'Engagement') {
    return `From a chance meeting to a promise of forever, ${couple1} and ${couple2} invite you to celebrate their engagement.`
  }
  if (template === 'Birthday') {
    return `Join us as we celebrate ${couple1} with love, joy, and cherished memories.`
  }
  return `From a chance meeting to a lifetime of togetherness, ${couple1} and ${couple2} invite you to witness the beginning of their forever.`
}

function atLineFor(events: InvitationEventConfig[], fallback: string) {
  if (events.length > 1) {
    const labels = events.map((e) => e.label.toLowerCase())
    if (labels.includes('engagement') && labels.includes('wedding')) {
      return 'at their engagement and wedding celebrations'
    }
    return `at their ${labels.join(' & ')}`
  }
  if (events.length === 1) {
    return `at their ${events[0].label.toLowerCase()}`
  }
  return fallback
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
    events?: unknown
  },
  guest?: {
    name?: string
    unique_token?: string
    project_id?: string
    moments?: unknown
    rsvp_headline?: string | null
    greeting_line?: string | null
    hide_greeting?: boolean | null
    invited_to?: unknown
    rsvp_by_event?: unknown
  } | null,
): InvitationConfig {
  const couple1 = event.couple_1?.trim() || 'Partner'
  const couple2 = event.couple_2?.trim() || 'Partner'
  const venue = event.venue?.trim() || ''
  const location = event.location?.trim() || ''
  const address = fullEventAddress(venue, location)
  const template = event.event_template || 'Wedding'
  const copy = getEventCopy(template)

  const projectEvents = resolveProjectEvents(event)
  const rsvpByEvent = parseRsvpByEvent(guest?.rsvp_by_event)
  const visible = guest
    ? guestVisibleEvents(event, guest.invited_to)
    : projectEvents
  const inviteEvents = visible.map((e) => toInviteEvent(e, rsvpByEvent))
  const primary = inviteEvents[0]

  return {
    guestName: guest?.name?.trim() || 'Guest',
    guestToken: guest?.unique_token,
    projectId: event.id || guest?.project_id,
    couple1,
    couple2,
    dateISO: primary?.dateISO || buildEventDateISO(event.date, event.time),
    dateLabel: primary?.dateLabel || formatEventDateLabel(event.date),
    time: primary?.time || formatEventTime(event.time),
    venue: primary?.venue || venue,
    location: primary?.location || location,
    address: primary?.address || address,
    mapsUrl: primary?.mapsUrl || getMapsUrl(event.maps_url, address),
    contact: event.contact?.trim() || '',
    eventTemplate: template,
    requestLine: copy.requestLine,
    atLine: atLineFor(inviteEvents, copy.atLine),
    countdownLabel:
      inviteEvents.length > 1 ? 'Counting down to the celebrations' : copy.countdownLabel,
    footerTagline:
      inviteEvents.length > 1 ? 'A Celebration of Love' : copy.footerTagline,
    storyLine: storyLineFor(template, couple1, couple2, inviteEvents.length),
    images: DEFAULT_IMAGES,
    galleryImages: parseMediaList(event.gallery_images),
    guestMoments: parseMediaList(guest?.moments),
    rsvpHeadline: rsvpHeadlineForGuest(guest),
    heroGreeting: heroGreetingForGuest(guest),
    events: inviteEvents,
    rsvpByEvent,
  }
}
