'use client'

import Image from 'next/image'
import type { ClassicRomanceData } from '../sample-data'
import { CR } from '../tokens'

const SERIF = 'var(--font-invite-serif), Georgia, serif'
const SCRIPT = 'var(--font-invite-script), "Segoe Script", cursive'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

export function HeroSection({ data }: { data: ClassicRomanceData }) {
  const { couple, date, images } = data

  return (
    <section className="relative overflow-hidden" style={{ background: CR.burgundyDeep }}>
      {/* Photo stage */}
      <div className="relative h-[75svh] min-h-[75svh] w-full overflow-hidden">
        <Image
          src={images.hero}
          alt={`${couple.first} and ${couple.second}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 680px"
          className="object-cover object-[center_22%]"
        />

        {/* Names on photo */}
        <div className="absolute inset-x-0 bottom-16 z-[2] px-6 text-center sm:bottom-20">
          <h1
            className="text-[clamp(2.6rem,12vw,3.6rem)] font-normal leading-[1.05]"
            style={{ color: CR.burgundy, fontFamily: SCRIPT }}
          >
            <span className="block">{couple.first}</span>
            <span className="mt-1 block text-[1.1rem] tracking-[0.2em]" style={{ fontFamily: SANS }}>
              {couple.joinWord}
            </span>
            <span className="block">{couple.second}</span>
          </h1>
        </div>
    
      </div>

      {/* Date block */}
      <div className="relative flex h-[75svh] min-h-[75svh] flex-col items-center justify-center px-6 text-center">
        <p
          className="text-[clamp(4.5rem,22vw,6.5rem)] font-light leading-none tracking-tight"
          style={{ color: CR.onDark, fontFamily: SERIF }}
        >
          {date.day}
        </p>
        <p
          className="-mt-4 text-[clamp(1.8rem,8vw,2.4rem)] leading-none"
          style={{ color: CR.bronzeSoft, fontFamily: SCRIPT }}
        >
          {date.month}
        </p>
        <p
          className="mt-3 text-[1.35rem] font-light tracking-[0.18em]"
          style={{ color: CR.onDark, fontFamily: SERIF }}
        >
          {date.year}
        </p>
      </div>
    </section>
  )
}
