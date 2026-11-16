'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { LandingContainer, ThinDivider } from './section'
import { LandingButton } from './landing-button'
import { CREATE_HREF } from './constants'

function FloatingParticles() {
  const reduce = useReducedMotion()
  if (reduce) return null

  const dots = [
    { left: '12%', top: '22%', size: 3, delay: 0 },
    { left: '78%', top: '18%', size: 2, delay: 1.2 },
    { left: '22%', top: '68%', size: 2.5, delay: 0.6 },
    { left: '86%', top: '62%', size: 3, delay: 1.8 },
    { left: '48%', top: '28%', size: 2, delay: 0.3 },
    { left: '64%', top: '76%', size: 2.5, delay: 2.1 },
    { left: '8%', top: '48%', size: 2, delay: 1.5 },
    { left: '92%', top: '38%', size: 2, delay: 0.9 },
  ]

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[color:var(--landing-gold)]/35"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
          animate={{ y: [0, -18, 0], opacity: [0.25, 0.7, 0.25] }}
          transition={{ duration: 7 + i * 0.4, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export function LandingHero() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const lightY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40])

  return (
    <section
      id="home"
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 50% at 50% 12%, rgba(250,248,243,0.9) 0%, transparent 58%), linear-gradient(180deg, var(--landing-ivory) 0%, var(--landing-beige) 45%, color-mix(in srgb, var(--landing-champagne) 70%, var(--landing-beige)) 100%)',
        }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 size-[28rem] rounded-full blur-3xl"
        style={{
          y: lightY,
          background: 'radial-gradient(circle, color-mix(in srgb, var(--landing-gold) 22%, transparent), transparent 70%)',
        }}
        animate={reduce ? undefined : { opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-10 size-[22rem] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--landing-champagne) 80%, transparent), transparent 70%)',
        }}
        animate={reduce ? undefined : { opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <FloatingParticles />

      <LandingContainer className="relative z-10 flex min-h-[calc(100svh-7rem)] flex-col justify-center pb-20">
        <motion.div
          style={{ y: reduce ? 0 : contentY }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.p
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.36em] text-[color:var(--landing-gold-dark)]"
          >
            Premium Digital Invitations
          </motion.p>

          <motion.h1
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 font-serif text-4xl font-light leading-[1.12] tracking-tight text-[color:var(--landing-ink)] sm:text-5xl md:text-6xl lg:text-[4.25rem]"
          >
            Create unforgettable digital invitations
            <span className="block italic text-[color:var(--landing-gold-dark)]">
              for every celebration.
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.28 }}
            className="mt-8"
          >
            <ThinDivider />
          </motion.div>

          <motion.p
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-xl font-sans text-base font-light leading-relaxed text-[color:var(--landing-muted)] sm:text-lg"
          >
            Create elegant invitations for weddings, engagements, receptions, birthdays,
            housewarming ceremonies and more.
          </motion.p>

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <LandingButton href={CREATE_HREF}>Start Creating</LandingButton>
            <LandingButton href="#templates" variant="secondary">
              Explore Templates
            </LandingButton>
          </motion.div>
        </motion.div>

        <motion.a
          href="#features"
          aria-label="Scroll to features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="absolute bottom-2 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[color:var(--landing-muted)]"
        >
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.28em]">Scroll</span>
          <motion.span
            animate={reduce ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="size-4 text-[color:var(--landing-gold)]" />
          </motion.span>
        </motion.a>
      </LandingContainer>
    </section>
  )
}
