import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

const VALID_STATUSES = ['yes', 'no'] as const

export async function POST(req: NextRequest) {
  // Guests submitting RSVPs — strict rate limit (5/min) to prevent spam
  const limited = rateLimit(req, 5)
  if (limited) return limited

  try {
    const body = await req.json()
    const { token, status, pax_count, attending_members } = body

    // Validate token format
    if (!token || !/^[a-zA-Z0-9_-]{6,64}$/.test(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid RSVP status' }, { status: 400 })
    }

    // Validate pax_count
    const pax = Number(pax_count)
    if (!Number.isInteger(pax) || pax < 0 || pax > 50) {
      return NextResponse.json({ error: 'Invalid guest count' }, { status: 400 })
    }

    // Sanitise attending_members
    const members = Array.isArray(attending_members)
      ? attending_members
          .slice(0, 50)
          .map((m: any) => ({
            name: String(m?.name ?? '').trim().slice(0, 100),
            type: m?.type === 'Child' ? 'Child' : 'Adult',
          }))
      : []

    const supabase = createAdminClient()

    // Verify the token actually exists before updating
    const { data: guest, error: lookupError } = await supabase
      .from('guests')
      .select('id,rsvp_status')
      .eq('unique_token', token)
      .single()

    if (lookupError || !guest) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('guests')
      .update({
        rsvp_status: status,
        pax_count: pax,
        attending_members: members,
        responded_at: new Date().toISOString(),
      })
      .eq('id', guest.id)

    if (error) return NextResponse.json({ error: 'Could not save RSVP' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
