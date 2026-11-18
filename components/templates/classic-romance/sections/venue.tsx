'use client'

import { Gem } from 'lucide-react'
import type { ClassicRomanceData } from '../sample-data'
import { HeartRule } from '../heart-rule'
import { CR } from '../tokens'

const SCRIPT = 'var(--font-invite-script), "Segoe Script", cursive'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

const IVORY = '#F0E2D5'
const BURGUNDY = '#650817'
const ADDRESS = '#8C4E56'
const SCRIPT_TINT = 'rgba(186, 164, 150, 0.85)'
const BUTTON = '#2A1216'
const BUTTON_TEXT = '#F7F1EA'

function addressLines(address: string) {
  const comma = address.indexOf(',')
  if (comma === -1) return [address]
  return [address.slice(0, comma + 1).trim(), address.slice(comma + 1).trim()]
}

export function VenueSection({ data }: { data: ClassicRomanceData }) {
  const { venue } = data
  const lines = addressLines(venue.address)

  return (
    <section
      className="relative flex min-h-[75svh] flex-col items-center justify-center overflow-hidden px-7 py-16 text-center [container-type:inline-size] sm:px-10"
      style={{ background: IVORY, color: BURGUNDY }}
    >
      <div className="relative z-[2] flex flex-col items-center">
        <p
          className="text-[clamp(1.65rem,7cqi,2.15rem)] leading-none"
          style={{ color: SCRIPT_TINT, fontFamily: SCRIPT }}
        >
          {venue.script}
        </p>
        <h2
          className="-mt-1 max-w-[11ch] text-[clamp(1.85rem,8cqi,2.35rem)] font-semibold uppercase leading-[1.02] tracking-[0.03em]"
          style={{ color: BURGUNDY, fontFamily: SANS }}
        >
          {venue.eyebrow}
        </h2>
        <div className="mt-4 w-44">
          <HeartRule />
        </div>
        <div
          className="mt-8 flex size-16 items-center justify-center rounded-full"
          style={{ background: CR.burgundy }}
          aria-hidden
        >
          <Gem className="size-6" style={{ color: CR.onDark }} />
        </div>

        <p
          className="mt-8 text-[clamp(0.95rem,3.6cqi,1.15rem)] font-semibold uppercase tracking-[0.12em]"
          style={{ color: BURGUNDY, fontFamily: SANS }}
        >
          {venue.name}
        </p>
        <p
          className="mt-3 text-[0.72rem] font-medium uppercase leading-[1.55] tracking-[0.08em]"
          style={{ color: ADDRESS, fontFamily: SANS }}
        >
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
        <a
          href={venue.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center rounded-full px-5 py-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] transition hover:opacity-90"
          style={{ background: BUTTON, color: BUTTON_TEXT, fontFamily: SANS }}
        >
          {venue.mapsLabel}
        </a>
      </div>
    </section>
  )
}
