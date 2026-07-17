import { createAdminClient } from '@/lib/supabase/admin'
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
      .select('id,couple_1,couple_2,date,time,venue,location,contact,maps_url,event_template,events')
      .eq('id', projectId)
      .single()

    let eventRow = event
    if (error || !event) {
      if (error && /events/i.test(error.message || '')) {
        const retry = await supabase
          .from('projects')
          .select('id,couple_1,couple_2,date,time,venue,location,contact,maps_url,event_template')
          .eq('id', projectId)
          .single()
        if (retry.error || !retry.data) {
          return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
        }
        eventRow = { ...retry.data, events: [] }
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
