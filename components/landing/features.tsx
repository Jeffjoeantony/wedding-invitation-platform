'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { DASHBOARD_SECTION } from './constants'
import { LandingContainer } from './section'

function RingsDivider() {
  return (
    <div className="mt-8 flex items-center justify-start gap-3" aria-hidden>
      <span className="h-px w-10 bg-[color:var(--landing-gold)]/70 sm:w-14" />
      <svg
        width="44"
        height="28"
        viewBox="0 0 44 28"
        fill="none"
        className="text-[color:var(--landing-gold)]"
      >
        <ellipse
          cx="16"
          cy="14"
          rx="11"
          ry="10"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <ellipse
          cx="28"
          cy="14"
          rx="11"
          ry="10"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <span className="h-px w-10 bg-[color:var(--landing-gold)]/70 sm:w-14" />
    </div>
  )
}

export function LandingFeatures() {
  const reduce = useReducedMotion()
  const copy = DASHBOARD_SECTION

  return (
    <section
      id="features"
      className="relative isolate flex h-[100svh] min-h-[100svh] max-h-[100svh] w-full items-center overflow-hidden"
    >
      <div aria-hidden className="absolute inset-0">
        <Image
          src={copy.background}
          alt=""
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Light left wash — keeps copy readable without dulling the set */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(250,248,243,0.42) 0%, rgba(250,248,243,0.16) 34%, transparent 58%)',
          }}
        />
      </div>

      <LandingContainer className="relative z-10 w-full py-20 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-12 xl:gap-16">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md"
          >
            <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--landing-gold-dark)]">
              <span className="block">Together</span>
              <span className="block">Forever</span>
            </p>
            <div className="mt-3 h-px w-10 bg-[color:var(--landing-gold)]" />

            <h2 className="mt-6 font-serif text-4xl font-bold leading-[1.12] tracking-tight text-[#4A1C22] sm:text-5xl md:text-[3.15rem]">
              Your real-time
              <span className="block">dashboard</span>
            </h2>

            <p className="mt-5 font-sans text-base font-normal leading-relaxed text-[color:var(--landing-charcoal)] sm:text-[1.05rem]">
              {copy.body}
            </p>

            <RingsDivider />

            <p className="mt-5 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--landing-muted)]">
              {copy.footnote}
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] shadow-[0_28px_60px_-28px_rgba(28,25,22,0.45)] ring-1 ring-black/5 sm:aspect-[5/6] lg:aspect-[4/5] xl:max-h-[min(78svh,720px)] xl:aspect-auto xl:h-[min(78svh,720px)]">
              <Image
                src={copy.preview}
                alt="Wedding planning dashboard with RSVP stats, schedule, and countdown"
                fill
                priority
                quality={100}
                sizes="(max-width: 1024px) 90vw, 52vw"
                className="object-cover object-top"
              />
            </div>
          </motion.div>
        </div>
      </LandingContainer>
    </section>
  )
}
