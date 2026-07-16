'use server'

import { createAdminClient } from '@/lib/supabase/admin'

type RsvpInput = {
  guestName: string
  status: 'accepted' | 'declined'
  pax?: number
  message?: string
  token?: string
  projectId?: string
}

function makeToken() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
}

/** Submit an RSVP — personal invite (token) or open invite (projectId + name). */
export async function submitRsvp(input: RsvpInput) {
  const guestName = input.guestName?.trim() || 'Guest'
  const status = input.status === 'declined' ? 'no' : 'yes'
  const pax =
    status === 'yes' ? Math.min(Math.max(Number(input.pax) || 1, 1), 50) : 0
  const token = input.token?.trim()
  const projectId = input.projectId?.trim()
  const supabase = createAdminClient()
  const respondedAt = new Date().toISOString()

  if (token) {
    const { data: guest, error: lookupError } = await supabase
      .from('guests')
      .select('id')
      .eq('unique_token', token)
      .single()

    if (lookupError || !guest) {
      throw new Error('Invitation not found')
    }

    const { error } = await supabase
      .from('guests')
      .update({
        rsvp_status: status,
        pax_count: pax,
        responded_at: respondedAt,
      })
      .eq('id', guest.id)

    if (error) throw new Error('Could not save RSVP')
    return { ok: true as const }
  }

  if (projectId) {
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
