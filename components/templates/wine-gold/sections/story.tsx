'use client'

import Image from 'next/image'
import type { WineGoldData } from '../sample-data'
import { TornEdge } from '../torn-edge'
import { WG } from '../tokens'

const SERIF = 'var(--font-invite-serif), Georgia, serif'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

/** Full-viewport story photo — cream tear at top, wine gradient + text + tear at bottom */
export function StorySection({ data }: { data: WineGoldData }) {
  const { story, images, couple } = data

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[100svh] w-full min-h-[100svh]">
        <Image
          src={images.story}
          alt={`${couple.first} and ${couple.second}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 560px, 680px"
          className="object-cover object-center"
          priority={false}
        />

        {/* Soft top fade into cream tear */}
        <div
          className="absolute inset-x-0 top-0 h-24"
          style={{
            background:
              'linear-gradient(180deg, rgba(248,243,235,0.55) 0%, transparent 100%)',
          }}
          aria-hidden
        />

        {/* Wine wash from bottom — same language as hero */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, transparent 42%, rgba(53,18,27,0.35) 62%, rgba(53,18,27,0.72) 82%, rgba(53,18,27,0.94) 100%)',
          }}
        />

        <div className="absolute inset-x-0 bottom-0 z-[1] flex flex-col items-center px-7 pb-16 pt-24 text-center sm:px-10 sm:pb-20">
          <h2
            className="max-w-[18ch] text-[clamp(1.65rem,6.5vw,2.35rem)] font-light leading-[1.2]"
            style={{ color: WG.onDark, fontFamily: SERIF }}
          >
            {story.title}
          </h2>
          <div
            className="mx-auto mt-4 h-px w-14"
            style={{ background: `linear-gradient(90deg, transparent, ${WG.gold}, transparent)` }}
            aria-hidden
          />
          <p
            className="mx-auto mt-4 max-w-[32ch] text-[0.88rem] font-light leading-[1.7]"
            style={{ color: 'rgba(255,249,240,0.88)', fontFamily: SANS }}
          >
            {story.body}
          </p>
        </div>
      </div>

      {/* Cream paper from previous section overlapping the photo top */}
      <TornEdge fill={WG.champagne} placement="top" />
      {/* Tear into the cream venue section below */}
      <TornEdge fill={WG.champagne} placement="bottom" />
    </section>
  )
}
