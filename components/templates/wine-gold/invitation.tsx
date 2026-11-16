'use client'

import type { InvitationConfig } from '@/lib/invitation-config'
import { wineGoldFromInvitationConfig } from './from-invitation-config'
import { WINE_GOLD_SAMPLE, type WineGoldData } from './sample-data'
import { WG } from './tokens'
import { HeroSection } from './sections/hero'
import { GreetingSection } from './sections/greeting'
import { CountdownSection } from './sections/countdown'
import { StorySection } from './sections/story'
import { VenueSection } from './sections/venue'
import { EventsSection } from './sections/events'
import { DressCodeSection } from './sections/dress-code'
import { RsvpSection } from './sections/rsvp'
import { ContactSection } from './sections/contact'
import { FooterSection } from './sections/footer'

/** Mobile-first Wine Gold invitation — burgundy, champagne & ivory */
export function WineGoldInvitation({
  data,
  config,
  preview = true,
}: {
  /** Explicit template data (preview sample or pre-mapped) */
  data?: WineGoldData
  /**
   * Live project/invite settings. When provided, venue, maps, couple, date,
   * and events are taken from project edits instead of sample defaults.
   */
  config?: InvitationConfig
  preview?: boolean
}) {
  const resolved =
    data ?? (config ? wineGoldFromInvitationConfig(config) : WINE_GOLD_SAMPLE)

  return (
    <article
      className="wine-gold-invite relative mx-auto w-full max-w-[390px] overflow-x-hidden md:max-w-[560px] lg:max-w-[680px]"
      style={{
        background: WG.champagne,
        color: WG.ink,
        minHeight: preview ? undefined : '100dvh',
      }}
    >
      {preview ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 py-2 text-center text-[0.55rem] font-medium uppercase tracking-[0.22em]"
          style={{
            background: 'linear-gradient(180deg, rgba(53,18,27,0.92) 0%, rgba(53,18,27,0.55) 70%, transparent 100%)',
            color: WG.onDark,
            fontFamily: 'var(--font-invite-sans), system-ui, sans-serif',
          }}
        >
          Sample preview · Wine Gold
        </div>
      ) : null}

      <HeroSection data={resolved} />

      {/* Second section: greeting + countdown */}
      <section
        className="relative overflow-hidden pb-8 sm:pb-10"
        style={{ background: WG.champagne }}
      >
        <GreetingSection data={resolved} />
        <CountdownSection data={resolved} />
      </section>

      {/* Story photo — after countdown */}
      <StorySection data={resolved} />

      {/* Venue — after story, before program (live: from project settings) */}
      <VenueSection data={resolved} />

      <EventsSection data={resolved} />
      <DressCodeSection data={resolved} />
      <RsvpSection data={resolved} preview={preview} />
      <ContactSection data={resolved} />
      <FooterSection data={resolved} />
    </article>
  )
}
