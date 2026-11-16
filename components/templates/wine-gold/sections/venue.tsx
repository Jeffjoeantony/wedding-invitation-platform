'use client'

import Image from 'next/image'
import { MapPin, Navigation } from 'lucide-react'
import type { WineGoldData } from '../sample-data'
import { WG } from '../tokens'

const SERIF = 'var(--font-invite-serif), Georgia, serif'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

export function VenueSection({ data }: { data: WineGoldData }) {
  const { venue } = data
  // Embed by place name/address — short goo.gl links open via the buttons below
  const mapEmbedSrc =
    venue.mapEmbedUrl ??
    `https://maps.google.com/maps?q=${encodeURIComponent(venue.name || venue.address)}&z=15&output=embed`

  return (
    <section
      className="relative overflow-hidden px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-12"
      style={{ background: WG.champagne }}
    >
      <p
        className="text-center text-[0.58rem] font-semibold uppercase tracking-[0.32em]"
        style={{ color: WG.burgundy, fontFamily: SANS }}
      >
        {venue.eyebrow}
      </p>
      <h2
        className="mx-auto mt-3 max-w-[18ch] text-center text-[clamp(1.55rem,5.5vw,2rem)] font-light leading-[1.25]"
        style={{ color: WG.ink, fontFamily: SERIF }}
      >
        {venue.headline}
      </h2>

      <div
        className="mx-auto mt-7 max-w-md overflow-hidden rounded-[1.15rem] border px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5"
        style={{
          background: WG.wine,
          borderColor: 'rgba(255,249,240,0.22)',
          boxShadow: WG.shadow,
        }}
      >
        <div
          className="relative aspect-[16/11] overflow-hidden rounded-xl border"
          style={{ borderColor: 'rgba(255,249,240,0.35)' }}
        >
          <Image
            src={venue.image}
            alt={venue.name}
            fill
            sizes="(max-width: 768px) 90vw, 480px"
            className="object-cover"
          />
        </div>

        <h3
          className="mt-5 text-left text-[clamp(1.55rem,5vw,1.9rem)] font-light"
          style={{ color: WG.onDark, fontFamily: SERIF }}
        >
          {venue.name}
        </h3>
        <p
          className="mt-2 text-left text-[0.78rem] font-light leading-relaxed"
          style={{ color: 'rgba(255,249,240,0.72)', fontFamily: SANS }}
        >
          {venue.address}
        </p>

        <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
          <a
            href={venue.detailsUrl || venue.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-start gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] transition hover:opacity-85"
            style={{ color: WG.onDark, fontFamily: SANS }}
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: WG.gold }} aria-hidden />
            More about the location
          </a>
          <a
            href={venue.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-start gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] transition hover:opacity-85"
            style={{ color: WG.onDark, fontFamily: SANS }}
          >
            <Navigation className="h-3.5 w-3.5 shrink-0" style={{ color: WG.gold }} aria-hidden />
            How to get there
          </a>
        </div>

        <div
          className="relative mt-5 overflow-hidden rounded-xl border"
          style={{ borderColor: 'rgba(255,249,240,0.28)', aspectRatio: '16 / 10' }}
        >
          <iframe
            title={`${venue.name} map`}
            src={mapEmbedSrc}
            className="absolute inset-0 h-full w-full border-0 grayscale-[0.15]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}
