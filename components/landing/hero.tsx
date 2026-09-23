'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react'
import { LandingContainer } from './section'
import { LandingButton } from './landing-button'
import { CREATE_HREF, HERO_IMAGE } from './constants'

export function LandingHero() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 70])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 36])

  return (
    <section
      id="home"
      ref={ref}
      className="relative flex h-[100svh] min-h-[100svh] items-center overflow-hidden"
    >
      <motion.div
        aria-hidden
        className="absolute inset-x-0 -top-16 -bottom-16"
        style={{ y: reduce ? 0 : bgY }}
      >
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-[72%_center] sm:object-[68%_center]"
        />
      </motion.div>

      {/* Left wash for readable flat text; ceremony stays vivid on the right */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(250,248,243,0.78) 0%, rgba(250,248,243,0.45) 30%, rgba(250,248,243,0.08) 54%, transparent 70%), linear-gradient(180deg, rgba(28,25,22,0.1) 0%, transparent 22%, rgba(28,25,22,0.2) 100%)',
        }}
      />

      {!reduce ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { left: '10%', top: '24%', delay: 0 },
            { left: '18%', top: '70%', delay: 1.1 },
            { left: '42%', top: '18%', delay: 0.5 },
            { left: '8%', top: '48%', delay: 1.6 },
          ].map((d, i) => (
            <motion.span
              key={i}
              className="absolute size-1.5 rounded-full bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.55)]"
              style={{ left: d.left, top: d.top }}
              animate={{ y: [0, -14, 0], opacity: [0.35, 0.9, 0.35] }}
              transition={{ duration: 6.5 + i * 0.4, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
            />
          ))}
        </div>
      ) : null}

      <LandingContainer className="relative z-10 w-full pb-10 pt-24 sm:pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
          <motion.div style={{ y: reduce ? 0 : contentY }} className="max-w-xl">
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5"
            >
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--landing-ink)] text-[color:var(--landing-gold-soft)] shadow-sm"
              >
                <Sparkles className="size-3.5" strokeWidth={2} />
              </span>
              <span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--landing-charcoal)]">
                ✦ Premium · Wedding Invitations
              </span>
            </motion.div>

            <motion.p
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 font-serif text-3xl font-light tracking-tight text-[color:var(--landing-ink)] sm:text-4xl"
            >
              Goldleaf
            </motion.p>

            <motion.h1
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 font-sans text-[2rem] font-bold leading-[1.05] tracking-[-0.03em] text-[color:var(--landing-ink)] sm:text-4xl md:text-[2.85rem] lg:text-[3.15rem]"
            >
              SHARE YOUR DAY
              <span className="block">BEAUTIFULLY</span>
            </motion.h1>

            <motion.p
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-md font-sans text-base font-normal leading-relaxed text-[color:var(--landing-charcoal)] sm:text-[1.05rem]"
            >
              From the first save-the-date to the final RSVP — craft invitations that feel like
              luxury stationery, then send them on WhatsApp, link, or QR.
            </motion.p>

            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
            >
              <LandingButton href={CREATE_HREF} className="gap-2.5">
                Create Invitation
                <Sparkles className="size-3.5" strokeWidth={2} />
              </LandingButton>
              <LandingButton href="#templates" variant="glass" className="gap-2">
                View Templates
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </LandingButton>
            </motion.div>
          </motion.div>

          <div className="pointer-events-none relative hidden min-h-[380px] lg:block" aria-hidden />
        </div>

        <motion.a
          href="#features"
          aria-label="Scroll to features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.8 }}
          className="absolute bottom-2 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[color:var(--landing-ink)]/70"
        >
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.28em]">Scroll</span>
          <motion.span
            animate={reduce ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="size-4" />
          </motion.span>
        </motion.a>
      </LandingContainer>
    </section>
  )
}
