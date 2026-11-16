'use client'

import { Reveal, RevealStagger } from '@/components/ui/reveal'
import { HOW_IT_WORKS } from './constants'
import {
  LandingContainer,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
  ThinDivider,
} from './section'

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-16 md:py-24">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--landing-champagne) 45%, transparent) 45%, transparent 100%)',
        }}
      />

      <LandingContainer className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionEyebrow>How It Works</SectionEyebrow>
            <SectionTitle>From idea to invitation</SectionTitle>
            <SectionLead className="mx-auto">
              Four calm steps — designed so creating feels as considered as the celebration itself.
            </SectionLead>
            <div className="mt-6">
              <ThinDivider />
            </div>
          </Reveal>
        </div>

        <RevealStagger
          className="mt-14 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.08}
        >
          {HOW_IT_WORKS.map((item) => (
            <article
              key={item.step}
              className="relative flex h-full min-h-[220px] flex-col rounded-sm border border-[color:var(--landing-champagne)] bg-[color:var(--landing-card)]/80 p-7 shadow-[0_16px_44px_-30px_rgba(45,42,38,0.32)] backdrop-blur-sm"
            >
              <p className="font-serif text-4xl font-light text-[color:var(--landing-gold)]/80">
                {item.step}
              </p>
              <h3 className="mt-4 min-h-[2.75rem] font-serif text-2xl font-light leading-snug text-[color:var(--landing-ink)]">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 font-sans text-sm font-light leading-relaxed text-[color:var(--landing-muted)]">
                {item.description}
              </p>
            </article>
          ))}
        </RevealStagger>
      </LandingContainer>
    </section>
  )
}
