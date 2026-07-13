'use client'

import type { InvitationConfig } from '@/lib/invitation-config'
import { motion } from 'framer-motion'
import { Clock, MapPin } from 'lucide-react'
import { Ornament, Sparkles } from './ornament'
import { Reveal } from './reveal'

export function StoryBento({ config }: { config: InvitationConfig }) {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--gold-soft)_22%,transparent),transparent_55%)]"
      />
      <Sparkles count={8} />

      <Reveal direction="up" className="relative text-center">
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-gold">Our Story</p>
        <h2 className="mt-3 font-serif text-[2rem] font-light leading-tight text-foreground sm:text-4xl">
          Two hearts,{' '}
          <span className="italic text-gilded">one celebration</span>
        </h2>
        <div className="mt-6">
          <Ornament />
        </div>
        <p className="mx-auto mt-6 max-w-md font-sans text-sm leading-relaxed text-muted-foreground">
          From a chance meeting to a lifetime of togetherness, {config.couple1} and {config.couple2}{' '}
          invite you to witness the beginning of their forever.
        </p>
      </Reveal>

      <div className="relative mx-auto mt-14 grid max-w-md grid-cols-1 gap-5 sm:grid-cols-2">
        <Reveal direction="left" delay={0.06}>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-card via-card to-gold-soft/20 p-6 shadow-[0_18px_40px_-30px_rgba(60,45,25,0.45)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-white/50">
              <Clock className="h-5 w-5 text-gold" strokeWidth={1.5} />
            </div>
            <div className="mt-8">
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-gold">When</p>
              <p className="mt-2 font-serif text-2xl font-light leading-tight text-foreground">
                {config.dateLabel}
              </p>
              <p className="mt-2 font-sans text-sm tracking-wide text-muted-foreground">
                {config.time}
              </p>
            </div>
          </motion.div>
        </Reveal>

        <Reveal direction="right" delay={0.14}>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-card via-card to-gold-soft/20 p-6 shadow-[0_18px_40px_-30px_rgba(60,45,25,0.45)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/10 blur-2xl"
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-white/50">
              <MapPin className="h-5 w-5 text-gold" strokeWidth={1.5} />
            </div>
            <div className="mt-8">
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-gold">Where</p>
              <p className="mt-2 font-serif text-2xl font-light leading-tight text-foreground">
                {config.venue}
              </p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
                {config.address}
              </p>
              <a
                href={config.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 font-sans text-xs font-medium tracking-wide text-gold transition-all duration-300 hover:gap-2.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View on Maps
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}
