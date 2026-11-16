'use client'

import {
  CheckCircle2,
  Images,
  MessageCircle,
  QrCode,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Reveal, RevealStagger } from '@/components/ui/reveal'
import { FEATURES } from './constants'
import {
  LandingContainer,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
  ThinDivider,
} from './section'

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  CheckCircle2,
  Users,
  MessageCircle,
  Images,
  QrCode,
}

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-16 md:py-24">
      <LandingContainer>
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionEyebrow>Features</SectionEyebrow>
            <SectionTitle>Everything your celebration needs</SectionTitle>
            <SectionLead className="mx-auto">
              From guest lists to galleries — thoughtfully arranged tools that stay quiet until you
              need them.
            </SectionLead>
            <div className="mt-6">
              <ThinDivider />
            </div>
          </Reveal>
        </div>

        <RevealStagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5" stagger={0.05}>
          {FEATURES.map((feature) => {
            const Icon = ICONS[feature.icon] ?? Sparkles
            return (
              <article
                key={feature.title}
                className="group flex h-full flex-col rounded-sm border border-[color:var(--landing-champagne)] bg-[color:var(--landing-card)]/75 p-6 shadow-[0_12px_40px_-28px_rgba(45,42,38,0.28)] backdrop-blur-sm transition duration-500 hover:-translate-y-1 hover:border-[color:var(--landing-gold)]/50 hover:shadow-[0_22px_50px_-24px_rgba(158,131,72,0.35)]"
              >
                <div className="flex size-10 items-center justify-center rounded-sm border border-[color:var(--landing-gold)]/30 bg-[color:var(--landing-ivory)] text-[color:var(--landing-gold-dark)] transition group-hover:border-[color:var(--landing-gold)]/60">
                  <Icon className="size-4" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-serif text-xl font-light text-[color:var(--landing-ink)]">
                  {feature.title}
                </h3>
                <p className="mt-2 font-sans text-sm font-light leading-relaxed text-[color:var(--landing-muted)]">
                  {feature.description}
                </p>
              </article>
            )
          })}
        </RevealStagger>
      </LandingContainer>
    </section>
  )
}
