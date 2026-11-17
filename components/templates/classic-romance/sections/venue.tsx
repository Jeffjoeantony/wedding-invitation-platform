'use client'

import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { ClassicRomanceData } from '../sample-data'
import { HeartRule } from '../heart-rule'
import { CR } from '../tokens'

const SCRIPT = 'var(--font-invite-script), "Segoe Script", cursive'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

export function VenueSection({ data }: { data: ClassicRomanceData }) {
  const { venue, images } = data

  return (
    <section
      className="relative overflow-hidden px-7 pb-20 pt-16 text-center sm:px-10 sm:pb-24 sm:pt-20"
      style={{ background: CR.cream, color: CR.ink }}
    >

      <div className="relative z-[2]">
        <p
          className="text-[1.35rem] leading-none"
          style={{ color: CR.bronze, fontFamily: SCRIPT }}
        >
          {venue.script}
        </p>
        <h2
          className="mt-3 text-[clamp(1.55rem,6.5vw,1.95rem)] font-semibold uppercase tracking-[0.18em]"
          style={{ color: CR.burgundy, fontFamily: SANS }}
        >
          {venue.eyebrow}
        </h2>
        <div className="mt-5">
          <HeartRule />
        </div>

        <p
          className="mt-8 text-[1.15rem] font-semibold uppercase tracking-[0.12em]"
          style={{ color: CR.burgundy, fontFamily: SANS }}
        >
          {venue.name}
        </p>
        <p
          className="mx-auto mt-3 max-w-[28ch] text-[0.88rem] font-light uppercase leading-relaxed tracking-[0.06em]"
          style={{ color: CR.muted, fontFamily: SANS }}
        >
          {venue.address}
        </p>

        <a
          href={venue.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] transition hover:opacity-90"
          style={{ background: CR.burgundy, color: CR.onDark, fontFamily: SANS }}
        >
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {venue.mapsLabel}
        </a>
      </div>

      
      
    </section>
  )
}
