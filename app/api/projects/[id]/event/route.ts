import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

// Public readable for invite pages + admin: get project event details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('projects')
      .select('id,couple_1,couple_2,date,time,venue,location,contact,maps_url,event_template,status,name')
      .eq('id', id)
      .single()

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
    const { error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
