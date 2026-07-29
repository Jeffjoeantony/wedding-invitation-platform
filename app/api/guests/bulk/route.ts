import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import {
  guestPhoneLookupVariants,
  guestPhonesEqual,
  normalizeGuestPhoneForStorage,
} from '@/lib/guest-phone'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

const MAX_BULK = 500

type BulkGuestRecord = {
  name: string
  phone: string | null
  email: string | null
  guest_category: string
  rsvp_status: 'pending'
  unique_token: string
}

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
        { status: 400 },
      )
    }

    let skippedInvalidPhone = 0
    const rawRecords: BulkGuestRecord[] = []

    for (const g of guests) {
      const name = String(g?.name ?? '').trim().slice(0, 200)
      if (!name) continue

      const rawPhone = g?.phone
      const hasPhoneInput = rawPhone != null && String(rawPhone).trim() !== ''
      const phoneNorm = normalizeGuestPhoneForStorage(rawPhone)

      if (hasPhoneInput && (phoneNorm.error || !phoneNorm.phone)) {
        skippedInvalidPhone += 1
        continue
      }

      rawRecords.push({
        name,
        phone: phoneNorm.phone,
        email: g?.email ? String(g.email).trim().slice(0, 200) : null,
        guest_category: String(g?.guest_category || 'Other').trim().slice(0, 100),
        rsvp_status: 'pending',
        unique_token: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      })
    }

    if (rawRecords.length === 0) {
      return NextResponse.json(
        {
          error:
            skippedInvalidPhone > 0
              ? 'No valid guests to import (invalid phone numbers were skipped)'
              : 'No valid guest names found',
          skippedInvalidPhone,
          count: 0,
        },
        { status: 400 },
      )
    }

    const seenPhones: string[] = []
    const dedupedRecords: BulkGuestRecord[] = []
    let skippedInBatch = 0

    for (const g of rawRecords) {
      if (g.phone) {
        if (seenPhones.some((p) => guestPhonesEqual(p, g.phone))) {
          skippedInBatch += 1
          continue
        }
        seenPhones.push(g.phone)
      }
      dedupedRecords.push(g)
    }

    const supabase = createAdminClient()
    const incomingPhones = dedupedRecords.map((g) => g.phone).filter(Boolean) as string[]
    const lookupVariants = [
      ...new Set(incomingPhones.flatMap((p) => guestPhoneLookupVariants(p))),
    ]

    let existingPhones: string[] = []
    if (lookupVariants.length > 0) {
      const { data: existing } = await supabase
        .from('guests')
        .select('name, phone')
        .in('phone', lookupVariants)

      existingPhones = (existing ?? []).map((g) => g.phone).filter(Boolean) as string[]
    }

    const newRecords = dedupedRecords.filter((g) => {
      if (!g.phone) return true
      return !existingPhones.some((p) => guestPhonesEqual(p, g.phone))
    })

    const skippedDuplicatePhone =
      skippedInBatch + (dedupedRecords.length - newRecords.length)
    const totalSkipped = skippedDuplicatePhone + skippedInvalidPhone

    if (newRecords.length === 0) {
      return NextResponse.json(
        {
          error: 'No new guests to import',
          skipped: totalSkipped,
          skippedDuplicatePhone,
          skippedInvalidPhone,
          count: 0,
        },
        { status: 409 },
      )
    }

    const { data, error } = await supabase.from('guests').insert(newRecords).select()

    if (error) return NextResponse.json({ error: 'Import failed' }, { status: 500 })

    const parts = [`Imported ${data.length} guest${data.length !== 1 ? 's' : ''}`]
    if (skippedDuplicatePhone > 0) {
      parts.push(`skipped ${skippedDuplicatePhone} duplicate phone${skippedDuplicatePhone !== 1 ? 's' : ''}`)
    }
    if (skippedInvalidPhone > 0) {
      parts.push(
        `skipped ${skippedInvalidPhone} row${skippedInvalidPhone !== 1 ? 's' : ''} with invalid phone`,
      )
    }

    return NextResponse.json(
      {
        count: data.length,
        skipped: totalSkipped,
        skippedDuplicatePhone,
        skippedInvalidPhone,
        message: `${parts.join('. ')}.`,
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
