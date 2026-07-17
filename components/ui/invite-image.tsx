'use client'

import Image, { type ImageProps } from 'next/image'

/** Invite layout is capped at 540px — serve 2× for retina. */
export const INVITE_IMAGE_SIZES = '(max-width: 540px) 100vw, 540px'

type InviteImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string
  alt: string
}

function isOptimizableSrc(src: string) {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return false
  return true
}

/** Optimized invite photo — next/image with sensible defaults for the 540px sheet. */
export function InviteImage({
  src,
  alt,
  sizes = INVITE_IMAGE_SIZES,
  quality = 82,
  className,
  fill,
  ...rest
}: InviteImageProps) {
  const resolved = src || '/placeholder.svg'

  if (!isOptimizableSrc(resolved)) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={resolved}
        alt={alt}
        className={className}
        decoding="async"
        loading={rest.priority ? 'eager' : 'lazy'}
      />
    )
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
      {...rest}
    />
  )
}
