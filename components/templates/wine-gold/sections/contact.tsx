'use client'

import type { WineGoldData } from '../sample-data'
import { WG } from '../tokens'

const SERIF = 'var(--font-invite-serif), Georgia, serif'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

export function ContactSection({ data }: { data: WineGoldData }) {
  const { couple, contact } = data
  const initials = `${couple.first.charAt(0)}&${couple.second.charAt(0)}`.toUpperCase()
  const phoneHref = `tel:${contact.phone.replace(/[^\d+]/g, '')}`

  return (
    <section
      className="relative overflow-hidden px-7 pb-14 pt-12 text-center sm:px-10 sm:pb-16 sm:pt-14"
      style={{ background: WG.champagne, color: WG.ink }}
    >
      <div className="relative mx-auto w-full max-w-md">
        <p
          className="text-[0.62rem] font-semibold uppercase tracking-[0.3em]"
          style={{ color: WG.burgundy, fontFamily: SANS }}
        >
          {contact.eyebrow}
        </p>

        <h3
          className="mx-auto mt-5 max-w-[16ch] text-[clamp(1.55rem,6.5vw,1.95rem)] font-light leading-[1.25]"
          style={{ color: WG.ink, fontFamily: SERIF }}
        >
          {contact.message}
        </h3>

        <div
          className="relative mx-auto mt-10 w-full rounded-sm px-8 pb-8 pt-8"
          style={{
            background: WG.paper,
            border: `1px solid ${WG.border}`,
            boxShadow: WG.shadow,
          }}
        >
          <div
            className="mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full"
            style={{ background: WG.burgundyDeep }}
            aria-hidden
          >
            <span
              className="text-[1.25rem] font-light tracking-[0.04em]"
              style={{ color: WG.goldSoft, fontFamily: SERIF }}
            >
              {initials}
            </span>
          </div>

          <p
            className="mt-6 text-[1.4rem] font-light leading-snug"
            style={{ color: WG.burgundy, fontFamily: SERIF }}
          >
            {contact.name}
          </p>
          <p
            className="mt-2 text-[0.58rem] font-semibold uppercase tracking-[0.26em]"
            style={{ color: WG.burgundySoft, fontFamily: SANS }}
          >
            {contact.role}
          </p>

          <div
            className="mx-auto mt-5 h-px w-[4.5rem]"
            style={{ background: WG.border }}
            aria-hidden
          />

          <a
            href={phoneHref}
            className="mt-5 inline-block text-[1.2rem] font-light tracking-[0.04em] transition hover:opacity-80"
            style={{ color: WG.ink, fontFamily: SERIF }}
          >
            {contact.phone}
          </a>
        </div>
      </div>
    </section>
  )
}
