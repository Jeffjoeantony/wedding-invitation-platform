import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

// Admin only: list all projects with guest stats
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 60)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  try {
    const supabase = createAdminClient()

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })

    // Fetch guest stats per project
    const projectsWithStats = await Promise.all(
      (projects ?? []).map(async (project) => {
        const { data: guests } = await supabase
          .from('guests')
          .select('rsvp_status, pax_count')
          .eq('project_id', project.id)

        const total = guests?.length ?? 0
        const confirmed = guests?.filter((g) => g.rsvp_status === 'yes').length ?? 0
        const declined = guests?.filter((g) => g.rsvp_status === 'no').length ?? 0
        const pending = guests?.filter((g) => g.rsvp_status === 'pending').length ?? 0
        const totalPax = guests?.filter((g) => g.rsvp_status === 'yes').reduce((s, g) => s + (g.pax_count ?? 0), 0) ?? 0

        return {
          ...project,
          _stats: { total, confirmed, declined, pending, totalPax },
        }
      })
    )

    return NextResponse.json(projectsWithStats)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin only: create a new project
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 10)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  try {
    const body = await req.json()

    const name = String(body.name ?? '').trim().slice(0, 200)
    if (!name) return NextResponse.json({ error: 'Project name is required' }, { status: 400 })

    const couple_1 = String(body.couple_1 ?? '').trim().slice(0, 100)
    const couple_2 = String(body.couple_2 ?? '').trim().slice(0, 100)
    const event_template = body.event_template === 'Engagement' ? 'Engagement' : 'Wedding'
    const venue = String(body.venue ?? '').trim().slice(0, 300)
    const location = String(body.location ?? '').trim().slice(0, 200)
    const contact = String(body.contact ?? '').trim().slice(0, 50)
    const date = body.date ? String(body.date).slice(0, 10) : null
    const time = body.time ? String(body.time).slice(0, 8) : null

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        couple_1,
        couple_2,
        event_template,
        venue,
        location,
        contact,
        date,
        time,
        status: 'active',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Create failed' }, { status: 500 })

    return NextResponse.json({ ...data, _stats: { total: 0, confirmed: 0, declined: 0, pending: 0, totalPax: 0 } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
