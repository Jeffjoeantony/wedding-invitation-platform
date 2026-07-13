'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useMobileMotion } from './use-mobile-motion'

/** Full-bleed photo with soft 1:1 scroll parallax (no spring lag on trackpads). */
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

  const yTravel = reduce ? 0 : mobile ? 24 : 40
  const scalePeak = reduce ? 1 : mobile ? 1.03 : 1.06

  const y = useTransform(scrollYProgress, [0, 1], [-yTravel, yTravel])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [scalePeak, 1, scalePeak])

  return (
    <section
      ref={ref}
      className="invite-section relative h-[70vh] w-full overflow-hidden sm:h-[78vh]"
    >
      <motion.img
        src={src || '/placeholder.svg'}
        alt={alt}
        style={{ y, scale }}
        decoding="async"
        loading="lazy"
        className={`absolute inset-0 h-[118%] w-full object-cover ${
          grayscale ? 'grayscale' : ''
        }`}
      />
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
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: mobile ? 0.7 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            aria-hidden="true"
            className="mx-auto mb-4 h-px w-14 bg-gradient-to-r from-transparent via-white/70 to-transparent"
          />
          <p className="font-serif text-2xl font-light italic text-white/95 [text-shadow:0_2px_22px_rgba(0,0,0,0.55)] sm:text-3xl">
            {caption}
          </p>
        </motion.div>
      )}
    </section>
  )
}
