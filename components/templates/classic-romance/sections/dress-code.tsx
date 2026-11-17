'use client'

import Image from 'next/image'
import { Gem } from 'lucide-react'
import type { ClassicRomanceData } from '../sample-data'
import { HeartRule } from '../heart-rule'
import { CR } from '../tokens'

const SCRIPT = 'var(--font-invite-script), "Segoe Script", cursive'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

export function DressCodeSection({ data }: { data: ClassicRomanceData }) {
  const { dressCode, images } = data

  return (
    <section
      className="relative overflow-hidden px-6 pb-16 pt-12 text-center sm:px-8 sm:pb-20 sm:pt-14"
      style={{ background: CR.cream, color: CR.ink }}
    >
      <p
        className="pointer-events-none absolute inset-x-0 top-10 text-center text-[clamp(2.8rem,14vw,4rem)] opacity-[0.12]"
        style={{ color: CR.burgundy, fontFamily: SCRIPT }}
        aria-hidden
      >
        dress code
      </p>

      <h2
        className="relative z-[1] text-[clamp(1.7rem,7vw,2.1rem)] font-semibold uppercase tracking-[0.2em]"
        style={{ color: CR.burgundy, fontFamily: SANS }}
      >
        {dressCode.title}
      </h2>
      <div className="relative z-[1] mt-4">
        <HeartRule />
      </div>

      <div
        className="relative z-[1] mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: CR.burgundy }}
        aria-hidden
      >
        <Gem className="h-6 w-6" style={{ color: CR.onDark }} />
      </div>

      <h3
        className="relative z-[1] mt-10 text-[0.95rem] font-semibold uppercase tracking-[0.2em]"
        style={{ color: CR.burgundy, fontFamily: SANS }}
      >
        {dressCode.colorsTitle}
      </h3>
      <p
        className="relative z-[1] mx-auto mt-4 max-w-[34ch] text-[0.88rem] font-light leading-relaxed"
        style={{ color: CR.muted, fontFamily: SANS }}
      >
        {dressCode.body}
      </p>

      <div className="relative z-[1] mx-auto mt-8 grid max-w-md grid-cols-2 gap-2.5">
        {dressCode.gallery.slice(0, 4).map((src, i) => (
          <div key={src + i} className="relative aspect-[4/5] overflow-hidden rounded-xl">
            <Image
              src={i === 0 ? images.dressGrid : src}
              alt=""
              fill
              sizes="200px"
              className="object-cover"
            />
          </div>
        ))}

        {/* Vertical palette strip */}
        <ul
          className="pointer-events-none absolute left-1/2 top-1/2 z-[2] flex -translate-x-1/2 -translate-y-1/2 flex-col gap-1.5"
          aria-label="Color palette"
        >
          {dressCode.palette.map((swatch) => (
            <li key={swatch}>
              <span
                className="block h-7 w-7 rounded-full border border-white/70 shadow-sm"
                style={{ background: swatch }}
              />
            </li>
          ))}
        </ul>
      </div>

      
    </section>
  )
}
