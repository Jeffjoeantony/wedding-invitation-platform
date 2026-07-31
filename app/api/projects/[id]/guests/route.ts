import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { getGuestMomentsCounts } from '@/lib/invite-media-server'
import {
  guestPhoneLookupVariants,
  guestPhonesEqual,
  normalizeGuestPhoneForStorage,
} from '@/lib/guest-phone'
import {
  parseInvitedTo,
  parseRsvpByEvent,
  resolveProjectEvents,
  rollupRsvpStatus,
} from '@/lib/project-events'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

const GUEST_SELECT =
  'id,name,phone,email,unique_token,rsvp_status,pax_count,guest_category,opened_at,responded_at,created_at,invited_to,rsvp_by_event,rsvp_headline,greeting_line,hide_greeting'
const GUEST_SELECT_MULTI =
  'id,name,phone,email,unique_token,rsvp_status,pax_count,guest_category,opened_at,responded_at,created_at,invited_to,rsvp_by_event'
const GUEST_SELECT_LEGACY =
  'id,name,phone,email,unique_token,rsvp_status,pax_count,guest_category,opened_at,responded_at,created_at'

const MISSING_GUEST_COLUMN =
  /(invited_to|rsvp_by_event|rsvp_headline|greeting_line|hide_greeting)/i

type GuestConflictField = 'phone' | 'email' | 'name' | 'token' | 'unknown'

/** Map Postgres/Supabase unique violations to a field + user-facing message. */
function conflictFromUniqueError(
  error: { message?: string; details?: string; hint?: string },
  opts: { phone: string | null; email: string | null },
): { field: GuestConflictField; error: string; duplicate: true; blankPhoneConflict?: boolean } {
  const message = error.message || ''
  const details = error.details || ''
  const hint = error.hint || ''
  const blob = `${message} ${details} ${hint}`
  const lower = blob.toLowerCase()

  const keyCols = (blob.match(/Key\s*\(([^)]+)\)/i)?.[1] || '').toLowerCase()
  const constraint = (blob.match(/constraint\s+"?([a-z0-9_]+)"?/i)?.[1] || '').toLowerCase()

  const mentions = (col: string) =>
    keyCols.includes(col) ||
    constraint.includes(col) ||
    new RegExp(`\\b${col}\\b`).test(lower)

  if (mentions('unique_token') || mentions('token')) {
    return {
      field: 'token',
      error: 'Could not create a unique invite link. Please try again.',
      duplicate: true,
    }
  }

  if (mentions('email')) {
    return {
      field: 'email',
      error: opts.email
        ? 'This email is already used by another guest'
        : 'Another guest already has a blank email under a unique email rule. Leave email empty only after fixing the database constraint, or enter a unique email.',
      duplicate: true,
    }
  }

  if (mentions('phone')) {
    if (!opts.phone) {
      return {
        field: 'phone',
        error:
          'Another guest already has no phone number. Enter a unique phone for this guest — phone is optional only when no other guest is blank.',
        duplicate: true,
        blankPhoneConflict: true,
      }
    }
    return {
      field: 'phone',
      error: 'This phone number is already used by another guest',
      duplicate: true,
    }
  }

  // Name uniqueness is not intended by the product; surface it clearly.
  if (mentions('name')) {
    return {
      field: 'name',
      error:
        'A guest with this name already exists (database still enforces unique names). Same names should be allowed — run db/migrations/fix-guest-uniques.sql, or use a slightly different name for now.',
      duplicate: true,
    }
  }

  // Fallback: infer from what we tried to insert
  if (opts.email && /email/i.test(blob)) {
    return { field: 'email', error: 'This email is already used by another guest', duplicate: true }
  }
  if (opts.phone && /phone/i.test(blob)) {
    return { field: 'phone', error: 'This phone number is already used by another guest', duplicate: true }
  }
  if (!opts.phone && /phone/i.test(blob)) {
    return {
      field: 'phone',
      error:
        'Another guest already has no phone number. Enter a unique phone for this guest — phone is optional only when no other guest is blank.',
      duplicate: true,
      blankPhoneConflict: true,
    }
  }

  console.error('[guests] Unclassified unique constraint:', { message, details, hint })
  return {
    field: 'unknown',
    error: 'Could not add guest due to a data conflict. Check phone/email uniqueness in the database and try again.',
    duplicate: true,
  }
}

/** Phone must be unique per project; same names are allowed. */
async function findGuestWithPhone(
  supabase: ReturnType<typeof createAdminClient>,
  projectId: string,
  phone: string,
  excludeGuestId?: string,
): Promise<{ id: string; name: string; phone: string | null } | null> {
  const variants = guestPhoneLookupVariants(phone)
  if (variants.length === 0) return null

  let query = supabase
    .from('guests')
    .select('id, name, phone')
    .eq('project_id', projectId)
    .in('phone', variants)
    .limit(20)

  if (excludeGuestId) query = query.neq('id', excludeGuestId)

  const { data } = await query
  const exact = (data ?? []).find((g) => guestPhonesEqual(g.phone, phone))
  if (exact) return exact

  // Legacy rows may use odd formats — match by national digits then normalize
  const national = phone.replace(/\D/g, '').slice(-10)
  if (national.length < 8) return null

  let loose = supabase
    .from('guests')
    .select('id, name, phone')
    .eq('project_id', projectId)
    .not('phone', 'is', null)
    .like('phone', `%${national}%`)
    .limit(50)

  if (excludeGuestId) loose = loose.neq('id', excludeGuestId)

  const { data: looseRows } = await loose
  return (looseRows ?? []).find((g) => guestPhonesEqual(g.phone, phone)) ?? null
}

async function findGuestWithEmail(
  supabase: ReturnType<typeof createAdminClient>,
  projectId: string,
  email: string,
  excludeGuestId?: string,
): Promise<{ id: string; name: string; email: string | null } | null> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return null

  let query = supabase
    .from('guests')
    .select('id, name, email')
    .eq('project_id', projectId)
    .ilike('email', normalized)
    .limit(5)

  if (excludeGuestId) query = query.neq('id', excludeGuestId)

  const { data } = await query
  return (
    (data ?? []).find((g) => String(g.email || '').trim().toLowerCase() === normalized) ?? null
  )
}

function withGuestDefaults(g: Record<string, unknown>): Record<string, unknown> {
  return {
    ...g,
    invited_to: g.invited_to ?? null,
    rsvp_by_event: g.rsvp_by_event ?? {},
    rsvp_headline: g.rsvp_headline ?? null,
    greeting_line: g.greeting_line ?? null,
    hide_greeting: g.hide_greeting ?? false,
  }
}

async function defaultInvitedTo(supabase: ReturnType<typeof createAdminClient>, projectId: string) {
  let { data, error } = await supabase
    .from('projects')
    .select('date,time,venue,location,maps_url,event_template,events')
    .eq('id', projectId)
    .single()

  if (error && /events/i.test(error.message || '')) {
    const retry = await supabase
      .from('projects')
      .select('date,time,venue,location,maps_url,event_template')
      .eq('id', projectId)
      .single()
    data = retry.data ? { ...retry.data, events: [] } : null
  }

  if (!data) return [] as string[]
  return resolveProjectEvents(data).map((e) => e.id)
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
    let data: Record<string, unknown>[] | null = null
    let error: { message?: string } | null = null

    const primary = await supabase
      .from('guests')
      .select(GUEST_SELECT)
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    if (primary.error && MISSING_GUEST_COLUMN.test(primary.error.message || '')) {
      const multi = await supabase
        .from('guests')
        .select(GUEST_SELECT_MULTI)
        .eq('project_id', id)
        .order('created_at', { ascending: false })

      if (multi.error && MISSING_GUEST_COLUMN.test(multi.error.message || '')) {
        const retry = await supabase
          .from('guests')
          .select(GUEST_SELECT_LEGACY)
          .eq('project_id', id)
          .order('created_at', { ascending: false })
        data =
          (retry.data as Record<string, unknown>[] | null)?.map((g) => withGuestDefaults(g)) ?? null
        error = retry.error
      } else {
        data =
          (multi.data as Record<string, unknown>[] | null)?.map((g) =>
            withGuestDefaults({
              ...g,
              rsvp_headline: null,
              greeting_line: null,
              hide_greeting: false,
            }),
          ) ?? null
        error = multi.error
      }
    } else {
      data = primary.data as Record<string, unknown>[] | null
      error = primary.error
    }

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

    const phoneNorm = normalizeGuestPhoneForStorage(body.phone)
    if (phoneNorm.error) {
      return NextResponse.json({ error: phoneNorm.error, field: 'phone' }, { status: 400 })
    }
    const phone = phoneNorm.phone
    const emailRaw = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : ''
    const email = emailRaw ? emailRaw : null
    const guest_category = String(body.guest_category || 'Other').trim().slice(0, 100)
    const parsedPax = Number.parseInt(String(body.pax_count ?? 1), 10)
    const pax_count = Number.isFinite(parsedPax) ? Math.max(1, Math.min(50, parsedPax)) : 1

    const supabase = createAdminClient()
    const eventIds = await defaultInvitedTo(supabase, id)
    // New guests start with no events — host assigns in guest panel
    let invited_to: string[] = []
    if (Array.isArray(body.invited_to)) {
      invited_to = parseInvitedTo(body.invited_to, eventIds)
    }

    // Same name is allowed. A phone number may only belong to one guest in the project.
    if (phone) {
      const dup = await findGuestWithPhone(supabase, id, phone)
      if (dup) {
        return NextResponse.json(
          {
            error: `This phone number is already used by "${dup.name}"`,
            duplicate: true,
            field: 'phone',
          },
          { status: 409 },
        )
      }
    }

    if (email) {
      const dupEmail = await findGuestWithEmail(supabase, id, email)
      if (dupEmail) {
        return NextResponse.json(
          {
            error: `This email is already used by "${dupEmail.name}"`,
            duplicate: true,
            field: 'email',
          },
          { status: 409 },
        )
      }
    }

    const unique_token = crypto.randomUUID().replace(/-/g, '').slice(0, 16)

    const insertPayload: Record<string, unknown> = {
      name,
      phone,
      email,
      guest_category,
      pax_count,
      rsvp_status: 'pending',
      project_id: id,
      unique_token,
      invited_to,
      rsvp_by_event: {},
    }

    let { data, error } = await supabase.from('guests').insert(insertPayload).select().single()

    if (error && /(invited_to|rsvp_by_event)/i.test(error.message || '')) {
      const legacy = {
        name,
        phone,
        email,
        guest_category,
        pax_count,
        rsvp_status: 'pending',
        project_id: id,
        unique_token,
      }
      const retry = await supabase.from('guests').insert(legacy).select().single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      if (error.code === '23505') {
        const conflict = conflictFromUniqueError(error, { phone, email })
        return NextResponse.json(conflict, { status: 409 })
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

// Admin only: update guest invite scope / details
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, 30)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const body = await req.json()
    const guestId = String(body.id ?? '').trim()
    if (!isValidUUID(guestId)) {
      return NextResponse.json({ error: 'Valid guest ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const eventIds = await defaultInvitedTo(supabase, id)
    const updates: Record<string, unknown> = {}

    if (typeof body.name === 'string') updates.name = body.name.trim().slice(0, 200)
    if (typeof body.phone === 'string' || body.phone === null) {
      const phoneNorm = normalizeGuestPhoneForStorage(body.phone)
      if (phoneNorm.error) {
        return NextResponse.json({ error: phoneNorm.error }, { status: 400 })
      }
      updates.phone = phoneNorm.phone
    }
    if (typeof body.email === 'string') updates.email = body.email.trim().slice(0, 200) || null
    if (typeof body.guest_category === 'string') {
      updates.guest_category = body.guest_category.trim().slice(0, 100)
    }

    if (Array.isArray(body.invited_to)) {
      // Persist the host's selection; only drop ids that are clearly invalid when we know allowed ids
      const parsed = parseInvitedTo(body.invited_to, eventIds)
      updates.invited_to = eventIds.length > 0 ? parsed : body.invited_to.map((v: unknown) => String(v))
    }

    if (typeof body.rsvp_headline === 'string') {
      const trimmed = body.rsvp_headline.trim().slice(0, 300)
      updates.rsvp_headline = trimmed || null
    } else if (body.rsvp_headline === null) {
      updates.rsvp_headline = null
    }

    if (typeof body.greeting_line === 'string') {
      const trimmed = body.greeting_line.trim().slice(0, 200)
      updates.greeting_line = trimmed || null
    } else if (body.greeting_line === null) {
      updates.greeting_line = null
    }

    if (typeof body.hide_greeting === 'boolean') {
      updates.hide_greeting = body.hide_greeting
    }

    if (body.rsvp_by_event && typeof body.rsvp_by_event === 'object') {
      const rsvpByEvent = parseRsvpByEvent(body.rsvp_by_event)
      updates.rsvp_by_event = rsvpByEvent
      const invited = Array.isArray(updates.invited_to)
        ? (updates.invited_to as string[])
        : parseInvitedTo(
            (
              await supabase
                .from('guests')
                .select('invited_to')
                .eq('id', guestId)
                .eq('project_id', id)
                .single()
            ).data?.invited_to,
            eventIds,
          )
      updates.rsvp_status = rollupRsvpStatus(invited, rsvpByEvent)
      const yesPax = invited
        .map((eid) => rsvpByEvent[eid])
        .filter((r) => r?.status === 'yes')
        .map((r) => r?.pax ?? 0)
      updates.pax_count = yesPax.length > 0 ? Math.max(...yesPax) : 0
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Phone must stay unique per project; same names are fine
    if ('phone' in updates && updates.phone) {
      const dup = await findGuestWithPhone(
        supabase,
        id,
        updates.phone as string,
        guestId,
      )
      if (dup) {
        return NextResponse.json(
          {
            error: `This phone number is already used by "${dup.name}"`,
            duplicate: true,
            field: 'phone',
          },
          { status: 409 },
        )
      }
    }

    if ('email' in updates && updates.email) {
      const dupEmail = await findGuestWithEmail(
        supabase,
        id,
        updates.email as string,
        guestId,
      )
      if (dupEmail) {
        return NextResponse.json(
          {
            error: `This email is already used by "${dupEmail.name}"`,
            duplicate: true,
            field: 'email',
          },
          { status: 409 },
        )
      }
    }

    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', guestId)
      .eq('project_id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        const conflict = conflictFromUniqueError(error, {
          phone:
            'phone' in updates
              ? ((updates.phone as string | null) ?? null)
              : null,
          email:
            'email' in updates
              ? ((updates.email as string | null) ?? null)
              : null,
        })
        return NextResponse.json(conflict, { status: 409 })
      }
      if (MISSING_GUEST_COLUMN.test(error.message || '')) {
        return NextResponse.json(
          {
            error:
              'Guest personalization columns are missing. Run db/migrations/multi-event-schema.sql in Supabase, then try again.',
          },
          { status: 500 },
        )
      }
      console.error('[PATCH /api/projects/[id]/guests] Supabase error:', error)
      return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e) {
    console.error('[PATCH /api/projects/[id]/guests] Unexpected error:', e)
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
