'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { InviteImage } from './invite-image'
import { useMobileMotion } from './use-mobile-motion'

const easeOut = [0.16, 1, 0.3, 1] as const

/** Full-bleed photo with soft parallax + scroll-linked fade (parallax off on mobile). */
export function FullBleedPhoto({
  src,
  alt,
  caption,
  grayscale = false,
}: {
  src: string
  alt: string
  caption?: string
  grayscale?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const mobile = useMobileMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Parallax transforms cause jank on mobile during smooth/native scroll — keep static.
  const yTravel = reduce || mobile ? 0 : 56
  const scalePeak = reduce || mobile ? 1 : 1.08

  const y = useTransform(scrollYProgress, [0, 1], [-yTravel, yTravel])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [scalePeak, 1, scalePeak])
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.82, 1],
    reduce || mobile ? [1, 1, 1, 1] : [0.55, 1, 1, 0.55],
  )
  const captionY = useTransform(
    scrollYProgress,
    [0.25, 0.5, 0.75],
    reduce || mobile ? [0, 0, 0] : [28, 0, -18],
  )
  const captionOpacity = useTransform(
    scrollYProgress,
    [0.28, 0.45, 0.72, 0.88],
    reduce || mobile ? [1, 1, 1, 1] : [0, 1, 1, 0],
  )

  return (
    <section
      ref={ref}
      className="invite-section relative h-[70vh] w-full overflow-hidden sm:h-[78vh]"
    >
      <motion.div style={{ opacity }} className="absolute inset-0">
        <motion.div
          style={mobile || reduce ? undefined : { y, scale }}
          className="absolute inset-0"
        >
          <InviteImage
            src={src || '/placeholder.svg'}
            alt={alt}
            fill
            sizes="100vw"
            loading="lazy"
            className={`object-cover ${grayscale ? 'grayscale' : ''}`}
          />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/20" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/70 to-transparent"
      />
      {caption && (
        <motion.div
          className="absolute inset-x-0 bottom-12 px-8 text-center"
          style={mobile || reduce ? undefined : { y: captionY, opacity: captionOpacity }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: mobile ? 0.8 : 1.1, ease: easeOut }}
        >
          <div
            aria-hidden="true"
            className="mx-auto mb-4 h-px w-14 origin-center bg-gradient-to-r from-transparent via-white/70 to-transparent"
          />
          <p className="font-serif text-2xl font-light italic text-white/95 [text-shadow:0_2px_22px_rgba(0,0,0,0.55)] sm:text-3xl">
            {caption}
          </p>
        </motion.div>
      )}
    </section>
  )
}
