import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import {
  COUPLE_FAMILY_FIELDS,
  EMPTY_COUPLE_FAMILY,
  EMPTY_DESIGN_TEMPLATE,
  EMPTY_PLACE_FIELDS,
  PROJECT_EVENT_ADMIN_SELECT,
  PROJECT_EVENT_ADMIN_SELECT_WITHOUT_DESIGN,
  PROJECT_EVENT_CORE_SELECT,
  PROJECT_EVENT_CORE_SELECT_WITHOUT_DESIGN,
  PROJECT_EVENT_FAMILY_SELECT_WITHOUT_PLACE,
  isMissingCoupleFamilyColumn,
  isMissingDesignTemplateColumn,
  mergeProjectRow,
  queryProjectRow,
} from '@/lib/couple-family'
import { isInviteTemplateId, withDefaultDesignTemplate } from '@/lib/invite-templates'
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

// Public readable for invite pages + admin: get project event details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const supabase = createAdminClient()
    let { data: projectRow, error: initialError } = await supabase
      .from('projects')
      .select(PROJECT_EVENT_ADMIN_SELECT)
      .eq('id', id)
      .single()

    let data: Record<string, unknown> | null = projectRow as Record<string, unknown> | null
    let fetchError: { message: string } | null = initialError
      ? { message: initialError.message }
      : null

    let includeDesign = true
    if (fetchError && isMissingDesignTemplateColumn(fetchError.message)) {
      includeDesign = false
      const retry = await supabase
        .from('projects')
        .select(PROJECT_EVENT_ADMIN_SELECT_WITHOUT_DESIGN)
        .eq('id', id)
        .single()
      data = retry.data ? mergeProjectRow(retry.data, EMPTY_DESIGN_TEMPLATE) : null
      fetchError = retry.error ? { message: retry.error.message } : null
    }

    const coreSelect = includeDesign
      ? PROJECT_EVENT_CORE_SELECT
      : PROJECT_EVENT_CORE_SELECT_WITHOUT_DESIGN
    const designFallback = includeDesign ? {} : EMPTY_DESIGN_TEMPLATE

    // Fallback if family columns not migrated yet
    if (fetchError && isMissingCoupleFamilyColumn(fetchError.message)) {
      if (/place/i.test(fetchError.message || '')) {
        const retry = await queryProjectRow(
          supabase,
          id,
          `${coreSelect},status,name,events,${PROJECT_EVENT_FAMILY_SELECT_WITHOUT_PLACE}`,
        )
        data = retry.data
          ? mergeProjectRow(retry.data, { ...EMPTY_PLACE_FIELDS, ...designFallback })
          : null
        fetchError = retry.error
      } else {
        const retry = await queryProjectRow(
          supabase,
          id,
          `${coreSelect},status,name,events`,
        )
        data = retry.data
          ? mergeProjectRow(retry.data, { ...EMPTY_COUPLE_FAMILY, ...designFallback })
          : null
        fetchError = retry.error
      }
    }

    // Fallback if `events` column not migrated yet
    if (fetchError && /events/i.test(fetchError.message || '')) {
      const retry = await queryProjectRow(supabase, id, `${coreSelect},status,name`)
      data = retry.data
        ? mergeProjectRow(retry.data, { events: [], ...EMPTY_COUPLE_FAMILY, ...designFallback })
        : null
      fetchError = retry.error
    }

    if (fetchError || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(withDefaultDesignTemplate(data as Record<string, unknown>), {
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
      'venue', 'location', 'contact', 'maps_url', 'event_template', 'design_template',
      'status', 'name',
      ...COUPLE_FAMILY_FIELDS,
    ] as const

    const updates: Record<string, unknown> = {}
    for (const key of ALLOWED_FIELDS) {
      if (key in body && typeof body[key] === 'string') {
        updates[key] = String(body[key]).slice(0, 500)
      }
    }

    const ALLOWED_EVENT_TYPES = ['Wedding', 'Engagement', 'Reception', 'Mehendi', 'Haldi']
    if (
      typeof updates.event_template === 'string' &&
      !ALLOWED_EVENT_TYPES.includes(updates.event_template)
    ) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    if (
      typeof updates.design_template === 'string' &&
      !isInviteTemplateId(updates.design_template)
    ) {
      return NextResponse.json({ error: 'Invalid design template' }, { status: 400 })
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
      if (isMissingCoupleFamilyColumn(error.message)) {
        if (/place/i.test(error.message || '')) {
          // Legacy: fold place into house ("House, Place") until place columns exist
          const retryUpdates = { ...updates }
          for (const n of [1, 2] as const) {
            const placeKey = `couple_${n}_place`
            const houseKey = `couple_${n}_house`
            if (!(placeKey in retryUpdates)) continue
            const place = String(retryUpdates[placeKey] ?? '').trim()
            delete retryUpdates[placeKey]
            if (!place) continue
            const house = String(retryUpdates[houseKey] ?? '').trim()
            retryUpdates[houseKey] = house ? `${house}, ${place}` : place
          }
          const retry = await supabase
            .from('projects')
            .update({ ...retryUpdates, updated_at: new Date().toISOString() })
            .eq('id', id)
          if (!retry.error) return NextResponse.json({ success: true })
        }
        return NextResponse.json(
          {
            error:
              'Couple family columns are missing. Run db/migrations/couple-family-schema.sql (or couple-family-place.sql) in Supabase, then try again.',
          },
          { status: 500 },
        )
      }
      if (/events/i.test(error.message || '')) {
        return NextResponse.json(
          {
            error:
              'Multi-event columns are missing. Run db/migrations/multi-event-schema.sql in Supabase, then try again.',
          },
          { status: 500 },
        )
      }
      if (isMissingDesignTemplateColumn(error.message)) {
        return NextResponse.json(
          {
            error:
              'Design template column is missing. Run db/migrations/design-template.sql in Supabase, then try again.',
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
