import { createAdminClient } from '@/lib/supabase/admin'
import {
  EMPTY_COUPLE_FAMILY,
  EMPTY_DESIGN_TEMPLATE,
  EMPTY_PLACE_FIELDS,
  PROJECT_EVENT_CORE_SELECT,
  PROJECT_EVENT_CORE_SELECT_WITHOUT_DESIGN,
  PROJECT_EVENT_FAMILY_SELECT_WITHOUT_PLACE,
  PROJECT_EVENT_INVITE_SELECT,
  PROJECT_EVENT_INVITE_SELECT_WITHOUT_DESIGN,
  isMissingCoupleFamilyColumn,
  isMissingDesignTemplateColumn,
  mergeProjectRow,
  queryProjectRow,
} from '@/lib/couple-family'
import { withDefaultDesignTemplate } from '@/lib/invite-templates'
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

    // Track the most recent open — best-effort, don't fail request if this fails
    await supabase
      .from('guests')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', guestRow.id)

    let { data: eventRow, error: eventError } = await supabase
      .from('projects')
      .select(PROJECT_EVENT_INVITE_SELECT)
      .eq('id', guestRow.project_id)
      .single()

    let event: Record<string, unknown> | null = eventRow as Record<string, unknown> | null
    let fetchError: { message: string } | null = eventError
      ? { message: eventError.message }
      : null

    let includeDesign = true
    if (fetchError && isMissingDesignTemplateColumn(fetchError.message)) {
      includeDesign = false
      const retry = await supabase
        .from('projects')
        .select(PROJECT_EVENT_INVITE_SELECT_WITHOUT_DESIGN)
        .eq('id', guestRow.project_id)
        .single()
      event = retry.data ? mergeProjectRow(retry.data, EMPTY_DESIGN_TEMPLATE) : null
      fetchError = retry.error
    }

    const coreSelect = includeDesign
      ? PROJECT_EVENT_CORE_SELECT
      : PROJECT_EVENT_CORE_SELECT_WITHOUT_DESIGN
    const designFallback = includeDesign ? {} : EMPTY_DESIGN_TEMPLATE

    if (fetchError && isMissingCoupleFamilyColumn(fetchError.message)) {
      if (/place/i.test(fetchError.message || '')) {
        const retry = await queryProjectRow(
          supabase,
          guestRow.project_id,
          `${coreSelect},events,${PROJECT_EVENT_FAMILY_SELECT_WITHOUT_PLACE}`,
        )
        event = retry.data
          ? mergeProjectRow(retry.data, { ...EMPTY_PLACE_FIELDS, ...designFallback })
          : null
        fetchError = retry.error
      } else {
        const retry = await queryProjectRow(
          supabase,
          guestRow.project_id,
          `${coreSelect},events`,
        )
        event = retry.data
          ? mergeProjectRow(retry.data, { ...EMPTY_COUPLE_FAMILY, ...designFallback })
          : null
        fetchError = retry.error
      }
    }

    if (!event || fetchError) {
      const retry = await queryProjectRow(supabase, guestRow.project_id, coreSelect)
      event = retry.data
        ? mergeProjectRow(retry.data, { events: [], ...EMPTY_COUPLE_FAMILY, ...designFallback })
        : null
    }

    const [moments, galleryImages] = await Promise.all([
      getGuestMoments(guestRow.id, guestRow.project_id).catch(() => []),
      getProjectGallery(guestRow.project_id).catch(() => []),
    ])

    return NextResponse.json({
      guest: { ...guestRow, moments },
      event: event ? { ...withDefaultDesignTemplate(event as Record<string, unknown>), gallery_images: galleryImages } : event,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
