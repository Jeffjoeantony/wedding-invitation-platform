'use client'

import { useEffect, useState } from 'react'
import type { WineGoldData } from '../sample-data'
import { WG } from '../tokens'

const SERIF = 'var(--font-invite-serif), Georgia, serif'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

function useCountdown(iso: string) {
  const calc = () => {
    const target = new Date(`${iso}T16:00:00`).getTime()
    const diff = Math.max(0, target - Date.now())
    const s = Math.floor(diff / 1000)
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
    }
  }
  const [tick, setTick] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTick(calc()), 1000)
    return () => clearInterval(id)
  }, [iso])
  return tick
}

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center px-5 py-10 sm:px-5 sm:py-9">
      <span
        className="text-[clamp(2.4rem,9vw,3.5rem)] font-light tabular-nums leading-none"
        style={{ color: WG.burgundy, fontFamily: SERIF }}
        suppressHydrationWarning
      >
        {String(value).padStart(2, '0')}
      </span>
      <span
        className="mt-3 text-[0.68rem] font-medium uppercase tracking-[0.22em]"
        style={{ color: WG.faint, fontFamily: SANS }}
      >
        {label}
      </span>
    </div>
  )
}

export function CountdownSection({ data }: { data: WineGoldData }) {
  const c = useCountdown(data.countdown.targetIso)

  return (
    <section className="relative px-5 py-8 sm:px-8 sm:py-10">
      <div
        className="mx-auto flex max-w-[28rem] items-stretch overflow-hidden rounded-2xl border bg-white"
        style={{
          borderColor: WG.border,
          boxShadow: WG.shadow,
          background: WG.card,
        }}
      >
        <Cell value={c.days} label="Days" />
        <div className="my-5 w-px self-stretch" style={{ background: WG.border }} aria-hidden />
        <Cell value={c.hours} label="Hours" />
        <div className="my-5 w-px self-stretch" style={{ background: WG.border }} aria-hidden />
        <Cell value={c.minutes} label="Minutes" />
      </div>
      <p
        className="mt-5 text-center text-[0.68rem] font-medium uppercase tracking-[0.28em]"
        style={{ color: WG.faint, fontFamily: SANS }}
      >
        {data.countdown.label}
      </p>
    </section>
  )
}
