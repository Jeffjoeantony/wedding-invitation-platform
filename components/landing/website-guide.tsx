'use client'

import {
  CalendarClock,
  Eye,
  Images,
  Mail,
  MapPin,
  MessageCircle,
  Palette,
  Pencil,
  PenLine,
  Share2,
  type LucideIcon,
} from 'lucide-react'
import { Reveal, RevealStagger } from '@/components/ui/reveal'
import { LIVE_IN_MINUTES, WEBSITE_INCLUDES } from './constants'
import { LandingContainer } from './section'

const ICONS: Record<string, LucideIcon> = {
  Palette,
  Eye,
  MessageCircle,
  Mail,
  CalendarClock,
  Images,
  MapPin,
  Pencil,
  PenLine,
  Share2,
}

const ACCENT: Record<string, string> = {
  gold: 'linear-gradient(135deg, #C4A46A 0%, #9E8348 100%)',
  sage: 'linear-gradient(135deg, #8A9A7B 0%, #6B7A5E 100%)',
  champagne: 'linear-gradient(135deg, #D4B896 0%, #B8956A 100%)',
}

export function LandingWebsiteGuide() {
  return (
    <section
      id="how-website-works"
      className="relative bg-[color:var(--landing-ivory)] pb-8 pt-4 sm:pb-10 sm:pt-8"
    >
      <LandingContainer>
        {/* ── How an invitation website works ── */}
        <Reveal>
          <h2 className="text-center font-serif text-3xl font-light tracking-tight text-[color:var(--landing-ink)] sm:text-4xl md:text-[2.65rem]">
            How an invitation website works
          </h2>
          <p className="mt-3 text-center font-sans text-sm font-normal text-[color:var(--landing-muted)] sm:text-base">
            Choose a template, preview it, then checkout. Your links arrive by email.
          </p>
        </Reveal>

        <RevealStagger
          className="mt-10 grid gap-5 md:grid-cols-3"
          stagger={0.08}
        >
          {LIVE_IN_MINUTES.map((item) => {
            const Icon = ICONS[item.icon] ?? PenLine
            return (
              <article
                key={item.step}
                className="flex flex-col items-center rounded-[1.35rem] px-6 py-9 text-center shadow-[0_18px_40px_-24px_rgba(28,25,22,0.55)]"
                style={{
                  background:
                    'linear-gradient(180deg, #2A221C 0%, #1C1916 55%, #161310 100%)',
                }}
              >
                <span
                  aria-hidden
                  className="flex size-14 items-center justify-center rounded-full text-white shadow-md"
                  style={{ background: ACCENT[item.accent] ?? ACCENT.gold }}
                >
                  <Icon className="size-6" strokeWidth={1.7} />
                </span>
                <p className="mt-5 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/45">
                  Step {item.step}
                </p>
                <h3 className="mt-2 font-sans text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2.5 max-w-[16rem] font-sans text-sm font-normal leading-relaxed text-white/65">
                  {item.description}
                </p>
              </article>
            )
          })}
        </RevealStagger>

        {/* ── Every website includes ── */}
        <Reveal className="mt-16 sm:mt-20">
          <h2 className="text-center font-serif text-3xl font-light tracking-tight text-[color:var(--landing-ink)] sm:text-4xl md:text-[2.65rem]">
            Every website includes
          </h2>
        </Reveal>

        <RevealStagger
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
          stagger={0.05}
        >
          {WEBSITE_INCLUDES.map((item) => {
            const Icon = ICONS[item.icon] ?? Images
            return (
              <article
                key={item.title}
                className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-8 text-center shadow-[0_8px_28px_-18px_rgba(28,25,22,0.28)]"
              >
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-xl bg-[color:var(--landing-beige)] text-[color:var(--landing-ink)]"
                >
                  <Icon className="size-5" strokeWidth={1.6} />
                </span>
                <h3 className="mt-4 font-sans text-sm font-bold leading-snug text-[color:var(--landing-ink)] sm:text-[0.95rem]">
                  {item.title}
                </h3>
              </article>
            )
          })}
        </RevealStagger>
      </LandingContainer>
    </section>
  )
}
