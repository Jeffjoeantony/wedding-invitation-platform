import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

const MAX_BULK = 500

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 10)
  if (limited) return limited

  const unauth = requireAdmin(req)
  if (unauth) return unauth

  try {
    const body = await req.json()
    const { guests } = body

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: 'No guests provided' }, { status: 400 })
    }

    if (guests.length > MAX_BULK) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BULK} guests per import` },
        { status: 400 }
      )
    }

    const records = guests
      .map((g: any) => ({
        name: String(g.name ?? '').trim().slice(0, 200),
        phone: g.phone ? String(g.phone).trim().slice(0, 30) : null,
        email: g.email ? String(g.email).trim().slice(0, 200) : null,
        guest_category: String(g.guest_category || 'Other').trim().slice(0, 100),
        rsvp_status: 'pending',
        unique_token: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      }))
      .filter((g) => g.name.length > 0)

    if (records.length === 0) {
      return NextResponse.json({ error: 'No valid guest names found' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.from('guests').insert(records).select()

    if (error) return NextResponse.json({ error: 'Import failed' }, { status: 500 })

    return NextResponse.json({ count: data.length }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
