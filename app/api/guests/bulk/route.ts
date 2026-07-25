import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

const MAX_BULK = 500

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 10)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  try {
    const body = await req.json()
    const { guests } = body

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: 'No guests provided' }, { status: 400 })
    }

    if (guests.length > MAX_BULK) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BULK} guests per import` },
        { status: 400 }
      )
    }

    // ── Step 1: Normalise incoming rows ────────────────────────────────────────
    const rawRecords = guests
      .map((g: any) => ({
        name: String(g.name ?? '').trim().slice(0, 200),
        phone: g.phone ? String(g.phone).trim().slice(0, 30) : null,
        email: g.email ? String(g.email).trim().slice(0, 200) : null,
        guest_category: String(g.guest_category || 'Other').trim().slice(0, 100),
        rsvp_status: 'pending' as const,
        unique_token: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      }))
      .filter((g) => g.name.length > 0)

    if (rawRecords.length === 0) {
      return NextResponse.json({ error: 'No valid guest names found' }, { status: 400 })
    }

    // ── Step 2: Deduplicate within the incoming batch by phone only ───────────
    // Same name with different/no phone is allowed.
    const seenPhones = new Set<string>()
    const dedupedRecords = rawRecords.filter((g) => {
      if (!g.phone) return true
      if (seenPhones.has(g.phone)) return false
      seenPhones.add(g.phone)
      return true
    })

    const skippedInBatch = rawRecords.length - dedupedRecords.length

    // ── Step 3: Check against existing guests in DB (phone only) ──────────────
    const supabase = createAdminClient()
    const incomingPhones = dedupedRecords.map((g) => g.phone).filter(Boolean) as string[]

    let existingPhones = new Set<string>()

    if (incomingPhones.length > 0) {
      const { data: existing } = await supabase
        .from('guests')
        .select('name, phone')
        .in('phone', incomingPhones)

      existingPhones = new Set((existing ?? []).map((g) => g.phone).filter(Boolean) as string[])
    }

    const newRecords = dedupedRecords.filter((g) => {
      if (!g.phone) return true
      return !existingPhones.has(g.phone)
    })

    const skippedExisting = dedupedRecords.length - newRecords.length
    const totalSkipped = skippedInBatch + skippedExisting

    if (newRecords.length === 0) {
      return NextResponse.json(
        {
          error: 'All guests already exist in the list',
          skipped: totalSkipped,
          count: 0,
        },
        { status: 409 }
      )
    }

    // ── Step 4: Insert only the truly new records ──────────────────────────────
    const { data, error } = await supabase.from('guests').insert(newRecords).select()

    if (error) return NextResponse.json({ error: 'Import failed' }, { status: 500 })

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
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
