'use client'

import Image from 'next/image'
import { Cake, Sparkles, Heart, Music2 } from 'lucide-react'
import type { ClassicRomanceData } from '../sample-data'
import { HeartRule } from '../heart-rule'
import { CR } from '../tokens'

const SCRIPT = 'var(--font-invite-script), "Segoe Script", cursive'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

const ICONS = {
  cake: Cake,
  sparkles: Sparkles,
  rings: Heart,
  music: Music2,
} as const

export function ScheduleSection({ data }: { data: ClassicRomanceData }) {
  return (
    <section className="relative overflow-hidden" style={{ background: CR.burgundy, color: CR.onDark }}>
      <div className="px-8 pb-10 pt-14 sm:px-10 sm:pt-16">
        <ul className="mx-auto max-w-sm space-y-6">
          {data.schedule.map((item, index) => {
            const Icon = ICONS[item.icon]
            return (
              <li key={item.id} className="relative flex items-start gap-4">
                {index < data.schedule.length - 1 ? (
                  <span
                    className="absolute left-[1.15rem] top-10 h-[calc(100%+0.5rem)] w-px"
                    style={{ background: 'rgba(246,239,228,0.28)' }}
                    aria-hidden
                  />
                ) : null}
                <span
                  className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
                  style={{ borderColor: 'rgba(246,239,228,0.45)', background: CR.burgundyDeep }}
                >
                  <Icon className="h-4 w-4" style={{ color: CR.onDark }} aria-hidden />
                </span>
                <div className="pt-1.5">
                  <p className="text-[0.95rem] font-medium tracking-wide" style={{ fontFamily: SANS }}>
                    <span className="tabular-nums">{item.time}</span>
                    <span className="mx-2 opacity-50">·</span>
                    <span>{item.title}</span>
                  </p>
                </div>
              </li>
            )
          })}
        </ul>

        <p
          className="mx-auto mt-12 max-w-[16ch] text-center text-[clamp(1.85rem,8vw,2.35rem)] leading-[1.2]"
          style={{ color: CR.onDark, fontFamily: SCRIPT }}
        >
          {data.welcome}
        </p>
        <div className="mt-5">
          <HeartRule onDark />
        </div>
      </div>

      
    </section>
  )
}
