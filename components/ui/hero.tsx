'use client'

import type { InvitationConfig } from '@/lib/invitation-config'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles } from './ornament'

function HeroGreetingLine({ line }: { line: string }) {
  if (/^Dear\s+/i.test(line)) {
    const rest = line.replace(/^Dear\s+/i, '')
    return (
      <>
        Dear <span className="text-foreground">{rest}</span>
      </>
    )
  }
  return <span className="text-foreground">{line}</span>
}

function LetterReveal({
  text,
  className,
  gilded = false,
}: {
  text: string
  className?: string
  gilded?: boolean
}) {
  const reduce = useReducedMotion()
  if (reduce) {
    return <span className={`${className ?? ''} ${gilded ? 'text-gilded' : ''}`.trim()}>{text}</span>
  }
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className={`inline-block ${gilded ? 'text-gilded' : ''}`}
          initial={{ opacity: 0, y: '0.55em', rotateX: 40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.55 + i * 0.055, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
  )
}

const SCROLL_PARTICLES = [
  { x: -38, y: -22, size: 2.5, delay: 0 },
  { x: -22, y: -32, size: 2, delay: 0.04 },
  { x: -6, y: -36, size: 2.5, delay: 0.08 },
  { x: 10, y: -34, size: 2, delay: 0.06 },
  { x: 28, y: -26, size: 3, delay: 0.1 },
  { x: 40, y: -10, size: 2, delay: 0.14 },
  { x: -44, y: -2, size: 2, delay: 0.12 },
  { x: 36, y: 8, size: 2.5, delay: 0.16 },
  { x: -30, y: 12, size: 2, delay: 0.18 },
  { x: 20, y: 16, size: 2, delay: 0.2 },
  { x: 0, y: -42, size: 1.5, delay: 0.05 },
  { x: -16, y: 18, size: 1.5, delay: 0.22 },
  { x: 44, y: -20, size: 1.5, delay: 0.11 },
  { x: -34, y: -14, size: 1.5, delay: 0.09 },
] as const

function ScrollCue({
  active,
}: {
  active: boolean
}) {
  const reduce = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {active ? (
        <div
          key="scroll-cue-root"
          className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center sm:bottom-7"
        >
          <motion.a
            href="#invite-details"
            aria-label="Continue the invitation"
            className="pointer-events-auto relative flex flex-col items-center"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.28 } }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {!reduce
              ? SCROLL_PARTICLES.map((p, i) => (
                  <motion.span
                    key={i}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1 rounded-full bg-gold shadow-[0_0_7px_color-mix(in_oklab,var(--gold)_55%,transparent)]"
                    style={{ width: p.size, height: p.size, marginLeft: -p.size / 2 }}
                    initial={{ opacity: 0, x: p.x * 1.35, y: p.y * 1.2, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      x: [p.x * 1.35, p.x * 0.35, 0, 0],
                      y: [p.y * 1.2, p.y * 0.25, 0, -6],
                      scale: [0, 1.2, 0.85, 0],
                    }}
                    transition={{
                      duration: 1.55,
                      delay: p.delay,
                      times: [0, 0.35, 0.7, 1],
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                ))
              : null}

            <motion.span
              aria-hidden="true"
              className="relative flex flex-col items-center text-gold"
              style={{
                filter:
                  'drop-shadow(0 1px 1px color-mix(in oklab, var(--background) 92%, transparent)) drop-shadow(0 0 10px color-mix(in oklab, var(--background) 75%, transparent)) drop-shadow(0 0 6px color-mix(in oklab, var(--gold) 35%, transparent))',
              }}
              initial={reduce ? false : { opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.35, duration: 0.5 }}
            >
              <motion.span
                className="flex flex-col items-center"
                animate={reduce ? undefined : { y: [0, 5, 0] }}
                transition={
                  reduce
                    ? undefined
                    : { duration: 1.65, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }
                }
              >
                <ChevronDown className="h-5 w-5 opacity-55" strokeWidth={1.9} />
                <ChevronDown className="-mt-3 h-5 w-5 opacity-100" strokeWidth={1.9} />
              </motion.span>
            </motion.span>
          </motion.a>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

/** True once the guest has moved past the first screen (any viewport). */
function hasLeftFirstScreen() {
  const y = window.scrollY || document.documentElement.scrollTop || 0
  if (y >= 48) return true
  const target = document.getElementById('invite-details')
  if (target) {
    return target.getBoundingClientRect().top < window.innerHeight * 0.55
  }
  return false
}

export function Hero({
  config,
  showGreeting,
  inviteReady = true,
}: {
  config: InvitationConfig
  showGreeting: boolean
  /** Start the 4s idle timer only after the invite loader has finished. */
  inviteReady?: boolean
}) {
  const reduce = useReducedMotion()
  const monogram = `${config.couple1[0]}${config.couple2[0]}`
  const [showHint, setShowHint] = useState(false)
  /** Latched: once true, cue + lift never return (even if guest scrolls back up). */
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!inviteReady) return

    // Only ever set true — never clear when scrolling back to the top
    const onScroll = () => {
      if (hasLeftFirstScreen()) setDismissed(true)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    // Capture helps with Lenis / nested scroll on desktop
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })

    const timer = window.setTimeout(() => {
      if (hasLeftFirstScreen()) {
        setDismissed(true)
        return
      }
      setShowHint(true)
    }, 4000)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('scroll', onScroll, { capture: true })
      window.clearTimeout(timer)
    }
  }, [inviteReady])

  const hintActive = showHint && !dismissed

  return (
    <header className="relative flex min-h-[92svh] flex-col items-center justify-start overflow-x-hidden px-6 pb-8 pt-5 text-center max-sm:min-h-0 sm:justify-center sm:pb-16 sm:pt-14">
      <Sparkles count={6} />

      {/* Soft radial wash behind the composition */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,color-mix(in_oklab,var(--gold-soft)_32%,transparent),transparent_62%)]"
      />

      <motion.div
        className="relative z-[1] flex w-full flex-col items-center"
        animate={hintActive && !reduce ? { y: [0, -30, -6, -30, 0] } : { y: 0 }}
        transition={
          hintActive && !reduce
            ? {
                duration: 2.6,
                times: [0, 0.25, 0.5, 0.75, 1],
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 1.25,
              }
            : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <motion.div
          className="relative z-[1] flex flex-col items-center"
          initial={{ opacity: 0, y: 12 }}
        <div className="relative mb-3 flex h-16 w-16 items-center justify-center sm:mb-5">
          <span
            aria-hidden="true"
            className="animate-spin-slow absolute inset-0 rounded-full border border-dashed border-gold/45"
          />
          <span
            aria-hidden="true"
            className="absolute inset-1.5 rounded-full border border-gold/25"
          />
          <span className="font-serif text-lg tracking-[0.12em] text-gilded">{monogram}</span>
        </div>

        <motion.p
          className="font-sans text-[0.65rem] uppercase tracking-[0.42em] text-gold"
          initial={{ opacity: 0, letterSpacing: '0.55em' }}
          animate={{ opacity: 1, letterSpacing: '0.42em' }}
          transition={{ delay: 0.25, duration: 1.1 }}
        >
          Cordially invites you
        </motion.p>
      </motion.div>

      {showGreeting && config.heroGreeting ? (
        <motion.p
          className="relative z-[1] mt-3 font-serif text-2xl font-light italic text-foreground/80 sm:mt-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative mb-3 flex h-16 w-16 items-center justify-center sm:mb-5">
            <span
              aria-hidden="true"
              className="animate-spin-slow absolute inset-0 rounded-full border border-dashed border-gold/45"
            />
            <span
              aria-hidden="true"
              className="absolute inset-1.5 rounded-full border border-gold/25"
            />
            <span className="font-serif text-lg tracking-[0.12em] text-gilded">{monogram}</span>
          </div>

          <motion.p
            className="font-sans text-[0.65rem] uppercase tracking-[0.42em] text-gold"
            initial={{ opacity: 0, letterSpacing: '0.55em' }}
            animate={{ opacity: 1, letterSpacing: '0.42em' }}
            transition={{ delay: 0.25, duration: 1.1 }}
          >
            Cordially invites you
          </motion.p>
        </motion.div>

        {showGreeting && config.heroGreeting ? (
          <motion.p
            className="relative z-[1] mt-3 font-serif text-2xl font-light italic text-foreground/80 sm:mt-5"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroGreetingLine line={config.heroGreeting} />
          </motion.p>
        ) : null}

        <div className="relative z-[1] mt-5 w-full max-w-[300px] sm:mt-8">
          <motion.div
            aria-hidden="true"
            className="absolute -inset-3 rounded-t-[999px] rounded-b-xl border border-gold/20"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            aria-hidden="true"
            className="animate-float-soft absolute -left-5 top-16 h-10 w-10 rounded-full border border-gold/30 bg-gold-soft/20 blur-[0.5px]"
            style={{ '--float-duration': '7s', '--rot': '-8deg' } as React.CSSProperties}
          />
          <motion.div
            aria-hidden="true"
            className="animate-float-soft absolute -right-4 top-28 h-7 w-7 rounded-full border border-gold/35 bg-white/40"
            style={{ '--float-duration': '5.5s', '--rot': '12deg' } as React.CSSProperties}
          />

          <motion.div
            className="relative overflow-hidden rounded-t-[999px] rounded-b-md border border-gold/30 shadow-[0_40px_90px_-42px_rgba(60,45,25,0.6),0_0_0_1px_color-mix(in_oklab,var(--gold)_18%,transparent)]"
            style={{ aspectRatio: '3 / 4' }}
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={config.images.hero || '/placeholder.svg'}
              alt={`${config.couple1} and ${config.couple2} together`}
              className="animate-ken-burns h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-gold-soft/10" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15" />
          </motion.div>

          <motion.div
            className="relative z-10 -mt-[4.75rem] mx-3 rounded-xl border border-white/50 bg-white/85 px-5 py-5 shadow-[0_28px_70px_-30px_rgba(60,45,25,0.55)] sm:bg-white/70 sm:backdrop-blur-md"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.05, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
            />
            <h1 className="flex flex-col items-center leading-none text-foreground">
              <LetterReveal
                text={config.couple1}
                className="font-serif text-4xl font-semibold tracking-[0.12em]"
                gilded
              />
              <motion.span
                className="my-1 font-serif text-xl font-light italic text-gold"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.35, duration: 0.6 }}
              >
                &amp;
              </motion.span>
              <LetterReveal
                text={config.couple2}
                className="font-serif text-4xl font-semibold tracking-[0.04em]"
                gilded
              />
            </h1>
            <div className="mx-auto mt-3 h-px w-12 bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
            <p className="mt-3 font-sans text-[0.6rem] uppercase leading-[1.65] tracking-[0.18em] text-muted-foreground">
              {config.requestLine}
              <br />
              {config.atLine}
            </p>
          </motion.div>
        </div>
      </motion.div>

      <ScrollCue active={hintActive} />
    </header>
  )
}
