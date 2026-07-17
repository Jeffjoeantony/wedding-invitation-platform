'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import {
  effectiveInvitedTo,
  parseRsvpByEvent,
  resolveProjectEvents,
  rollupRsvpStatus,
  type RsvpByEvent,
} from '@/lib/project-events'

type RsvpInput = {
  guestName: string
  status: 'accepted' | 'declined'
  pax?: number
  message?: string
  token?: string
  projectId?: string
  /** When set, RSVP applies to this event only (multi-event invites). */
  eventId?: string
  /** Full map when submitting multiple event responses at once. */
  responses?: Record<string, { status: 'accepted' | 'declined'; pax?: number }>
}

function makeToken() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
}

function toDbStatus(status: 'accepted' | 'declined'): 'yes' | 'no' {
  return status === 'declined' ? 'no' : 'yes'
}

/** Submit an RSVP — personal invite (token) or open invite (projectId + name). */
export async function submitRsvp(input: RsvpInput) {
  const guestName = input.guestName?.trim() || 'Guest'
  const token = input.token?.trim()
  const projectId = input.projectId?.trim()
  const supabase = createAdminClient()
  const respondedAt = new Date().toISOString()

  if (token) {
    const { data: guest, error: lookupError } = await supabase
      .from('guests')
      .select('id,project_id,invited_to,rsvp_by_event,rsvp_status,pax_count')
      .eq('unique_token', token)
      .single()

    let guestRow = guest as {
      id: string
      project_id: string
      invited_to?: unknown
      rsvp_by_event?: unknown
      rsvp_status?: string
      pax_count?: number
    } | null

    if (lookupError || !guest) {
      if (lookupError && /(invited_to|rsvp_by_event)/i.test(lookupError.message || '')) {
        const retry = await supabase
          .from('guests')
          .select('id,project_id,rsvp_status,pax_count')
          .eq('unique_token', token)
          .single()
        if (retry.error || !retry.data) throw new Error('Invitation not found')
        guestRow = {
          ...retry.data,
          invited_to: null,
          rsvp_by_event: {},
        }
      } else {
        throw new Error('Invitation not found')
      }
    }

    if (!guestRow) throw new Error('Invitation not found')

    const { data: project } = await supabase
      .from('projects')
      .select('date,time,venue,location,maps_url,event_template,events')
      .eq('id', guestRow.project_id)
      .single()

    const projectEvents = project ? resolveProjectEvents(project) : []
    const eventIds = projectEvents.map((e) => e.id)
    const invitedTo = effectiveInvitedTo(
      project ?? { event_template: 'Wedding', events: [] },
      guestRow.invited_to,
    )
    const existing = parseRsvpByEvent(guestRow.rsvp_by_event)

    let next: RsvpByEvent = { ...existing }

    if (input.responses && Object.keys(input.responses).length > 0) {
      for (const [eventId, resp] of Object.entries(input.responses)) {
        if (!invitedTo.includes(eventId) && eventIds.length > 0) continue
        const status = toDbStatus(resp.status)
        const pax =
          status === 'yes' ? Math.min(Math.max(Number(resp.pax) || 1, 1), 50) : 0
        next[eventId] = { status, pax }
      }
    } else if (input.eventId) {
      const status = toDbStatus(input.status)
      const pax =
        status === 'yes' ? Math.min(Math.max(Number(input.pax) || 1, 1), 50) : 0
      next[input.eventId] = { status, pax }
    } else {
      const status = toDbStatus(input.status)
      const pax =
        status === 'yes' ? Math.min(Math.max(Number(input.pax) || 1, 1), 50) : 0
      const targets = invitedTo
      if (targets.length === 0) {
        const { error } = await supabase
          .from('guests')
          .update({
            rsvp_status: status,
            pax_count: pax,
            responded_at: respondedAt,
          })
          .eq('id', guestRow.id)
        if (error) throw new Error('Could not save RSVP')
        return { ok: true as const }
      }
      for (const eventId of targets) {
        next[eventId] = { status, pax }
      }
    }

    const rollup = rollupRsvpStatus(invitedTo, next)
    const yesPax = Object.values(next)
      .filter((r) => r.status === 'yes')
      .map((r) => r.pax ?? 0)
    const paxCount = yesPax.length > 0 ? Math.max(...yesPax) : 0

    const { error } = await supabase
      .from('guests')
      .update({
        rsvp_status: rollup,
        pax_count: paxCount,
        rsvp_by_event: next,
        responded_at: respondedAt,
      })
      .eq('id', guestRow.id)

    if (error) {
      if (/(invited_to|rsvp_by_event)/i.test(error.message || '')) {
        const status = toDbStatus(input.status)
        const pax =
          status === 'yes' ? Math.min(Math.max(Number(input.pax) || 1, 1), 50) : 0
        const legacy = await supabase
          .from('guests')
          .update({
            rsvp_status: status,
            pax_count: pax,
            responded_at: respondedAt,
          })
          .eq('id', guestRow.id)
        if (legacy.error) throw new Error('Could not save RSVP')
        return { ok: true as const }
      }
      throw new Error('Could not save RSVP')
    }
    return { ok: true as const }
  }

  if (projectId) {
    const status = toDbStatus(input.status)
    const pax =
      status === 'yes' ? Math.min(Math.max(Number(input.pax) || 1, 1), 50) : 0
    const { error } = await supabase.from('guests').insert({
      name: guestName.slice(0, 100),
      project_id: projectId,
      rsvp_status: status,
      pax_count: pax,
      guest_category: 'Open Invite',
      unique_token: makeToken(),
      responded_at: respondedAt,
    })

    if (error) throw new Error('Could not save RSVP')
    return { ok: true as const }
  }

  throw new Error('Missing invitation token or project')
}
