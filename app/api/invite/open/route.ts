import { createAdminClient } from '@/lib/supabase/admin'
import {
  EMPTY_COUPLE_FAMILY,
  EMPTY_PLACE_FIELDS,
  PROJECT_EVENT_CORE_SELECT,
  PROJECT_EVENT_FAMILY_SELECT_WITHOUT_PLACE,
  PROJECT_EVENT_INVITE_SELECT,
  isMissingCoupleFamilyColumn,
} from '@/lib/couple-family'
import { getProjectGallery } from '@/lib/invite-media-server'
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

    const { data: event, error } = await supabase
      .from('projects')
      .select(PROJECT_EVENT_INVITE_SELECT)
      .eq('id', projectId)
      .single()

    let eventRow = event
    if (error || !event) {
      if (error && isMissingCoupleFamilyColumn(error.message)) {
        if (/place/i.test(error.message || '')) {
          const retry = await supabase
            .from('projects')
            .select(
              `${PROJECT_EVENT_CORE_SELECT},events,${PROJECT_EVENT_FAMILY_SELECT_WITHOUT_PLACE}`,
            )
            .eq('id', projectId)
            .single()
          if (retry.error || !retry.data) {
            return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
          }
          eventRow = { ...retry.data, ...EMPTY_PLACE_FIELDS }
        } else {
          const retry = await supabase
            .from('projects')
            .select(`${PROJECT_EVENT_CORE_SELECT},events`)
            .eq('id', projectId)
            .single()
          if (retry.error || !retry.data) {
            return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
          }
          eventRow = { ...retry.data, ...EMPTY_COUPLE_FAMILY }
        }
      } else if (error && /events/i.test(error.message || '')) {
        const retry = await supabase
          .from('projects')
          .select(PROJECT_EVENT_CORE_SELECT)
          .eq('id', projectId)
          .single()
        if (retry.error || !retry.data) {
          return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
        }
        eventRow = { ...retry.data, events: [], ...EMPTY_COUPLE_FAMILY }
      } else {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
      }
    }

    const galleryImages = await getProjectGallery(projectId).catch(() => [])

    return NextResponse.json({
      event: { ...eventRow, gallery_images: galleryImages },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
