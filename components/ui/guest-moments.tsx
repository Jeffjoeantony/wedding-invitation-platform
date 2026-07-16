'use client'

import type { MediaItem } from '@/lib/invite-media'
import { PhotoCarousel } from './photo-carousel'

/** Personal "Moments with you" strip for guest-token invites. */
export function GuestMoments({
  guestName,
  moments,
}: {
  guestName: string
  moments: MediaItem[]
}) {
  if (!moments.length) return null

  const first = guestName?.split(' ')[0] || 'you'

  return (
    <PhotoCarousel
      images={moments}
      label="Moments with you"
      title={
        <>
          Shared <span className="italic text-gilded">memories</span>
        </>
      }
      subtitle={`Dear ${first}, a few favourite frames with you`}
    />
  )
}
