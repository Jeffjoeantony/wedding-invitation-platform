import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Guests opening invites — moderate rate limit
  const limited = rateLimit(req, 30)
  if (limited) return limited

  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    // Basic token sanity: hex string, 8-32 chars
    if (!token || !/^[a-zA-Z0-9_-]{6,64}$/.test(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch guest — include project_id so we can get per-project event data
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('id,name,phone,unique_token,rsvp_status,pax_count,guest_category,opened_at,responded_at,project_id')
      .eq('unique_token', token)
      .single()

    if (guestError || !guest) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Track first open — best-effort, don't fail request if this fails
    if (!guest.opened_at) {
      await supabase
        .from('guests')
        .update({ opened_at: new Date().toISOString() })
        .eq('id', guest.id)
    }

    // Fetch event data from the PROJECT — each project has its own event_template,
    // couple names, date, venue etc. (not from the legacy global `event` table)
    const { data: event } = await supabase
      .from('projects')
      .select('couple_1,couple_2,date,time,venue,location,contact,maps_url,event_template')
      .eq('id', guest.project_id)
      .single()

    return NextResponse.json({ guest, event })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
