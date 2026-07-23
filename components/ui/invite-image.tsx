'use client'

import { cn } from '@/lib/utils'

type InviteImageProps = {
  src: string
  alt: string
  className?: string
  /** LCP / above-the-fold — fetch eagerly with high priority. */
  priority?: boolean
  draggable?: boolean
}

/**
 * Invite media helper. Uses plain `<img>` (not next/image) so remote
 * Supabase URLs stay stable on Vercel, while still setting the fetch /
 * decode hints that make first paint and scroll smoother.
 */
export function InviteImage({
  src,
  alt,
  className,
  priority = false,
  draggable = false,
}: InviteImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote invite URLs; next/image historically broke guest moments on Vercel
    <img
      src={src || '/placeholder.svg'}
      alt={alt}
      className={cn(className)}
      draggable={draggable}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  )
}
