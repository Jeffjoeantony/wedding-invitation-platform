export type MediaItem = {
  id: string
  url: string
  path: string
  caption?: string
}

export const MAX_GALLERY_IMAGES = 8
export const MAX_GUEST_MOMENTS = 5
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export const INVITE_MEDIA_BUCKET = 'invite-media'

export function parseMediaList(raw: unknown): MediaItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item): item is MediaItem =>
      !!item &&
      typeof item === 'object' &&
      typeof (item as MediaItem).id === 'string' &&
      typeof (item as MediaItem).url === 'string' &&
      typeof (item as MediaItem).path === 'string',
    )
    .map((item) => ({
      id: item.id,
      url: item.url,
      path: item.path,
      caption: typeof item.caption === 'string' ? item.caption.slice(0, 120) : undefined,
    }))
}

export function extFromMime(mime: string) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  return 'jpg'
}

export function newMediaId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
}
