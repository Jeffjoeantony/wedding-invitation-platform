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

    const ALLOWED_EVENT_TYPES = [
      'Wedding', 'Engagement', 'Reception', 'Mehendi', 'Haldi',
      'Save The Date', 'Birthday', 'Housewarming', 'Corporate Event', 'Custom Event',
    ]
    // The type the user selected (used for display)
    const event_template_display = ALLOWED_EVENT_TYPES.includes(String(body.event_template ?? ''))
      ? String(body.event_template)
      : 'Wedding'

    const venue = String(body.venue ?? '').trim().slice(0, 300)
    const location = String(body.location ?? '').trim().slice(0, 200)
    const contact = String(body.contact ?? '').trim().slice(0, 50)

    // Date validation — reject past dates
    let date: string | null = null
    if (body.date) {
      const dateStr = String(body.date).slice(0, 10)
      const today = new Date().toISOString().split('T')[0]
      if (dateStr < today) {
        return NextResponse.json({ error: 'Event date cannot be in the past.' }, { status: 400 })
      }
      date = dateStr
    }
    const time = body.time ? String(body.time).slice(0, 8) : null

    const supabase = createAdminClient()

    // Helper to build the insert payload
    const buildPayload = (template: string) => ({
      name,
      couple_1,
      couple_2,
      event_template: template,
      venue,
      location,
      contact,
      date,
      time,
      status: 'active',
    })

    // First attempt — try with the user-selected type
    let { data, error } = await supabase
      .from('projects')
      .insert(buildPayload(event_template_display))
      .select()
      .single()

    // If DB CHECK constraint rejects the value (code 23514), retry with 'Wedding'
    // This happens when the event_template column has a constraint limiting values.
    if (error && (error.code === '23514' || (error.message ?? '').toLowerCase().includes('event_template'))) {
      console.warn(
        `[POST /api/projects] event_template CHECK constraint blocked "${event_template_display}". ` +
        `Retrying with 'Wedding'. Run the migration to fix: ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_event_template_check;`
      );
      ({ data, error } = await supabase
        .from('projects')
        .insert(buildPayload('Wedding'))
        .select()
        .single())

      // Override the returned event_template so the UI card shows what the user actually selected
      if (!error && data) {
        data = { ...data, event_template: event_template_display }
      }
    }

    if (error) {
      console.error('[POST /api/projects] Supabase error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create project. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { ...data, _stats: { total: 0, confirmed: 0, declined: 0, pending: 0, totalPax: 0 } },
      { status: 201 }
    )
  } catch (e) {
    console.error('[POST /api/projects] Unexpected error:', e)
    return NextResponse.json({ error: 'Unexpected server error. Please try again.' }, { status: 500 })
  }
}
