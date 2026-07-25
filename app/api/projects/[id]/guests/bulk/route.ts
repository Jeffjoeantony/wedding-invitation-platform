import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { normalizeGuestPhoneForStorage } from '@/lib/guest-phone'
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
    let skippedInvalidPhone = 0
    const rawRecords = guests
      .map((g: any) => {
        const name = String(g.name ?? '').trim().slice(0, 200)
        const phoneNorm = normalizeGuestPhoneForStorage(g.phone)
        if (g.phone && phoneNorm.error) {
          skippedInvalidPhone += 1
        }
        return {
          name,
          phone: phoneNorm.phone,
          email: g.email ? String(g.email).trim().slice(0, 200) : null,
          guest_category: String(g.guest_category || 'Other').trim().slice(0, 100),
          rsvp_status: 'pending' as const,
          project_id: id,
          // Generate a unique invite token (required NOT NULL in guests table)
          unique_token: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
        }
      })
      .filter((g) => g.name.length > 0)

    if (rawRecords.length === 0) {
      return NextResponse.json({ error: 'No valid guest names found' }, { status: 400 })
    }

    // ── Step 2: Deduplicate within the batch by phone only ────────────────────
    // Same name with different/no phone is allowed.
    const seenPhones = new Set<string>()
    const dedupedRecords = rawRecords.filter((g) => {
      if (!g.phone) return true
      if (seenPhones.has(g.phone)) return false
      seenPhones.add(g.phone)
      return true
    })

    const skippedInBatch = rawRecords.length - dedupedRecords.length
    const skippedPhone = skippedInvalidPhone

    // ── Step 3: Check against existing guests in this project (phone only) ────
    const supabase = createAdminClient()
    const incomingPhones = dedupedRecords.map((g) => g.phone).filter(Boolean) as string[]

    let existingPhones = new Set<string>()

    if (incomingPhones.length > 0) {
      const { data: existing, error: existingError } = await supabase
        .from('guests')
        .select('name, phone')
        .eq('project_id', id)
        .in('phone', incomingPhones)

      if (existingError) {
        console.error('[POST /api/projects/[id]/guests/bulk] Duplicate check error:', existingError)
        // Non-fatal: proceed without dedup against existing
      } else {
        existingPhones = new Set(
          (existing ?? []).map((g) => g.phone).filter(Boolean) as string[],
        )
      }
    }

    const newRecords = dedupedRecords.filter((g) => {
      if (!g.phone) return true
      return !existingPhones.has(g.phone)
    })

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

    const parts = [`Imported ${data.length} guests`]
    if (totalSkipped > 0) parts.push(`skipped ${totalSkipped} duplicate(s)`)
    if (skippedPhone > 0) parts.push(`cleared ${skippedPhone} invalid phone(s)`)

    return NextResponse.json(
      {
        count: data.length,
        skipped: totalSkipped,
        skippedInvalidPhone: skippedPhone,
        message: `${parts.join('. ')}.`,
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('[POST /api/projects/[id]/guests/bulk] Unexpected error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
