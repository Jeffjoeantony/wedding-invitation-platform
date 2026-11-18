'use client'

import Image from 'next/image'
import type { ClassicRomanceData } from '../sample-data'
import { CR } from '../tokens'
import '../fonts.css'

const SCRIPT = 'var(--font-invite-script), "Segoe Script", cursive'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

export function HeroSection({ data }: { data: ClassicRomanceData }) {
  const { couple, date, images } = data

  return (
    <section className="relative overflow-x-hidden" style={{ background: CR.burgundy }}>
      {/* Photo stage */}
      <div className="relative h-[100svh] min-h-[100svh] w-full overflow-hidden">
        <Image
          src={images.hero}
          alt={`${couple.first} and ${couple.second}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 680px"
          className="object-cover object-center"
        />

        {/* Corner florals — top right (same alignment on mobile + desktop) */}
        <div
          className="pointer-events-none absolute -right-32 -top-15 z-[1] w-[78%]"
          aria-hidden
        >
          <Image
            src={images.peonyCluster}
            alt=""
            width={4180}
            height={4268}
            className="h-auto w-full rotate-180"
          />
        </div>

        {/* Names on photo */}
        <div className="absolute inset-x-0 bottom-16 z-[2] pl-6 pr-12 text-right sm:bottom-20">
          <h1
            className="text-[clamp(4.0rem,12vw,3.6rem)] font-normal leading-[1.05]"
            style={{ color: CR.burgundy, fontFamily: SCRIPT }}
          >
            <span className="block">{couple.first}</span>
            <span className="mt-1 block text-[2.1rem] tracking-[0.2em]" style={{ fontFamily: SANS }}>
              {couple.joinWord}
            </span>
            <span className="block">{couple.second}</span>
          </h1>
        </div>
      </div>

      {/* Bottom-left floral — sits on the photo/date seam so it can spill into the date block */}
      <div
        className="pointer-events-none absolute left-2 top-[100svh] z-[3] w-full -translate-y-[78%] -translate-x-25"
        aria-hidden
      >
        <Image
          src={images.floralCornerWide}
          alt=""
          width={1312}
          height={1199}
          className="h-auto w-full origin-bottom-left object-contain object-left-bottom"
        />
      </div>

      {/* Date block — sizes track the invitation width, not the device font library */}
      <div className="classic-romance-date relative z-[1] flex h-[75svh] min-h-[75svh] flex-col items-center justify-center px-6 text-center">
        <p className="classic-romance-date__day" style={{ color: CR.onDark }}>
          {date.day}
        </p>
        <p className="classic-romance-date__month" style={{ color: CR.bronzeSoft }}>
          {date.month}
        </p>
        <p className="classic-romance-date__year" style={{ color: CR.onDark }}>
          {date.year}
        </p>
      </div>
    </section>
  )
}
