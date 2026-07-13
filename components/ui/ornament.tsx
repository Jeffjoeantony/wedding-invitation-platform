'use client'

import { motion, useReducedMotion } from 'framer-motion'

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
  if (reduce) return null

  const dots = Array.from({ length: count }).map((_, i) => {
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
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="animate-glow-drift absolute -left-[15%] top-[8%] h-[42vh] w-[42vh] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--gold-soft) 55%, transparent), transparent 70%)',
        }}
      />
      <div
        className="animate-glow-drift absolute -right-[18%] top-[38%] h-[48vh] w-[48vh] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--gold) 35%, transparent), transparent 72%)',
          animationDelay: '-5s',
        }}
      />
      <div
        className="animate-glow-drift absolute bottom-[5%] left-[20%] h-[36vh] w-[36vh] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--gold-soft) 40%, white), transparent 70%)',
          animationDelay: '-9s',
        }}
      />
    </div>
  )
}
