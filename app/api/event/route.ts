import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

// Public: guests open their invite link → read event data
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('event')
      .select('couple_1,couple_2,date,time,venue,location,contact,maps_url,event_template')
      .single()

    if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin only: update event details
export async function PATCH(req: NextRequest) {
  const limited = rateLimit(req, 30)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  try {
    const body = await req.json()

    // Allowlist only safe fields
    const ALLOWED_FIELDS = [
      'couple_1', 'couple_2', 'date', 'time',
      'venue', 'location', 'contact', 'maps_url', 'event_template',
    ] as const
    type AllowedKey = typeof ALLOWED_FIELDS[number]

    const updates: Partial<Record<AllowedKey, string>> = {}
    for (const key of ALLOWED_FIELDS) {
      if (key in body && typeof body[key] === 'string') {
        updates[key] = String(body[key]).slice(0, 500)
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('event').update(updates).eq('id', 1)

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
