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
import { getProjectGallery } from '@/lib/invite-media-server'
import { withDefaultDesignTemplate } from '@/lib/invite-templates'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 30)
  if (limited) return limited

  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId || !UUID_RE.test(projectId)) {
      return NextResponse.json({ error: 'Invalid project id' }, { status: 400 })
    }

    const supabase = createAdminClient()

    let { data: eventRow, error: initialError } = await supabase
      .from('projects')
      .select(PROJECT_EVENT_INVITE_SELECT)
      .eq('id', projectId)
      .single()

    let event: Record<string, unknown> | null = eventRow as Record<string, unknown> | null
    let fetchError: { message: string } | null = initialError
      ? { message: initialError.message }
      : null

    let includeDesign = true
    if (fetchError && isMissingDesignTemplateColumn(fetchError.message)) {
      includeDesign = false
      const retry = await supabase
        .from('projects')
        .select(PROJECT_EVENT_INVITE_SELECT_WITHOUT_DESIGN)
        .eq('id', projectId)
        .single()
      event = retry.data ? mergeProjectRow(retry.data, EMPTY_DESIGN_TEMPLATE) : null
      fetchError = retry.error ? { message: retry.error.message } : null
    }

    const coreSelect = includeDesign
      ? PROJECT_EVENT_CORE_SELECT
      : PROJECT_EVENT_CORE_SELECT_WITHOUT_DESIGN
    const designFallback = includeDesign ? {} : EMPTY_DESIGN_TEMPLATE

    if (fetchError && isMissingCoupleFamilyColumn(fetchError.message)) {
      if (/place/i.test(fetchError.message || '')) {
        const retry = await queryProjectRow(
          supabase,
          projectId,
          `${coreSelect},events,${PROJECT_EVENT_FAMILY_SELECT_WITHOUT_PLACE}`,
        )
        if (retry.error || !retry.data) {
          return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
        }
        event = mergeProjectRow(retry.data, { ...EMPTY_PLACE_FIELDS, ...designFallback })
        fetchError = retry.error
      } else {
        const retry = await queryProjectRow(supabase, projectId, `${coreSelect},events`)
        if (retry.error || !retry.data) {
          return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
        }
        event = mergeProjectRow(retry.data, { ...EMPTY_COUPLE_FAMILY, ...designFallback })
        fetchError = retry.error
      }
    } else if (fetchError && /events/i.test(fetchError.message || '')) {
      const retry = await queryProjectRow(supabase, projectId, coreSelect)
      if (retry.error || !retry.data) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
      }
      event = mergeProjectRow(retry.data, { events: [], ...EMPTY_COUPLE_FAMILY, ...designFallback })
      fetchError = retry.error
    }

    if (fetchError || !event) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    const galleryImages = await getProjectGallery(projectId).catch(() => [])

    return NextResponse.json({
      event: { ...withDefaultDesignTemplate(event as Record<string, unknown>), gallery_images: galleryImages },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
