'use client'

import type { InvitationConfig } from '@/lib/invitation-config'
import { useCallback, useState } from 'react'
import { Countdown } from './countdown'
import { Footer } from './footer'
import { FullBleedPhoto } from './full-bleed-photo'
import { GuestMoments } from './guest-moments'
import { Hearts } from './hearts'
import { Hero } from './hero'
import { Loader } from './loader'
import { AmbientGlow } from './ornament'
import { PhotoCarousel } from './photo-carousel'
import { RsvpPanel } from './rsvp-panel'
import { SmoothScroll } from './smooth-scroll'
import { StoryBento } from './story-bento'
import { useMobileMotion } from './use-mobile-motion'

// `openInvite` = public open link: hide personalized greeting + guest moments.
export function Invitation({
  config,
  openInvite = false,
}: {
  config: InvitationConfig
  openInvite?: boolean
}) {
  const [ready, setReady] = useState(false)
  const mobile = useMobileMotion()
  const onLoaderDone = useCallback(() => setReady(true), [])
  const hasGallery = config.galleryImages.length > 0

  return (
    <SmoothScroll>
      <Loader onDone={onLoaderDone} />
      <AmbientGlow />
      <Hearts count={mobile ? 12 : 28} />
      <main
        className={`invite-sheet relative z-10 mx-auto min-h-screen w-full max-w-[540px] overflow-x-clip transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-gold-soft/25 via-transparent to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-px bg-gradient-to-b from-transparent via-gold/35 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-px bg-gradient-to-b from-transparent via-gold/35 to-transparent"
        />

        <Hero config={config} showGreeting={!openInvite} />

        {!openInvite && (
          <GuestMoments guestName={config.guestName} moments={config.guestMoments} />
        )}

        {hasGallery ? (
          <PhotoCarousel images={config.galleryImages} label="Gallery" />
        ) : (
          <FullBleedPhoto
            src={config.images.accent}
            alt={`${config.couple1} and ${config.couple2} at golden hour`}
          />
        )}

        <StoryBento config={config} />

        <FullBleedPhoto
          src={config.images.portrait}
          alt={`Portrait of ${config.couple1} and ${config.couple2}`}
          caption={
            config.eventTemplate === 'Engagement'
              ? '\u201CTwo hearts, one promise.\u201D'
              : '\u201CAnd so the adventure begins.\u201D'
          }
          grayscale
        />

        <Countdown dateISO={config.dateISO} label={config.countdownLabel} />

        <RsvpPanel config={config} />

        <Footer config={config} />
      </main>
    </SmoothScroll>
  )
}
