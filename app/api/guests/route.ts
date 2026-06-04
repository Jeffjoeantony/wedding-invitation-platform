import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

// Admin only: list all guests
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 60)
  if (limited) return limited

  const unauth = requireAdmin(req)
  if (unauth) return unauth

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('guests')
      .select('id,name,phone,email,unique_token,rsvp_status,pax_count,guest_category,opened_at,responded_at,created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin only: add a single guest
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 30)
  if (limited) return limited

  const unauth = requireAdmin(req)
  if (unauth) return unauth

  try {
    const body = await req.json()

    const name = String(body.name ?? '').trim().slice(0, 200)
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const phone = body.phone ? String(body.phone).trim().slice(0, 30) : null
    const email = body.email ? String(body.email).trim().slice(0, 200) : null
    const guest_category = String(body.guest_category || 'Other').trim().slice(0, 100)

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('guests')
      .insert({ name, phone, email, guest_category, rsvp_status: 'pending' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Insert failed' }, { status: 500 })

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin only: delete a guest by id
export async function DELETE(req: NextRequest) {
  const limited = rateLimit(req, 30)
  if (limited) return limited

  const unauth = requireAdmin(req)
  if (unauth) return unauth

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
      return NextResponse.json({ error: 'Valid guest ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('guests').delete().eq('id', id)

    if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
