'use client'

import { Reveal } from '@/components/ui/reveal'
import { LandingButton } from './landing-button'
import { CREATE_HREF } from './constants'
import { LandingContainer, ThinDivider } from './section'

export function LandingFinalCta() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 50%, color-mix(in srgb, var(--landing-gold-soft) 42%, transparent) 0%, transparent 62%), linear-gradient(180deg, color-mix(in srgb, var(--landing-champagne) 55%, var(--landing-beige)) 0%, var(--landing-ivory) 100%)',
        }}
      />

      <LandingContainer className="relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.36em] text-[color:var(--landing-gold-dark)]">
            Begin
          </p>
          <h2 className="mt-5 font-serif text-4xl font-light leading-tight text-[color:var(--landing-ink)] sm:text-5xl md:text-6xl">
            Begin your celebration{' '}
            <span className="italic text-[color:var(--landing-gold-dark)]">beautifully.</span>
          </h2>
          <div className="mt-8">
            <ThinDivider />
          </div>
          <p className="mx-auto mt-8 max-w-lg font-sans text-base font-light leading-relaxed text-[color:var(--landing-muted)] sm:text-lg">
            Craft a digital invitation that feels like opening luxury stationery — then share it with
            everyone you love.
          </p>
          <div className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
            <LandingButton href={CREATE_HREF}>Create Invitation</LandingButton>
            <LandingButton href="#templates" variant="secondary">
              View Templates
            </LandingButton>
          </div>
        </Reveal>
      </LandingContainer>
    </section>
  )
}
