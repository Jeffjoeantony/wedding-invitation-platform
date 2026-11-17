import type { InvitationConfig } from '@/lib/invitation-config'
import { extractFirstName } from '@/lib/extract-first-name'
import { WINE_GOLD_SAMPLE, type WineGoldData } from './sample-data'

function formatDisplayDate(dateISO: string, fallback: string) {
  if (!dateISO) return fallback
  const d = new Date(dateISO)
  if (Number.isNaN(d.getTime())) return fallback
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

function weekdayFromISO(dateISO: string, fallback: string) {
  if (!dateISO) return fallback
  const d = new Date(dateISO)
  if (Number.isNaN(d.getTime())) return fallback
  return d.toLocaleDateString('en-GB', { weekday: 'long' })
}

/**
 * Build Wine Gold template data from live project/invite settings.
 * Preview sample values are used only as fallbacks when a field is empty.
 * Venue name, address, and maps URL come from project settings when set.
 */
export function wineGoldFromInvitationConfig(
  config: InvitationConfig,
  overrides?: Partial<WineGoldData>,
): WineGoldData {
  const primary = config.events[0]
  const venueName =
    (primary?.venue || config.venue || '').trim() || WINE_GOLD_SAMPLE.venue.name
  const venueAddress =
    (primary?.address || config.address || primary?.location || config.location || '').trim() ||
    WINE_GOLD_SAMPLE.venue.address
  const mapsUrl =
    (primary?.mapsUrl || config.mapsUrl || '').trim() || WINE_GOLD_SAMPLE.venue.mapsUrl

  const couple1 = extractFirstName(config.couple1) || config.couple1 || WINE_GOLD_SAMPLE.couple.first
  const couple2 = extractFirstName(config.couple2) || config.couple2 || WINE_GOLD_SAMPLE.couple.second

  const dateISO = primary?.dateISO || config.dateISO || WINE_GOLD_SAMPLE.date.iso
  const time = primary?.time || config.time || WINE_GOLD_SAMPLE.date.time

  const events: WineGoldData['events'] =
    config.events.length > 0
      ? config.events.map((e) => ({
          id: e.id,
          time: e.time || '—',
          title: e.label,
          detail: [e.venue, e.location].filter(Boolean).join(' · ') || undefined,
        }))
      : WINE_GOLD_SAMPLE.events

  const base: WineGoldData = {
    ...WINE_GOLD_SAMPLE,
    couple: {
      first: couple1,
      second: couple2,
      joinWord: 'and',
    },
    date: {
      iso: dateISO.slice(0, 10),
      display: formatDisplayDate(dateISO, WINE_GOLD_SAMPLE.date.display),
      weekday: weekdayFromISO(dateISO, WINE_GOLD_SAMPLE.date.weekday),
      time,
    },
    greeting: {
      title: config.heroGreeting?.trim() || WINE_GOLD_SAMPLE.greeting.title,
      body: WINE_GOLD_SAMPLE.greeting.body,
    },
    venue: {
      ...WINE_GOLD_SAMPLE.venue,
      name: venueName,
      address: venueAddress,
      mapsUrl,
      detailsUrl: mapsUrl,
      // Embed uses place text — short goo.gl links are for open-in-maps only
      mapEmbedUrl: undefined,
    },
    countdown: {
      label: config.countdownLabel || WINE_GOLD_SAMPLE.countdown.label,
      targetIso: dateISO.slice(0, 10),
    },
    story: {
      title: WINE_GOLD_SAMPLE.story.title,
      body: config.storyLine || WINE_GOLD_SAMPLE.story.body,
    },
    events,
    rsvp: {
      ...WINE_GOLD_SAMPLE.rsvp,
      title: config.rsvpHeadline?.trim() || WINE_GOLD_SAMPLE.rsvp.title,
      titleLine1: WINE_GOLD_SAMPLE.rsvp.titleLine1,
      titleLine2: WINE_GOLD_SAMPLE.rsvp.titleLine2,
      deadline: WINE_GOLD_SAMPLE.rsvp.deadline,
    },
    contact: {
      ...WINE_GOLD_SAMPLE.contact,
      phone: config.contact?.trim() || WINE_GOLD_SAMPLE.contact.phone,
    },
    footer: {
      tagline: config.footerTagline || `With love — ${couple1} & ${couple2}`,
    },
    images: {
      hero: config.images.hero || WINE_GOLD_SAMPLE.images.hero,
      story: config.images.accent || WINE_GOLD_SAMPLE.images.story,
      footer: WINE_GOLD_SAMPLE.images.footer,
    },
  }

  return {
    ...base,
    ...overrides,
    venue: { ...base.venue, ...overrides?.venue },
    images: { ...base.images, ...overrides?.images },
    couple: { ...base.couple, ...overrides?.couple },
  }
}
