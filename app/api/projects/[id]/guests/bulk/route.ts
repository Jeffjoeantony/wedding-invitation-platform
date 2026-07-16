import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

const MAX_BULK = 500

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, 10)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const body = await req.json()
    const { guests } = body

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: 'No guests provided' }, { status: 400 })
    }
    if (guests.length > MAX_BULK) {
      return NextResponse.json({ error: `Maximum ${MAX_BULK} guests per import` }, { status: 400 })
    }

    // ── Step 1: Normalise incoming rows ───────────────────────────────────────
    const rawRecords = guests
      .map((g: any) => ({
        name: String(g.name ?? '').trim().slice(0, 200),
        phone: g.phone ? String(g.phone).trim().slice(0, 30) : null,
        email: g.email ? String(g.email).trim().slice(0, 200) : null,
        guest_category: String(g.guest_category || 'Other').trim().slice(0, 100),
        rsvp_status: 'pending' as const,
        project_id: id,
        // Generate a unique invite token (required NOT NULL in guests table)
        unique_token: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      }))
      .filter((g) => g.name.length > 0)

    if (rawRecords.length === 0) {
      return NextResponse.json({ error: 'No valid guest names found' }, { status: 400 })
    }

    // ── Step 2: Deduplicate within the batch ──────────────────────────────────
    const seenNames = new Set<string>()
    const seenPhones = new Set<string>()
    const dedupedRecords = rawRecords.filter((g) => {
      const nameLower = g.name.toLowerCase()
      if (seenNames.has(nameLower)) return false
      if (g.phone && seenPhones.has(g.phone)) return false
      seenNames.add(nameLower)
      if (g.phone) seenPhones.add(g.phone)
      return true
    })

    const skippedInBatch = rawRecords.length - dedupedRecords.length

    // ── Step 3: Check against existing guests in this project ─────────────────
    const supabase = createAdminClient()
    const incomingNames = dedupedRecords.map((g) => g.name.toLowerCase())
    const incomingPhones = dedupedRecords.map((g) => g.phone).filter(Boolean) as string[]

    // Build the OR filter safely — only include conditions if we have values
    const orConditions: string[] = [
      ...incomingNames.map((n) => `name.ilike.${n}`),
      ...(incomingPhones.length > 0 ? [`phone.in.(${incomingPhones.join(',')})`] : []),
    ]

    let existingNames = new Set<string>()
    let existingPhones = new Set<string>()

    if (orConditions.length > 0) {
      const { data: existing, error: existingError } = await supabase
        .from('guests')
        .select('name, phone')
        .eq('project_id', id)
        .or(orConditions.join(','))

      if (existingError) {
        console.error('[POST /api/projects/[id]/guests/bulk] Duplicate check error:', existingError)
        // Non-fatal: proceed without dedup against existing
      } else {
        existingNames = new Set((existing ?? []).map((g) => g.name.toLowerCase()))
        existingPhones = new Set((existing ?? []).map((g) => g.phone).filter(Boolean) as string[])
      }
    }

    const newRecords = dedupedRecords.filter(
      (g) =>
        !existingNames.has(g.name.toLowerCase()) &&
        !(g.phone && existingPhones.has(g.phone))
    )

    const skippedExisting = dedupedRecords.length - newRecords.length
    const totalSkipped = skippedInBatch + skippedExisting

    if (newRecords.length === 0) {
      return NextResponse.json(
        { error: 'All guests already exist in this project', skipped: totalSkipped, count: 0 },
        { status: 409 }
      )
    }

    // ── Step 4: Insert new records ────────────────────────────────────────────
    const { data, error } = await supabase.from('guests').insert(newRecords).select()

    if (error) {
      console.error('[POST /api/projects/[id]/guests/bulk] Insert error:', error)
      return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 })
    }

    return NextResponse.json(
      {
        count: data.length,
        skipped: totalSkipped,
        message:
          totalSkipped > 0
            ? `Imported ${data.length} guests. Skipped ${totalSkipped} duplicate(s).`
            : `Imported ${data.length} guests.`,
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('[POST /api/projects/[id]/guests/bulk] Unexpected error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
