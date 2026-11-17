'use client'

import Image from 'next/image'
import { Heart } from 'lucide-react'
import type { WineGoldData } from '../sample-data'
import { WG } from '../tokens'

const SERIF = 'var(--font-invite-serif), Georgia, serif'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'
const FOOTER_BG = '/landing/templates/wine-gold-events.png'

export function FooterSection({ data }: { data: WineGoldData }) {
  const { couple, eyebrow, date, footer, images } = data

  return (
    <footer
      className="relative overflow-hidden px-6 pb-14 pt-10 text-center sm:px-8 sm:pb-16 sm:pt-12"
      style={{ color: WG.onDark }}
    >
      <Image
        src={FOOTER_BG}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 560px, 680px"
        className="object-cover object-center"
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(45,9,14,0.35) 0%, rgba(45,9,14,0.2) 40%, rgba(45,9,14,0.45) 100%)',
        }}
        aria-hidden
      />

      {/* Couple photo */}
      <div className="relative z-[1] mx-auto aspect-video w-full max-w-md overflow-hidden">
        <Image
          src={images.footer}
          alt={`${couple.first} and ${couple.second}`}
          fill
          sizes="(max-width: 768px) 90vw, 480px"
          className="object-cover object-center"
        />
      </div>

      {/* Hero-matching details */}
      <div className="relative z-[1] mx-auto mt-9 flex max-w-sm flex-col items-center px-2">
        <p
          className="text-[0.58rem] font-medium uppercase tracking-[0.34em]"
          style={{ color: WG.goldSoft, fontFamily: SANS }}
        >
          {eyebrow}
        </p>

        <h2
          className="mt-4 max-w-[16ch] text-[clamp(1.85rem,8vw,2.45rem)] font-light leading-[1.12] tracking-[0.01em]"
          style={{ color: WG.card, fontFamily: SERIF }}
        >
          <span className="block">{couple.first}</span>
          <span
            className="my-1 block text-[0.8rem] font-normal lowercase tracking-[0.28em]"
            style={{ color: WG.goldSoft, fontFamily: SANS }}
          >
            {couple.joinWord}
          </span>
          <span className="block">{couple.second}</span>
        </h2>

        <div className="mt-6 flex w-full max-w-[15rem] items-center gap-3">
          <span
            className="h-px flex-1"
            style={{ background: `linear-gradient(90deg, transparent, ${WG.goldSoft})` }}
            aria-hidden
          />
          <p
            className="shrink-0 text-[0.95rem] font-light tracking-[0.2em]"
            style={{ color: WG.onDark, fontFamily: SERIF }}
          >
            {date.display}
          </p>
          <span
            className="h-px flex-1"
            style={{ background: `linear-gradient(90deg, ${WG.goldSoft}, transparent)` }}
            aria-hidden
          />
        </div>

        <Heart
          className="mt-4 h-3.5 w-3.5"
          style={{ color: WG.goldSoft }}
          fill="currentColor"
          strokeWidth={0}
          aria-hidden
        />

        <p
          className="mt-5 max-w-[28ch] text-[0.58rem] font-medium uppercase leading-relaxed tracking-[0.22em]"
          style={{ color: 'rgba(255,249,240,0.72)', fontFamily: SANS }}
        >
          {footer.tagline}
        </p>
      </div>
    </footer>
  )
}
