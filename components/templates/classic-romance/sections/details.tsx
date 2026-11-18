'use client'

import Image from 'next/image'
import type { ClassicRomanceData } from '../sample-data'
import { HeartRule } from '../heart-rule'
import { CR } from '../tokens'

const SCRIPT = 'var(--font-invite-script), "Segoe Script", cursive'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

export function DetailsSection({ data }: { data: ClassicRomanceData }) {
  const { details, images } = data

  return (
    <section className="relative overflow-hidden" style={{ background: CR.burgundy, color: CR.onDark }}>
      <div className="px-7 pb-12 pt-14 text-center sm:px-10 sm:pb-14 sm:pt-16">
        <p className="text-[1.25rem]" style={{ color: CR.bronzeSoft, fontFamily: SCRIPT }}>
          {details.script}
        </p>
        <h2
          className="mt-2 text-[clamp(1.45rem,6vw,1.85rem)] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: SANS }}
        >
          {details.title}
        </h2>
        <div className="mt-5">
          <HeartRule onDark />
        </div>

        <div className="mx-auto mt-10 max-w-sm space-y-8 text-center">
          <div>
            <h3 className="text-[0.95rem] font-semibold uppercase tracking-[0.16em]" style={{ fontFamily: SANS }}>
              {details.giftsTitle}
            </h3>
            <p className="mt-3 text-[0.88rem] font-light leading-relaxed" style={{ color: CR.onDarkSoft, fontFamily: SANS }}>
              {details.giftsBody}
            </p>
          </div>
          <div>
            <h3 className="text-[0.95rem] font-semibold uppercase tracking-[0.16em]" style={{ fontFamily: SANS }}>
              {details.flowersTitle}
            </h3>
            <p className="mt-3 text-[0.88rem] font-light leading-relaxed" style={{ color: CR.onDarkSoft, fontFamily: SANS }}>
              {details.flowersBody}
            </p>
          </div>
          <div>
            <h3 className="text-[0.95rem] font-semibold uppercase tracking-[0.16em]" style={{ fontFamily: SANS }}>
              {details.contactsTitle}
            </h3>
            <p className="mt-3 text-[0.88rem] font-light leading-relaxed" style={{ color: CR.onDarkSoft, fontFamily: SANS }}>
              {details.contactsBody}
            </p>
            <a
              href={details.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full px-8 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] transition hover:opacity-90"
              style={{ background: CR.cream, color: CR.burgundy, fontFamily: SANS }}
            >
              {details.telegramLabel}
            </a>
          </div>
        </div>
      </div>

      
    </section>
  )
}
