'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useMobileMotion } from './use-mobile-motion'

/** Decorative gold flourish used between section titles and content. */
export function Ornament({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={`flex items-center justify-center gap-2.5 ${className}`}
      aria-hidden="true"
      initial={reduce ? false : { opacity: 0, scaleX: 0.6 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/55 sm:w-12" />
      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" className="text-gold">
        <path
          d="M1 5c2.5-3.5 5-3.5 8 0 3-3.5 5.5-3.5 8 0"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx="9" cy="5" r="1.4" fill="currentColor" opacity="0.85" />
      </svg>
      <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/55 sm:w-12" />
    </motion.div>
  )
}

/** Soft floating sparkles for atmospheric depth. */
export function Sparkles({ count = 10 }: { count?: number }) {
  const reduce = useReducedMotion()
  const mobile = useMobileMotion()
  if (reduce) return null

  const resolvedCount = mobile ? Math.min(count, 4) : count
  const dots = Array.from({ length: resolvedCount }).map((_, i) => {
    const r = (n: number) => {
      const x = Math.sin((i + 1) * n) * 10000
      return x - Math.floor(x)
    }
    return {
      left: `${Math.round(r(12.1) * 1000) / 10}%`,
      top: `${Math.round(r(45.7) * 1000) / 10}%`,
      size: 2 + Math.round(r(78.2) * 3),
      delay: `${Math.round(r(4.1) * 40) / 10}s`,
      duration: `${Math.round((2.4 + r(9.3) * 2.8) * 10) / 10}s`,
    }
  })

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full bg-gold"
          style={
            {
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              animationDelay: d.delay,
              '--twinkle-duration': d.duration,
              boxShadow: '0 0 8px color-mix(in oklab, var(--gold) 55%, transparent)',
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

/** Soft drifting gold glows behind the invitation column. */
export function AmbientGlow() {
  const reduce = useReducedMotion()
  const mobile = useMobileMotion()
  // Mobile / reduced-motion: static soft wash (no blur animation / fewer layers).
  const drift = !reduce && !mobile ? 'animate-glow-drift' : ''

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className={`${drift} absolute -left-[15%] top-[8%] h-[34vh] w-[34vh] rounded-full opacity-55 blur-xl sm:h-[42vh] sm:w-[42vh] sm:opacity-70 sm:blur-3xl`}
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--gold-soft) 55%, transparent), transparent 70%)',
        }}
      />
      <div
        className={`${drift} absolute -right-[18%] top-[38%] h-[36vh] w-[36vh] rounded-full opacity-45 blur-xl sm:h-[48vh] sm:w-[48vh] sm:opacity-60 sm:blur-3xl`}
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--gold) 35%, transparent), transparent 72%)',
          animationDelay: mobile || reduce ? undefined : '-5s',
        }}
      />
      {!mobile && !reduce ? (
        <div
          className="animate-glow-drift absolute bottom-[5%] left-[20%] h-[28vh] w-[28vh] rounded-full opacity-40 blur-2xl sm:h-[36vh] sm:w-[36vh] sm:opacity-50 sm:blur-3xl"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklab, var(--gold-soft) 40%, white), transparent 70%)',
            animationDelay: '-9s',
          }}
        />
      ) : null}
    </div>
  )
}
