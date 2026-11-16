'use client'

import dynamic from 'next/dynamic'
import type { CSSProperties } from 'react'
import { LandingSmoothScroll } from './landing-smooth-scroll'
import { LandingNavbar } from './navbar'
import { LandingHero } from './hero'
import { LandingFeatures } from './features'
import { LandingHowItWorks } from './how-it-works'
import { LANDING } from './constants'

const LandingTemplates = dynamic(
  () => import('./templates').then((m) => m.LandingTemplates),
  { ssr: true },
)
const LandingFaq = dynamic(() => import('./faq').then((m) => m.LandingFaq), { ssr: true })
const LandingFinalCta = dynamic(
  () => import('./final-cta').then((m) => m.LandingFinalCta),
  { ssr: true },
)
const LandingFooter = dynamic(
  () => import('./footer').then((m) => m.LandingFooter),
  { ssr: true },
)

export function LandingPage() {
  return (
    <LandingSmoothScroll>
      <div
        className="landing-root min-h-screen overflow-x-clip"
        style={
          {
            '--landing-ivory': LANDING.ivory,
            '--landing-beige': LANDING.beige,
            '--landing-champagne': LANDING.champagne,
            '--landing-gold': LANDING.gold,
            '--landing-gold-dark': LANDING.goldDark,
            '--landing-gold-soft': LANDING.goldSoft,
            '--landing-ink': LANDING.ink,
            '--landing-charcoal': LANDING.charcoal,
            '--landing-muted': LANDING.muted,
            '--landing-card': LANDING.card,
            background: `linear-gradient(180deg, ${LANDING.ivory} 0%, ${LANDING.beige} 42%, ${LANDING.champagne} 100%)`,
            color: LANDING.ink,
          } as CSSProperties
        }
      >
        <LandingNavbar />
        <main>
          <LandingHero />
          <LandingFeatures />
          <LandingTemplates />
          <LandingHowItWorks />
          <LandingFaq />
          <LandingFinalCta />
        </main>
        <LandingFooter />
      </div>
    </LandingSmoothScroll>
  )
}
