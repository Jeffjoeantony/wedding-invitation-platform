'use client'

import { Church, Heart, Music2, PartyPopper, Users, UtensilsCrossed } from 'lucide-react'
import type { ClassicRomanceData } from '../sample-data'
import { HeartRule } from '../heart-rule'
import { CR } from '../tokens'

const SERIF = 'var(--font-invite-serif), "Iowan Old Style", Palatino, serif'
const SCRIPT = 'var(--font-invite-script), "Segoe Script", cursive'

const ICONS = {
  gathering: Users,
  ceremony: Church,
  banquet: UtensilsCrossed,
  dance: Music2,
  entertainment: PartyPopper,
  conclusion: Heart,
} as const

export function ScheduleSection({ data }: { data: ClassicRomanceData }) {
  return (
    <section
      className="relative flex min-h-[75svh] flex-col justify-center overflow-hidden"
      style={{ background: CR.burgundy, color: CR.onDark }}
    >
      <div className="px-5 py-14 sm:px-8 sm:py-16">
        <ol className="mx-auto w-full max-w-md">
          {data.schedule.map((item, index) => {
            const Icon = ICONS[item.icon]
            const last = index === data.schedule.length - 1
            return (
              <li key={item.id} className="grid grid-cols-[4.25rem_1.75rem_minmax(0,1fr)] gap-x-2">
                <time
                  dateTime={item.time}
                  className="pt-0.5 text-right text-[1.35rem] leading-none"
                  style={{ fontFamily: SERIF, fontVariantNumeric: 'lining-nums tabular-nums' }}
                >
                  {item.time}
                </time>

                <div className="relative flex justify-center">
                  {last ? null : (
                    <span
                      className="absolute top-5 bottom-0 w-px"
                      style={{ background: 'rgba(246,239,228,0.55)' }}
                      aria-hidden
                    />
                  )}
                  <span
                    className="relative z-[1] mt-0.5 flex size-6 items-center justify-center rounded-full"
                    style={{ background: CR.burgundyDeep, color: CR.onDark }}
                  >
                    <Icon className="size-3.5" strokeWidth={1.6} aria-hidden />
                  </span>
                </div>

                <div className={last ? 'pb-0' : 'pb-7'}>
                  <p className="text-[1.55rem] leading-none" style={{ fontFamily: SERIF }}>
                    {item.title}
                  </p>
                  <p
                    className="mt-1.5 text-[0.95rem] font-light leading-snug"
                    style={{ color: CR.onDarkSoft, fontFamily: SERIF }}
                  >
                    {item.detail}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>

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
