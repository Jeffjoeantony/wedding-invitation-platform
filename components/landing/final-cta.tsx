'use client'

import { Reveal } from '@/components/ui/reveal'
import { LandingButton } from './landing-button'
import { LandingContainer } from './section'

export function LandingFinalCta() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <LandingContainer className="relative">
        <Reveal>
          <div className="landing-glass-panel relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-10 sm:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[color:var(--landing-gold-soft)]/35 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-white/50 blur-3xl"
            />
            <p className="relative font-sans text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--landing-gold-dark)]">
              Begin
            </p>
            <h2 className="relative mt-5 font-serif text-4xl font-light leading-tight text-[color:var(--landing-ink)] sm:text-5xl md:text-6xl">
              Begin your celebration{' '}
              <span className="italic text-[color:var(--landing-gold-dark)]">beautifully.</span>
            </h2>
            <p className="relative mx-auto mt-6 max-w-lg font-sans text-base font-light leading-relaxed text-[color:var(--landing-muted)] sm:text-lg">
              Craft a digital invitation that feels like opening luxury stationery — then share it
              with everyone you love.
            </p>
            <div className="relative mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <LandingButton href="/#popular">Choose a template</LandingButton>
              <LandingButton href="/#templates" variant="glass">
                View Templates
              </LandingButton>
            </div>
          </div>
        </Reveal>
      </LandingContainer>
    </section>
  )
}
