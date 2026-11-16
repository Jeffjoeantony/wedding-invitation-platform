'use client'

import Image from 'next/image'
import type { WineGoldData } from '../sample-data'
import { TornEdge } from '../torn-edge'
import { WG } from '../tokens'

const SERIF = 'var(--font-invite-serif), Georgia, serif'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

export function DressCodeSection({ data }: { data: WineGoldData }) {
  const { dressCode } = data

  return (
    <section
      className="relative overflow-hidden px-6 pb-16 pt-28 text-center sm:px-8 sm:pb-20 sm:pt-32"
      style={{ background: WG.champagne, color: WG.ink }}
    >
      {/* Top-left floral — flush to frame corner */}
      <div className="pointer-events-none absolute left-0 top-0 z-[1] h-56 w-56 sm:h-72 sm:w-72 md:h-80 md:w-80">
        <Image
          src={dressCode.floralSide}
          alt=""
          fill
          sizes="(max-width: 640px) 224px, (max-width: 768px) 288px, 320px"
          className="object-contain object-left-top"
          aria-hidden
        />
      </div>

      {/* Top-right floral — mirrored, flush to frame corner */}
      <div className="pointer-events-none absolute right-0 top-0 z-[1] h-56 w-56 sm:h-72 sm:w-72 md:h-80 md:w-80">
        <Image
          src={dressCode.floralSide}
          alt=""
          fill
          sizes="(max-width: 640px) 224px, (max-width: 768px) 288px, 320px"
          className="origin-top-right -scale-x-100 object-contain object-left-top"
          aria-hidden
        />
      </div>

      <div className="relative z-[2]">
        <p
          className="text-[0.62rem] font-semibold uppercase tracking-[0.32em]"
          style={{ color: WG.burgundySoft, fontFamily: SANS }}
        >
          {dressCode.eyebrow}
        </p>
        <h3
          className="mt-3 text-[clamp(1.55rem,6.5vw,1.95rem)] font-light leading-snug"
          style={{ color: WG.ink, fontFamily: SERIF }}
        >
          {dressCode.title}
        </h3>
        <p
          className="mx-auto mt-4 max-w-[34ch] text-[0.82rem] font-light leading-relaxed"
          style={{ color: WG.muted, fontFamily: SANS }}
        >
          {dressCode.body}
        </p>

        <ul
          className="mx-auto mt-8 flex items-center justify-center gap-3 sm:gap-3.5"
          aria-label="Color palette"
        >
          {dressCode.palette.map((swatch) => (
            <li key={swatch}>
              <span
                className="block h-9 w-9 rounded-full border sm:h-10 sm:w-10"
                style={{
                  background: swatch,
                  borderColor: 'rgba(53,37,42,0.12)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)',
                }}
              />
            </li>
          ))}
        </ul>

        <div className="relative mx-auto mt-8 aspect-[2752/1536] w-full max-w-md overflow-hidden">
          <Image
            src={dressCode.attire}
            alt="Dress code attire inspiration"
            fill
            sizes="(max-width: 768px) 90vw, 448px"
            className="object-contain object-center"
          />
        </div>

        <p
          className="mx-auto mt-8 max-w-[32ch] text-[0.78rem] font-light leading-relaxed"
          style={{ color: WG.muted, fontFamily: SANS }}
        >
          {dressCode.note}
        </p>
      </div>

      <TornEdge fill={WG.redwine} placement="bottom" />
    </section>
  )
}
