import { createAdminClient } from '@/lib/supabase/admin'
import { optimizeInviteImageBuffer } from '@/lib/optimize-invite-image'
import {
  ALLOWED_IMAGE_TYPES,
  INVITE_MEDIA_BUCKET,
  MAX_IMAGE_BYTES,
  newMediaId,
  type MediaItem,
} from '@/lib/invite-media'

let bucketReady: Promise<void> | null = null

const PUBLIC_BUCKET_OPTS = {
  public: true,
  fileSizeLimit: MAX_IMAGE_BYTES,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as string[],
}

/** Create the invite-media bucket if missing, and always keep it public (needed for invite + admin thumbs). */
export async function ensureInviteMediaBucket() {
  if (!bucketReady) {
    bucketReady = (async () => {
      const supabase = createAdminClient()
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      if (listError) {
        throw new Error(
          `Could not access Storage: ${listError.message}. Check SUPABASE_SERVICE_ROLE_KEY.`,
        )
      }

      const existing = buckets?.find(
        (b) => b.id === INVITE_MEDIA_BUCKET || b.name === INVITE_MEDIA_BUCKET,
      )

      if (!existing) {
        const { error: createError } = await supabase.storage.createBucket(
          INVITE_MEDIA_BUCKET,
          PUBLIC_BUCKET_OPTS,
        )
        if (createError && !/already exists|duplicate/i.test(createError.message)) {
          throw new Error(
            `Could not create storage bucket "${INVITE_MEDIA_BUCKET}": ${createError.message}`,
          )
        }
        return
      }

      // Bucket may have been created private — public URLs then 403 and /_next/image returns 400 on Vercel
      if (existing.public === false) {
        const { error: updateError } = await supabase.storage.updateBucket(
          INVITE_MEDIA_BUCKET,
          PUBLIC_BUCKET_OPTS,
        )
        if (updateError) {
          throw new Error(
            `Could not make storage bucket "${INVITE_MEDIA_BUCKET}" public: ${updateError.message}`,
          )
        }
      }
    })().catch((err) => {
      bucketReady = null
      throw err
    })
  }
  await bucketReady
}

export function projectGalleryFolder(projectId: string) {
  return `projects/${projectId}/gallery`
}

export function guestMomentsFolder(projectId: string, guestId: string) {
  return `projects/${projectId}/guests/${guestId}/moments`
}

/** List images in a storage folder (source of truth — no DB columns required). */
export async function listFolderMedia(folder: string): Promise<MediaItem[]> {
  await ensureInviteMediaBucket()
  const supabase = createAdminClient()
  const { data, error } = await supabase.storage.from(INVITE_MEDIA_BUCKET).list(folder, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'asc' },
  })

  if (error) {
    if (/not found|does not exist/i.test(error.message)) return []
    throw new Error(error.message)
  }

  return (data ?? [])
    .filter((f) => !!f.name && /\.(jpe?g|png|webp|gif)$/i.test(f.name))
    .map((f) => {
      const path = `${folder}/${f.name}`
      const id = f.name.replace(/\.[^.]+$/, '')
      const { data: urlData } = supabase.storage.from(INVITE_MEDIA_BUCKET).getPublicUrl(path)
      return {
        id,
        path,
        url: urlData.publicUrl,
      }
    })
}

export async function uploadInviteImage(opts: {
  file: File
  folder: string
}): Promise<MediaItem> {
  const { file, folder } = opts

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, or GIF images are allowed')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image must be 5 MB or smaller')
  }

  const id = newMediaId()
  const raw = Buffer.from(await file.arrayBuffer())
  const optimized = await optimizeInviteImageBuffer(raw, file.type)
  const ext = optimized.ext
  const path = `${folder}/${id}.${ext}`
  const buffer = optimized.buffer
  const contentType = optimized.contentType
  const supabase = createAdminClient()

  await ensureInviteMediaBucket()

  let { error } = await supabase.storage
    .from(INVITE_MEDIA_BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: false,
      cacheControl: '31536000',
    })

  if (error?.message?.toLowerCase().includes('bucket not found')) {
    bucketReady = null
    await ensureInviteMediaBucket()
    ;({ error } = await supabase.storage.from(INVITE_MEDIA_BUCKET).upload(path, buffer, {
      contentType,
      upsert: false,
      cacheControl: '31536000',
    }))
  }

  if (error) {
    throw new Error(error.message || 'Upload failed')
  }

  const { data } = supabase.storage.from(INVITE_MEDIA_BUCKET).getPublicUrl(path)

  return {
    id,
    path,
    url: data.publicUrl,
  }
}

export async function deleteInviteImage(path: string) {
  await ensureInviteMediaBucket()
  const supabase = createAdminClient()
  const { error } = await supabase.storage.from(INVITE_MEDIA_BUCKET).remove([path])
  if (error) throw new Error(error.message || 'Delete failed')
}

export async function getProjectGallery(projectId: string): Promise<MediaItem[]> {
  return listFolderMedia(projectGalleryFolder(projectId))
}

export async function getGuestMoments(guestId: string, projectId: string): Promise<MediaItem[]> {
  return listFolderMedia(guestMomentsFolder(projectId, guestId))
}

/** Count image files in a folder without building public URLs. */
export async function countFolderMedia(folder: string): Promise<number> {
  await ensureInviteMediaBucket()
  const supabase = createAdminClient()
  const { data, error } = await supabase.storage.from(INVITE_MEDIA_BUCKET).list(folder, {
    limit: 100,
  })

  if (error) {
    if (/not found|does not exist/i.test(error.message)) return 0
    throw new Error(error.message)
  }

  return (data ?? []).filter((f) => !!f.name && /\.(jpe?g|png|webp|gif)$/i.test(f.name)).length
}

/** Parallel moments counts for a project's guest list (used by admin UI badges). */
export async function getGuestMomentsCounts(
  projectId: string,
  guestIds: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  await Promise.all(
    guestIds.map(async (guestId) => {
      try {
        counts[guestId] = await countFolderMedia(guestMomentsFolder(projectId, guestId))
      } catch {
        counts[guestId] = 0
      }
    }),
  )
  return counts
}
