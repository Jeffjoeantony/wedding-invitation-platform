'use client'

import type { InvitationConfig } from '@/lib/invitation-config'
import { Ornament } from './ornament'
import { RevealStagger } from './reveal'

export function Footer({ config }: { config: InvitationConfig }) {
  return (
    <footer className="relative overflow-hidden px-6 pb-20 pt-10 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gold-soft/20 to-transparent"
      />

      <RevealStagger className="relative mx-auto flex max-w-xs flex-col items-center" stagger={0.12}>
        <Ornament />
        <p className="mt-7 font-serif text-3xl font-light tracking-wide text-gilded">
          {config.couple1} &amp; {config.couple2}
        </p>
        <p className="mt-3 font-sans text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
          {config.dateLabel}
        </p>
        <p className="mt-6 max-w-[16rem] font-serif text-sm italic leading-relaxed text-foreground/70">
          {config.footerTagline}. With love, we look forward to celebrating with you.
        </p>
      </RevealStagger>
    </footer>
  )
}
