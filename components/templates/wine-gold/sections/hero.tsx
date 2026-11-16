'use client'

import Image from 'next/image'
import type { WineGoldData } from '../sample-data'
import { TornEdge } from '../torn-edge'
import { WG } from '../tokens'

const SERIF = 'var(--font-invite-serif), Georgia, serif'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

export function HeroSection({ data }: { data: WineGoldData }) {
  const { couple, eyebrow, date, images } = data

  return (
    <section className="relative w-full overflow-hidden">
      {/* Full first viewport — cream content starts only after scroll */}
      <div className="relative h-[100svh] w-full min-h-[100svh]">
        <Image
          src={images.hero}
          alt={`${couple.first} and ${couple.second}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 560px, 680px"
          className="object-cover object-[center_28%]"
        />

        {/* Wine wash from top — matches reference overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(53,18,27,0.72) 0%, rgba(66,18,31,0.35) 28%, rgba(53,18,27,0.08) 52%, rgba(53,18,27,0.55) 78%, rgba(53,18,27,0.88) 100%)',
          }}
        />

        <div className="absolute inset-x-0 bottom-0 z-[1] flex flex-col items-center px-6 pb-14 pt-20 text-center">
          <p
            className="text-[0.72rem] font-medium uppercase tracking-[0.38em]"
            style={{ color: WG.goldSoft, fontFamily: SANS }}
          >
            {eyebrow}
          </p>

          <h1
            className="mt-4 max-w-[14ch] text-[clamp(2.65rem,11vw,3.55rem)] font-light leading-[1.1] tracking-[0.01em]"
            style={{ color: WG.card, fontFamily: SERIF }}
          >
            <span className="block">{couple.first}</span>
            <span
              className="my-1.5 block text-[1rem] font-normal lowercase tracking-[0.28em]"
              style={{ color: WG.goldSoft, fontFamily: SANS }}
            >
              {couple.joinWord}
            </span>
            <span className="block">{couple.second}</span>
          </h1>

          <div
            className="mx-auto mt-5 h-px w-20"
            style={{ background: `linear-gradient(90deg, transparent, ${WG.gold}, transparent)` }}
            aria-hidden
          />

          <p
            className="mt-4 text-[1.15rem] font-light tracking-[0.18em]"
            style={{ color: WG.onDark, fontFamily: SERIF }}
          >
            {date.display}
          </p>
          <p
            className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.28em]"
            style={{ color: 'rgba(255,249,240,0.72)', fontFamily: SANS }}
          >
            {date.weekday} · {date.time}
          </p>
        </div>
      </div>

      <TornEdge fill={WG.champagne} />
    </section>
  )
}
