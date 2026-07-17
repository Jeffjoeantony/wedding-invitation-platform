'use client'

import type { InvitationConfig } from '@/lib/invitation-config'
import { motion, useReducedMotion } from 'framer-motion'
import { InviteImage } from './invite-image'
import { Sparkles } from './ornament'
import { useMobileMotion } from './use-mobile-motion'

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

export function Hero({
  config,
  showGreeting,
}: {
  config: InvitationConfig
  showGreeting: boolean
}) {
  const monogram = `${config.couple1[0]}${config.couple2[0]}`
  const mobile = useMobileMotion()

  return (
    <header className="relative flex min-h-[92svh] flex-col items-center justify-center overflow-x-hidden px-6 pb-16 pt-14 text-center">
      <Sparkles count={6} />

      {/* Soft radial wash behind the composition */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,color-mix(in_oklab,var(--gold-soft)_32%,transparent),transparent_62%)]"
      />

      <motion.div
        className="relative z-[1] flex flex-col items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative mb-5 flex h-16 w-16 items-center justify-center">
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
          className="relative z-[1] mt-5 font-serif text-2xl font-light italic text-foreground/80"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroGreetingLine line={config.heroGreeting} />
        </motion.p>
      ) : null}

      <div className="relative z-[1] mt-8 w-full max-w-[300px]">
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
          <InviteImage
            src={config.images.hero || '/placeholder.svg'}
            alt={`${config.couple1} and ${config.couple2} together`}
            fill
            priority
            sizes="(max-width: 540px) 100vw, 540px"
            className={`object-cover ${mobile ? '' : 'animate-ken-burns'}`}
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
              className="font-serif text-4xl font-light tracking-[0.04em]"
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
    </header>
  )
}
