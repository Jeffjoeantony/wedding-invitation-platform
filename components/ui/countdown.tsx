'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Ornament } from './ornament'
import { Reveal } from './reveal'

function diff(target: number) {
  const total = Math.max(0, target - Date.now())
  const days = Math.floor(total / 86400000)
  const hours = Math.floor((total % 86400000) / 3600000)
  const minutes = Math.floor((total % 3600000) / 60000)
  const seconds = Math.floor((total % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

function FlipDigit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-[4.25rem] w-full items-center justify-center overflow-hidden rounded-xl border border-gold/25 bg-gradient-to-b from-white/80 to-gold-soft/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:h-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-px bg-gold/15"
        />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="absolute font-serif text-4xl font-light tabular-nums text-foreground sm:text-5xl"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            suppressHydrationWarning
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-3 font-sans text-[0.55rem] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

export function Countdown({ dateISO }: { dateISO: string }) {
  const target = new Date(dateISO).getTime()
  const [time, setTime] = useState(() => diff(target))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => setTime(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Min', value: time.minutes },
    { label: 'Sec', value: time.seconds },
  ]

  return (
    <section className="invite-section relative overflow-hidden px-6 py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,color-mix(in_oklab,var(--gold-soft)_28%,transparent),transparent_65%)]"
      />

      <Reveal direction="scale">
        <div className="relative mx-auto max-w-md overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/70 p-8 text-center shadow-[0_36px_80px_-40px_rgba(60,45,25,0.55)] backdrop-blur-sm sm:bg-white/50 sm:backdrop-blur-md">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/55 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 top-1/3 h-28 w-28 rounded-full bg-gold-soft/30 blur-3xl"
          />

          <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-gold">
            Counting down to forever
          </p>
          <div className="mt-4">
            <Ornament />
          </div>

          <div className="relative mt-8 grid grid-cols-4 gap-2.5 sm:gap-3">
            {units.map((u) => (
              <FlipDigit
                key={u.label}
                label={u.label}
                value={mounted ? String(u.value).padStart(2, '0') : '--'}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
