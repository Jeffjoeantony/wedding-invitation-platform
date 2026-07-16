import { requireAdmin } from '@/lib/admin-auth'
import { rateLimit } from '@/lib/rate-limit'
import { MAX_GUEST_MOMENTS } from '@/lib/invite-media'
import {
  deleteInviteImage,
  getGuestMoments,
  guestMomentsFolder,
  uploadInviteImage,
} from '@/lib/invite-media-server'
import { NextRequest, NextResponse } from 'next/server'

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> },
) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id, guestId } = await params
  if (!isValidUUID(id) || !isValidUUID(guestId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  try {
    const moments = await getGuestMoments(guestId, id)
    return NextResponse.json({ moments })
  } catch (e) {
    console.error('[GET moments]', e)
    return NextResponse.json({ error: 'Could not load moments' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> },
) {
  const limited = rateLimit(req, 20)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id, guestId } = await params
  if (!isValidUUID(id) || !isValidUUID(guestId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
    }

    const existing = await getGuestMoments(guestId, id)
    if (existing.length >= MAX_GUEST_MOMENTS) {
      return NextResponse.json(
        { error: `Each guest can have up to ${MAX_GUEST_MOMENTS} favourite moments` },
        { status: 400 },
      )
    }

    const caption = String(form.get('caption') ?? '').trim().slice(0, 120)
    const uploaded = await uploadInviteImage({
      file,
      folder: guestMomentsFolder(id, guestId),
    })
    if (caption) uploaded.caption = caption

    const next = await getGuestMoments(guestId, id)
    return NextResponse.json({ moment: uploaded, moments: next }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed'
    console.error('[POST moments]', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> },
) {
  const limited = rateLimit(req, 30)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id, guestId } = await params
  if (!isValidUUID(id) || !isValidUUID(guestId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const imageId = searchParams.get('imageId')
    if (!imageId) return NextResponse.json({ error: 'imageId is required' }, { status: 400 })

    const existing = await getGuestMoments(guestId, id)
    const target = existing.find((img) => img.id === imageId)
    if (!target) return NextResponse.json({ error: 'Image not found' }, { status: 404 })

    await deleteInviteImage(target.path)
    const next = await getGuestMoments(guestId, id)
    return NextResponse.json({ moments: next })
  } catch (e) {
    console.error('[DELETE moments]', e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
