import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import {
  resolveProjectEvents,
  sanitizeEventsPayload,
  syncLegacyFieldsFromEvents,
} from '@/lib/project-events'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

const EVENT_SELECT =
  'id,couple_1,couple_2,date,time,venue,location,contact,maps_url,event_template,status,name,events'

// Public readable for invite pages + admin: get project event details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const supabase = createAdminClient()
    let { data, error } = await supabase
      .from('projects')
      .select(EVENT_SELECT)
      .eq('id', id)
      .single()

    // Fallback if `events` column not migrated yet
    if (error && /events/i.test(error.message || '')) {
      const retry = await supabase
        .from('projects')
        .select('id,couple_1,couple_2,date,time,venue,location,contact,maps_url,event_template,status,name')
        .eq('id', id)
        .single()
      data = retry.data ? { ...retry.data, events: [] } : null
      error = retry.error
    }

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin only: update project event details
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, 30)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const body = await req.json()

    const ALLOWED_FIELDS = [
      'couple_1', 'couple_2', 'date', 'time',
      'venue', 'location', 'contact', 'maps_url', 'event_template', 'status', 'name',
    ] as const
    type AllowedKey = typeof ALLOWED_FIELDS[number]

    const updates: Record<string, unknown> = {}
    for (const key of ALLOWED_FIELDS) {
      if (key in body && typeof body[key] === 'string') {
        updates[key] = String(body[key]).slice(0, 500)
      }
    }

    const supabase = createAdminClient()

    if ('events' in body) {
      const events = sanitizeEventsPayload(body.events)
      let template =
        typeof updates.event_template === 'string'
          ? updates.event_template
          : typeof body.event_template === 'string'
            ? body.event_template
            : undefined

      if (!template) {
        const { data: current } = await supabase
          .from('projects')
          .select('event_template,date,time,venue,location,maps_url')
          .eq('id', id)
          .single()
        template = current?.event_template || 'Wedding'
        if (!updates.date) updates.date = current?.date
        if (!updates.time) updates.time = current?.time
        if (!updates.venue) updates.venue = current?.venue
        if (!updates.location) updates.location = current?.location
        if (!updates.maps_url) updates.maps_url = current?.maps_url
      }

      const merged = resolveProjectEvents({
        events,
        event_template: template,
        date: typeof updates.date === 'string' ? updates.date : undefined,
        time: typeof updates.time === 'string' ? updates.time : undefined,
        venue: typeof updates.venue === 'string' ? updates.venue : undefined,
        location: typeof updates.location === 'string' ? updates.location : undefined,
        maps_url: typeof updates.maps_url === 'string' ? updates.maps_url : undefined,
      })
      updates.events = merged
      const legacy = syncLegacyFieldsFromEvents(merged)
      updates.date = legacy.date
      updates.time = legacy.time
      updates.venue = legacy.venue
      updates.location = legacy.location
      updates.maps_url = legacy.maps_url
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      if (/events/i.test(error.message || '')) {
        return NextResponse.json(
          {
            error:
              'Multi-event columns are missing. Run db/migrations/multi-event-schema.sql in Supabase, then try again.',
          },
          { status: 500 },
        )
      }
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
