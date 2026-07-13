'use client'

import type { InvitationConfig } from '@/lib/invitation-config'
import { useCallback, useState } from 'react'
import { Countdown } from './countdown'
import { Footer } from './footer'
import { FullBleedPhoto } from './full-bleed-photo'
import { Hearts } from './hearts'
import { Hero } from './hero'
import { Loader } from './loader'
import { AmbientGlow } from './ornament'
import { RsvpPanel } from './rsvp-panel'
import { StoryBento } from './story-bento'
import { useMobileMotion } from './use-mobile-motion'

// `openInvite` = public open link: hide personalized greeting.
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

  return (
    <>
      <Loader onDone={onLoaderDone} />
      <AmbientGlow />
      <Hearts count={mobile ? 7 : 12} />
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

        <FullBleedPhoto
          src={config.images.accent}
          alt={`${config.couple1} and ${config.couple2} at golden hour`}
        />

        <StoryBento config={config} />

        <FullBleedPhoto
          src={config.images.portrait}
          alt={`Portrait of ${config.couple1} and ${config.couple2}`}
          caption="&ldquo;And so the adventure begins.&rdquo;"
          grayscale
        />

        <Countdown dateISO={config.dateISO} />

        <RsvpPanel config={config} />

        <Footer config={config} />
      </main>
    </>
  )
}
