'use client'

import { CLASSIC_ROMANCE_SAMPLE, type ClassicRomanceData } from './sample-data'
import { CR } from './tokens'
import { HeroSection } from './sections/hero'
import { VenueSection } from './sections/venue'
import { ScheduleSection } from './sections/schedule'
import { DressCodeSection } from './sections/dress-code'
import { DetailsSection } from './sections/details'
import { RsvpSection } from './sections/rsvp'

/** Classic Romance — burgundy florals, cream paper, script names */
export function ClassicRomanceInvitation({
  data,
  preview = true,
}: {
  data?: ClassicRomanceData
  preview?: boolean
}) {
  const resolved = data ?? CLASSIC_ROMANCE_SAMPLE

  return (
    <article
      className="classic-romance-invite relative mx-auto w-full max-w-[390px] overflow-x-hidden md:max-w-[560px] lg:max-w-[680px]"
      style={{
        background: CR.cream,
        color: CR.ink,
        minHeight: preview ? undefined : '100dvh',
        borderRadius: preview ? '0 0 1.5rem 1.5rem' : undefined,
        boxShadow: preview ? CR.shadow : undefined,
      }}
    >
      {preview ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 py-2 text-center text-[0.55rem] font-medium uppercase tracking-[0.22em]"
          style={{
            background:
              'linear-gradient(180deg, rgba(61,10,16,0.88) 0%, rgba(61,10,16,0.45) 70%, transparent 100%)',
            color: CR.onDark,
            fontFamily: 'var(--font-invite-sans), system-ui, sans-serif',
          }}
        >
          Sample preview · Classic Romance
        </div>
      ) : null}

      <HeroSection data={resolved} />
      <VenueSection data={resolved} />
      <ScheduleSection data={resolved} />
      <DressCodeSection data={resolved} />
      <DetailsSection data={resolved} />
      <RsvpSection data={resolved} preview={preview} />
    </article>
  )
}
