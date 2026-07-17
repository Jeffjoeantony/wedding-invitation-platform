/** Multi-event (ceremony) model for couple invitations. */

export type ProjectEventType =
  | 'engagement'
  | 'wedding'
  | 'reception'
  | 'mehendi'
  | 'haldi'
  | 'custom'

export type ProjectEvent = {
  id: string
  type: ProjectEventType
  label: string
  date: string
  time: string
  venue: string
  location: string
  maps_url: string
}

export type GuestEventRsvp = {
  status: 'pending' | 'yes' | 'no'
  pax?: number
}

export type RsvpByEvent = Record<string, GuestEventRsvp>

export const PROJECT_EVENT_OPTIONS: {
  id: string
  type: ProjectEventType
  label: string
}[] = [
  { id: 'engagement', type: 'engagement', label: 'Engagement' },
  { id: 'wedding', type: 'wedding', label: 'Wedding' },
  { id: 'reception', type: 'reception', label: 'Reception' },
  { id: 'mehendi', type: 'mehendi', label: 'Mehendi' },
  { id: 'haldi', type: 'haldi', label: 'Haldi' },
]

const TEMPLATE_TO_EVENT_ID: Record<string, string> = {
  Engagement: 'engagement',
  Wedding: 'wedding',
  Reception: 'reception',
  Mehendi: 'mehendi',
  Haldi: 'haldi',
}

/** Primary event id from project Event Type (always required). */
export function primaryEventIdFromTemplate(template?: string | null): string {
  if (!template) return 'wedding'
  return TEMPLATE_TO_EVENT_ID[template] || 'wedding'
}

export function primaryEventOption(template?: string | null) {
  const id = primaryEventIdFromTemplate(template)
  return PROJECT_EVENT_OPTIONS.find((o) => o.id === id) ?? PROJECT_EVENT_OPTIONS[1]
}

export function eventLabel(event: Pick<ProjectEvent, 'label' | 'type'>): string {
  const custom = event.label?.trim()
  if (custom) return custom
  const opt = PROJECT_EVENT_OPTIONS.find((o) => o.type === event.type || o.id === event.type)
  return opt?.label ?? 'Event'
}

export function emptyProjectEvent(
  id: string,
  type: ProjectEventType,
  label: string,
  seed?: Partial<ProjectEvent>,
): ProjectEvent {
  return {
    id,
    type,
    label,
    date: seed?.date ?? '',
    time: seed?.time ?? '',
    venue: seed?.venue ?? '',
    location: seed?.location ?? '',
    maps_url: seed?.maps_url ?? '',
  }
}

/** Parse jsonb / unknown into a clean events list. */
export function parseProjectEvents(raw: unknown): ProjectEvent[] {
  if (!Array.isArray(raw)) return []
  const out: ProjectEvent[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const id = String(row.id ?? '').trim()
    const type = String(row.type ?? 'custom').trim() as ProjectEventType
    if (!id) continue
    out.push({
      id,
      type: PROJECT_EVENT_OPTIONS.some((o) => o.type === type) ? type : 'custom',
      label: String(row.label ?? '').trim(),
      date: String(row.date ?? '').trim(),
      time: String(row.time ?? '').trim(),
      venue: String(row.venue ?? '').trim(),
      location: String(row.location ?? '').trim(),
      maps_url: String(row.maps_url ?? '').trim(),
    })
  }
  return out
}

/**
 * Resolve events for a project.
 * Always includes the primary Event Type; merges any extra events from `events`.
 */
export function resolveProjectEvents(project: {
  events?: unknown
  date?: string
  time?: string
  venue?: string
  location?: string
  maps_url?: string
  event_template?: string | null
}): ProjectEvent[] {
  const primaryOpt = primaryEventOption(project.event_template)
  const seed = {
    date: project.date,
    time: project.time,
    venue: project.venue,
    location: project.location,
    maps_url: project.maps_url,
  }
  const primary = emptyProjectEvent(
    primaryOpt.id,
    primaryOpt.type,
    primaryOpt.label,
    seed,
  )

  const parsed = parseProjectEvents(project.events)
  if (parsed.length === 0) return [primary]

  const byId = new Map<string, ProjectEvent>()
  // Prefer stored primary details if present
  for (const ev of parsed) byId.set(ev.id, ev)
  const storedPrimary = byId.get(primary.id)
  byId.set(primary.id, storedPrimary ? { ...primary, ...storedPrimary, id: primary.id, type: primary.type, label: primary.label || storedPrimary.label } : primary)

  // Primary first, then extras in stored order
  const extras = parsed.filter((e) => e.id !== primary.id)
  return [byId.get(primary.id)!, ...extras]
}

/**
 * When Event Type changes: keep only the new primary event.
 * Copies date/venue from the previous primary (or project fields) so details aren't lost.
 */
export function resetEventsToPrimary(
  project: {
    events?: unknown
    date?: string
    time?: string
    venue?: string
    location?: string
    maps_url?: string
    event_template?: string | null
  },
  nextTemplate: string,
): ProjectEvent[] {
  const prev = resolveProjectEvents(project)
  const prevPrimaryId = primaryEventIdFromTemplate(project.event_template)
  const prevPrimary = prev.find((e) => e.id === prevPrimaryId) || prev[0]
  const nextOpt = primaryEventOption(nextTemplate)

  return [
    emptyProjectEvent(nextOpt.id, nextOpt.type, nextOpt.label, {
      date: prevPrimary?.date || project.date,
      time: prevPrimary?.time || project.time,
      venue: prevPrimary?.venue || project.venue,
      location: prevPrimary?.location || project.location,
      maps_url: prevPrimary?.maps_url || project.maps_url,
    }),
  ]
}

/**
 * Parse guest invited_to extras (optional events only).
 * Primary Event Type is always implied separately.
 */
export function parseInvitedTo(raw: unknown, allowedEventIds: string[]): string[] {
  let value: unknown = raw
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw)
    } catch {
      return []
    }
  }
  if (!Array.isArray(value)) return []
  const ids = value.map((v) => String(v).trim()).filter(Boolean)
  if (allowedEventIds.length === 0) return ids
  const allowed = new Set(allowedEventIds)
  return ids.filter((id) => allowed.has(id))
}

/**
 * Effective invite list: primary Event Type + any extra events marked on the guest.
 */
export function effectiveInvitedTo(
  project: {
    events?: unknown
    date?: string
    time?: string
    venue?: string
    location?: string
    maps_url?: string
    event_template?: string | null
  },
  invitedTo: unknown,
): string[] {
  const projectEvents = resolveProjectEvents(project)
  const primaryId = primaryEventIdFromTemplate(project.event_template)
  const enabled = new Set(projectEvents.map((e) => e.id))
  const extras = parseInvitedTo(invitedTo, projectEvents.map((e) => e.id)).filter(
    (id) => id !== primaryId && enabled.has(id),
  )
  const result = enabled.has(primaryId) ? [primaryId, ...extras] : extras
  return [...new Set(result)]
}

/** Labels for guest list "Invited to" column. */
export function invitedToLabels(
  invitedTo: unknown,
  project: {
    events?: unknown
    date?: string
    time?: string
    venue?: string
    location?: string
    maps_url?: string
    event_template?: string | null
  },
): string[] {
  const projectEvents = resolveProjectEvents(project)
  const invitedIds = effectiveInvitedTo(project, invitedTo)

  return invitedIds.map((id) => {
    const fromProject = projectEvents.find((e) => e.id === id)
    if (fromProject) return eventLabel(fromProject)
    const opt = PROJECT_EVENT_OPTIONS.find((o) => o.id === id)
    return opt?.label ?? id
  })
}

export function parseRsvpByEvent(raw: unknown): RsvpByEvent {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: RsvpByEvent = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue
    const row = value as Record<string, unknown>
    const status = row.status
    if (status !== 'pending' && status !== 'yes' && status !== 'no') continue
    out[key] = {
      status,
      pax: typeof row.pax === 'number' ? row.pax : Number(row.pax) || undefined,
    }
  }
  return out
}

/** Events this guest should see on their invite (primary + marked extras). */
export function guestVisibleEvents(
  project: {
    events?: unknown
    date?: string
    time?: string
    venue?: string
    location?: string
    maps_url?: string
    event_template?: string | null
  },
  invitedTo: unknown,
): ProjectEvent[] {
  const projectEvents = resolveProjectEvents(project)
  const invited = new Set(effectiveInvitedTo(project, invitedTo))
  return projectEvents.filter((e) => invited.has(e.id))
}

/** Roll up per-event RSVPs into a single legacy status for stats. */
export function rollupRsvpStatus(
  invitedTo: string[],
  rsvpByEvent: RsvpByEvent,
  legacy?: 'pending' | 'yes' | 'no',
): 'pending' | 'yes' | 'no' {
  if (invitedTo.length === 0) return legacy ?? 'pending'
  const statuses = invitedTo.map((id) => rsvpByEvent[id]?.status ?? 'pending')
  if (statuses.every((s) => s === 'yes')) return 'yes'
  if (statuses.every((s) => s === 'no')) return 'no'
  if (statuses.some((s) => s === 'yes')) return 'yes'
  if (statuses.some((s) => s === 'pending')) return 'pending'
  return legacy ?? 'pending'
}

export function syncLegacyFieldsFromEvents(events: ProjectEvent[]): {
  date: string
  time: string
  venue: string
  location: string
  maps_url: string
  event_template?: string
} {
  const primary =
    events.find((e) => e.date) ||
    events[0] ||
    emptyProjectEvent('wedding', 'wedding', 'Wedding')

  const templateMap: Record<string, string> = {
    engagement: 'Engagement',
    wedding: 'Wedding',
    reception: 'Reception',
    mehendi: 'Mehendi',
    haldi: 'Haldi',
  }

  return {
    date: primary.date,
    time: primary.time,
    venue: primary.venue,
    location: primary.location,
    maps_url: primary.maps_url,
    event_template:
      events.length > 1 ? 'Wedding' : templateMap[primary.type] || 'Wedding',
  }
}

export function sanitizeEventsPayload(raw: unknown): ProjectEvent[] {
  const parsed = parseProjectEvents(raw)
  const seen = new Set<string>()
  return parsed.filter((e) => {
    if (seen.has(e.id)) return false
    seen.add(e.id)
    return true
  })
}

export function formatEventDateLabel(date: string | undefined): string {
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

export function formatEventTime(time: string | undefined): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return time
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function buildEventDateISO(date: string | undefined, time: string | undefined): string {
  if (!date) return new Date().toISOString()
  const clock = time && /^\d{1,2}:\d{2}/.test(time) ? time.slice(0, 5) : '17:00'
  const iso = new Date(`${date}T${clock}:00+05:30`)
  return Number.isNaN(iso.getTime()) ? `${date}T17:00:00+05:30` : iso.toISOString()
}

export function getMapsUrl(raw: string | undefined, fallbackAddress: string): string {
  if (raw && /^https?:\/\//i.test(raw)) return raw
  const query = raw || fallbackAddress
  if (!query) return 'https://maps.google.com'
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** Full address for maps links — prefers location when it already includes venue. */
export function fullEventAddress(venue: string, location: string): string {
  const v = venue.trim()
  const loc = location.trim()
  if (!v) return loc
  if (!loc) return v
  if (loc.toLowerCase().startsWith(v.toLowerCase())) return loc
  return [v, loc].filter(Boolean).join(', ')
}

/** Where-block display — venue name once, extra detail below when needed. */
export function venueWhereDisplay(
  venue: string,
  location: string,
): { title: string; detail?: string } {
  const v = venue.trim()
  const loc = location.trim()

  if (!v && !loc) return { title: 'Venue to be announced' }
  if (!v) return { title: loc }
  if (!loc) return { title: v }
  if (loc.toLowerCase() === v.toLowerCase()) return { title: v }

  const vLower = v.toLowerCase()
  const locLower = loc.toLowerCase()
  if (locLower.startsWith(vLower)) {
    const rest = loc.slice(v.length).replace(/^[\s,.-–—]+/, '').trim()
    return rest ? { title: v, detail: rest } : { title: v }
  }

  return { title: v, detail: loc }
}

export type GuestExportInput = {
  name: string
  phone?: string | null
  email?: string | null
  guest_category?: string | null
  rsvp_status: 'pending' | 'yes' | 'no'
  pax_count: number
  unique_token: string
  invited_to?: unknown
  rsvp_by_event?: unknown
}

function formatExportRsvpStatus(status: 'pending' | 'yes' | 'no' | undefined): string {
  if (status === 'yes') return 'Yes'
  if (status === 'no') return 'No'
  return 'Pending'
}

/** Column order for guest list Excel/CSV export. */
export function guestExportColumnOrder(
  project: Parameters<typeof resolveProjectEvents>[0],
): string[] {
  const cols = [
    'Name',
    'Phone',
    'Email',
    'Category',
    'Invited To',
    'Overall Status',
    'Pax Count',
  ]
  for (const ev of resolveProjectEvents(project)) {
    cols.push(`${eventLabel(ev)} RSVP`)
  }
  cols.push('Invite Link')
  return cols
}

export function buildGuestExportRow(
  guest: GuestExportInput,
  project: Parameters<typeof resolveProjectEvents>[0],
  origin: string,
  projectEvents?: ProjectEvent[],
): Record<string, string | number> {
  const events = projectEvents ?? resolveProjectEvents(project)
  const invitedSet = new Set(effectiveInvitedTo(project, guest.invited_to))
  const rsvpByEvent = parseRsvpByEvent(guest.rsvp_by_event)
  const invitedLabels = invitedToLabels(guest.invited_to, project)

  const row: Record<string, string | number> = {
    Name: guest.name,
    Phone: guest.phone?.trim() || '',
    Email: guest.email?.trim() || '',
    Category: guest.guest_category?.trim() || '',
    'Invited To': invitedLabels.join(', '),
    'Overall Status': guest.rsvp_status,
    'Pax Count': guest.pax_count,
  }

  for (const ev of events) {
    const label = eventLabel(ev)
    if (!invitedSet.has(ev.id)) {
      row[`${label} RSVP`] = 'Not invited'
      continue
    }
    const entry = rsvpByEvent[ev.id]
    const status = entry?.status ?? 'pending'
    row[`${label} RSVP`] = formatExportRsvpStatus(status)
  }

  row['Invite Link'] = `${origin}/invite/${guest.unique_token}`
  return row
}

export function buildGuestExportRows(
  guests: GuestExportInput[],
  project: Parameters<typeof resolveProjectEvents>[0],
  origin: string,
): Record<string, string | number>[] {
  const projectEvents = resolveProjectEvents(project)
  return guests.map((g) => buildGuestExportRow(g, project, origin, projectEvents))
}
