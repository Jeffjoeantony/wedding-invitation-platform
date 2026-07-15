import { requireAdmin } from '@/lib/admin-auth'
import { rateLimit } from '@/lib/rate-limit'
import { MAX_GALLERY_IMAGES } from '@/lib/invite-media'
import {
  deleteInviteImage,
  getProjectGallery,
  projectGalleryFolder,
  uploadInviteImage,
} from '@/lib/invite-media-server'
import { NextRequest, NextResponse } from 'next/server'

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const images = await getProjectGallery(id)
    return NextResponse.json({ images })
  } catch (e) {
    console.error('[GET gallery]', e)
    return NextResponse.json({ error: 'Could not load gallery' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, 20)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
    }

    const existing = await getProjectGallery(id)
    if (existing.length >= MAX_GALLERY_IMAGES) {
      return NextResponse.json(
        { error: `Gallery allows up to ${MAX_GALLERY_IMAGES} images` },
        { status: 400 },
      )
    }

    const caption = String(form.get('caption') ?? '').trim().slice(0, 120)
    const uploaded = await uploadInviteImage({
      file,
      folder: projectGalleryFolder(id),
    })
    if (caption) uploaded.caption = caption

    const next = await getProjectGallery(id)
    return NextResponse.json({ image: uploaded, images: next }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed'
    console.error('[POST gallery]', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, 30)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const { searchParams } = new URL(req.url)
    const imageId = searchParams.get('imageId')
    if (!imageId) return NextResponse.json({ error: 'imageId is required' }, { status: 400 })

    const existing = await getProjectGallery(id)
    const target = existing.find((img) => img.id === imageId)
    if (!target) return NextResponse.json({ error: 'Image not found' }, { status: 404 })

    await deleteInviteImage(target.path)
    const next = await getProjectGallery(id)
    return NextResponse.json({ images: next })
  } catch (e) {
    console.error('[DELETE gallery]', e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}

/** Reorder response — storage uses upload time; client can re-fetch. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, 30)
  if (limited) return limited

  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  try {
    const images = await getProjectGallery(id)
    return NextResponse.json({ images })
  } catch (e) {
    console.error('[PATCH gallery]', e)
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 })
  }
}
