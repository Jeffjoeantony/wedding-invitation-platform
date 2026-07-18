import { createAdminClient } from '@/lib/supabase/admin'
import { getGuestMoments, getProjectGallery } from '@/lib/invite-media-server'
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

    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select(
        'id,name,phone,unique_token,rsvp_status,pax_count,guest_category,opened_at,responded_at,project_id,invited_to,rsvp_by_event,rsvp_headline,greeting_line,hide_greeting',
      )
      .eq('unique_token', token)
      .single()

    let guestRow: {
      id: string
      name: string
      phone?: string | null
      unique_token: string
      rsvp_status: string
      pax_count: number
      guest_category?: string | null
      opened_at?: string | null
      responded_at?: string | null
      project_id: string
      invited_to?: unknown
      rsvp_by_event?: unknown
      rsvp_headline?: string | null
      greeting_line?: string | null
      hide_greeting?: boolean | null
    } | null = guest

    if (guestError || !guest) {
      const missingCol = /(invited_to|rsvp_by_event|rsvp_headline|greeting_line|hide_greeting)/i
      if (guestError && missingCol.test(guestError.message || '')) {
        const multi = await supabase
          .from('guests')
          .select(
            'id,name,phone,unique_token,rsvp_status,pax_count,guest_category,opened_at,responded_at,project_id,invited_to,rsvp_by_event',
          )
          .eq('unique_token', token)
          .single()
        if (multi.error || !multi.data) {
          const legacy = await supabase
            .from('guests')
            .select(
              'id,name,phone,unique_token,rsvp_status,pax_count,guest_category,opened_at,responded_at,project_id',
            )
            .eq('unique_token', token)
            .single()
          if (legacy.error || !legacy.data) {
            return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
          }
          guestRow = {
            ...legacy.data,
            invited_to: null,
            rsvp_by_event: {},
            rsvp_headline: null,
            greeting_line: null,
            hide_greeting: false,
          }
        } else {
          guestRow = {
            ...multi.data,
            rsvp_headline: null,
            greeting_line: null,
            hide_greeting: false,
          }
        }
      } else {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
      }
    }

    if (!guestRow) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Track first open — best-effort, don't fail request if this fails
    if (!guestRow.opened_at) {
      await supabase
        .from('guests')
        .update({ opened_at: new Date().toISOString() })
        .eq('id', guestRow.id)
    }

    let { data: event } = await supabase
      .from('projects')
      .select('id,couple_1,couple_2,date,time,venue,location,contact,maps_url,event_template,events')
      .eq('id', guestRow.project_id)
      .single()

    if (!event) {
      const retry = await supabase
        .from('projects')
        .select('id,couple_1,couple_2,date,time,venue,location,contact,maps_url,event_template')
        .eq('id', guestRow.project_id)
        .single()
      event = retry.data ? { ...retry.data, events: [] } : null
    }

    const [moments, galleryImages] = await Promise.all([
      getGuestMoments(guestRow.id, guestRow.project_id).catch(() => []),
      getProjectGallery(guestRow.project_id).catch(() => []),
    ])

    return NextResponse.json({
      guest: { ...guestRow, moments },
      event: event ? { ...event, gallery_images: galleryImages } : event,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
