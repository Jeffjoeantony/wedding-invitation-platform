'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

/** Invite layout is capped at 540px — serve 2× for retina. */
export const INVITE_IMAGE_SIZES = '(max-width: 540px) 100vw, 540px'

type InviteImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string
  alt: string
}

function isRemoteSrc(src: string) {
  return /^https?:\/\//i.test(src)
}

/**
 * Invite photos are already WebP-compressed at upload.
 * Remote Supabase URLs skip the Vercel `/_next/image` proxy (plain img / unoptimized)
 * so a missing remotePattern or upstream 403 cannot blank the gallery on deploy.
 */
export function InviteImage({
  src,
  alt,
  sizes = INVITE_IMAGE_SIZES,
  quality = 82,
  className,
  fill,
  onError,
  ...rest
}: InviteImageProps) {
  const resolved = src || '/placeholder.svg'
  const remote = isRemoteSrc(resolved)
  const [useFallback, setUseFallback] = useState(
    () => resolved.startsWith('data:') || resolved.startsWith('blob:') || remote,
  )

  if (useFallback) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={resolved}
        alt={alt}
        className={className}
        decoding="async"
        loading={rest.priority ? 'eager' : 'lazy'}
        style={
          fill
            ? {
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }
            : undefined
        }
      />
    )
  }

  const handleError: NonNullable<ImageProps['onError']> = (e) => {
    setUseFallback(true)
    onError?.(e)
  }

  if (fill) {
    return (
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        className={className}
        onError={handleError}
        {...rest}
      />
    )
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      sizes={sizes}
      quality={quality}
      className={className}
      width={rest.width ?? 1080}
      height={rest.height ?? 1440}
      onError={handleError}
      {...rest}
    />
  )
}
