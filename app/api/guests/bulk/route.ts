import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { guests } = await req.json()

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: 'No guests provided' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Build records with server-generated tokens
    const records = guests
      .map((g: any) => ({
        name: String(g.name ?? '').trim(),
        phone: g.phone ? String(g.phone).trim() : null,
        email: g.email ? String(g.email).trim() : null,
        guest_category: String(g.guest_category || g.category || 'Other').trim(),
        rsvp_status: 'pending',
        // 8-char hex token generated server-side
        unique_token: crypto.randomUUID().replace(/-/g, '').slice(0, 8),
      }))
      .filter((g) => g.name.length > 0)

    if (records.length === 0) {
      return NextResponse.json({ error: 'No valid guest names found' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('guests')
      .insert(records)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ count: data.length, guests: data }, { status: 201 })
  } catch (err) {
    console.error('Bulk import error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
