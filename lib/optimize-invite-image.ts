import sharp from 'sharp'

export const INVITE_UPLOAD_MAX_WIDTH = 1600
export const INVITE_UPLOAD_WEBP_QUALITY = 82

/** Resize + compress before Supabase upload — keeps invites fast on mobile. */
export async function optimizeInviteImageBuffer(
  buffer: Buffer,
  mime: string,
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  if (mime === 'image/gif') {
    const out = await sharp(buffer, { animated: true })
      .rotate()
      .resize({ width: INVITE_UPLOAD_MAX_WIDTH, withoutEnlargement: true })
      .gif()
      .toBuffer()
    return { buffer: out, contentType: 'image/gif', ext: 'gif' }
  }

  const out = await sharp(buffer)
    .rotate()
    .resize({
      width: INVITE_UPLOAD_MAX_WIDTH,
      height: INVITE_UPLOAD_MAX_WIDTH,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: INVITE_UPLOAD_WEBP_QUALITY, effort: 4 })
    .toBuffer()

  return { buffer: out, contentType: 'image/webp', ext: 'webp' }
}
