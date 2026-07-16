import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { getGuestMomentsCounts } from '@/lib/invite-media-server'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

// Admin only: list all guests for a project
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, 60)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('guests')
      .select('id,name,phone,email,unique_token,rsvp_status,pax_count,guest_category,opened_at,responded_at,created_at')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/projects/[id]/guests] Supabase error:', error)
      return NextResponse.json({ error: error.message || 'Fetch failed' }, { status: 500 })
    }

    const guests = data ?? []
    const counts = await getGuestMomentsCounts(
      id,
      guests.map((g) => g.id as string),
    ).catch(() => ({} as Record<string, number>))

    return NextResponse.json(
      guests.map((g) => ({
        ...g,
        moments_count: counts[g.id as string] ?? 0,
      })),
    )
  } catch (e) {
    console.error('[GET /api/projects/[id]/guests] Unexpected error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin only: add a single guest to a project
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, 30)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const body = await req.json()

    const name = String(body.name ?? '').trim().slice(0, 200)
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const phone = body.phone ? String(body.phone).trim().slice(0, 30) : null
    const email = body.email ? String(body.email).trim().slice(0, 200) : null
    const guest_category = String(body.guest_category || 'Other').trim().slice(0, 100)

    const supabase = createAdminClient()

    // Duplicate check — within this project only (name OR phone)
    const orParts = [`name.ilike.${name}`]
    if (phone) orParts.push(`phone.eq.${phone}`)

    const { data: existing } = await supabase
      .from('guests')
      .select('id, name, phone')
      .eq('project_id', id)
      .or(orParts.join(','))
      .limit(1)

    if (existing && existing.length > 0) {
      const dup = existing[0]
      const reason =
        dup.name.toLowerCase() === name.toLowerCase()
          ? `A guest named "${dup.name}" already exists in this project`
          : `Phone number ${phone} is already registered to "${dup.name}" in this project`
      return NextResponse.json({ error: reason, duplicate: true }, { status: 409 })
    }

    // Generate a unique invite token (required NOT NULL in the guests table)
    const unique_token = crypto.randomUUID().replace(/-/g, '').slice(0, 16)

    const { data, error } = await supabase
      .from('guests')
      .insert({ name, phone, email, guest_category, rsvp_status: 'pending', project_id: id, unique_token })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        const isGlobalConstraint = error.message?.includes('guests_phone_unique')
        const isPerProjectConstraint = error.message?.includes('guests_project_phone_unique')

        if (isPerProjectConstraint) {
          // Same phone already in this project
          return NextResponse.json(
            { error: `Phone number ${phone} is already registered to a guest in this project`, duplicate: true },
            { status: 409 }
          )
        }

        if (isGlobalConstraint && phone) {
          // Old global constraint still active — retry without phone so guest is still added
          // (DB migration to drop guests_phone_unique is pending)
          const { data: retryData, error: retryError } = await supabase
            .from('guests')
            .insert({ name, phone: null, email, guest_category, rsvp_status: 'pending', project_id: id, unique_token })
            .select()
            .single()

          if (retryError) {
            console.error('[POST /api/projects/[id]/guests] Retry error:', retryError)
            return NextResponse.json({ error: retryError.message || 'Insert failed' }, { status: 500 })
          }

          // Guest added without phone — return success with a note
          return NextResponse.json(
            { ...retryData, _warning: 'Phone was not saved — it is used by another guest across projects. Run the DB migration to allow cross-project phone reuse.' },
            { status: 201 }
          )
        }

        // Some other unique constraint
        return NextResponse.json({ error: 'A guest with the same details already exists' }, { status: 409 })
      }

      console.error('[POST /api/projects/[id]/guests] Supabase error:', error)
      return NextResponse.json({ error: error.message || 'Insert failed' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('[POST /api/projects/[id]/guests] Unexpected error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


// Admin only: delete a guest by id (must belong to this project)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, 30)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const { searchParams } = new URL(req.url)
    const guestId = searchParams.get('id')

    if (!guestId || !/^[0-9a-f-]{36}$/.test(guestId)) {
      return NextResponse.json({ error: 'Valid guest ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId)
      .eq('project_id', id)

    if (error) {
      console.error('[DELETE /api/projects/[id]/guests] Supabase error:', error)
      return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[DELETE /api/projects/[id]/guests] Unexpected error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
