'use client'

import Image from 'next/image'
import type { WineGoldData } from '../sample-data'
import { WG } from '../tokens'

const SERIF = 'var(--font-invite-serif), Georgia, serif'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'
const EVENTS_BG = '/landing/templates/wine-gold-events.png'

export function EventsSection({ data }: { data: WineGoldData }) {
  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden">
      <Image
        src={EVENTS_BG}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 560px, 680px"
        className="object-cover object-center"
        aria-hidden
      />

      {/* Soft left wash so timeline stays readable over fabric & florals */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(45,9,14,0.55) 0%, rgba(45,9,14,0.28) 42%, rgba(45,9,14,0.08) 68%, transparent 100%)',
        }}
        aria-hidden
      />

      <div className="relative z-[1] flex flex-1 flex-col justify-center px-7 pb-28 pt-14 sm:px-10 sm:pb-32 sm:pt-16">
        <header className="max-w-[18rem] text-left">
          <p
            className="text-[0.68rem] font-semibold uppercase tracking-[0.34em]"
            style={{ color: WG.goldSoft, fontFamily: SANS }}
          >
            Program of the day
          </p>
          <h3
            className="mt-2 text-[clamp(2.45rem,10vw,3.1rem)] font-light leading-[1.05] tracking-[0.01em]"
            style={{ color: WG.onDark, fontFamily: SERIF }}
          >
            Evening
          </h3>
        </header>

        <ul className="relative mt-10 max-w-md">
          {/* Continuous timeline axis */}
          <span
            className="absolute bottom-3 top-3 w-px"
            style={{ left: '4.55rem', background: 'rgba(232,212,176,0.55)' }}
            aria-hidden
          />

          {data.events.map((event) => (
            <li
              key={event.id}
              className="relative grid grid-cols-[4rem_1.2rem_1fr] items-start gap-x-0 py-3.5 first:pt-0 last:pb-0"
            >
              <span
                className="pt-0.5 text-right text-[0.95rem] font-medium tabular-nums tracking-[0.04em]"
                style={{ color: WG.goldSoft, fontFamily: SANS }}
              >
                {event.time}
              </span>

              <span className="relative flex justify-center pt-[0.6rem]" aria-hidden>
                <span
                  className="block h-[0.45rem] w-[0.45rem] rounded-full"
                  style={{
                    background: WG.goldSoft,
                    boxShadow: '0 0 0 3px rgba(53,18,27,0.55)',
                  }}
                />
              </span>

              <div className="min-w-0 pl-2">
                <p
                  className="text-[1.2rem] font-light leading-snug"
                  style={{ color: WG.onDark, fontFamily: SERIF }}
                >
                  {event.title}
                </p>
                {event.detail ? (
                  <p
                    className="mt-1 text-[0.82rem] font-light leading-relaxed"
                    style={{ color: 'rgba(255,249,240,0.62)', fontFamily: SANS }}
                  >
                    {event.detail}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
