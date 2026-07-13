'use server'

type RsvpInput = {
  token: string
  status: 'accepted' | 'declined'
  pax?: number
}

/** Submit an RSVP through the platform guests API. */
export async function submitRsvp(input: RsvpInput) {
  const token = input.token?.trim()
  if (!token) {
    throw new Error('Missing invitation token')
  }

  const status = input.status === 'declined' ? 'no' : 'yes'
  const pax =
    status === 'yes' ? Math.min(Math.max(Number(input.pax) || 1, 1), 50) : 0

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()

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
      responded_at: new Date().toISOString(),
    })
    .eq('id', guest.id)

  if (error) {
    throw new Error('Could not save RSVP')
  }

  return { ok: true as const }
}
