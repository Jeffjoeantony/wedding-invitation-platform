'use client'

import type { InvitationConfig } from '@/lib/invitation-config'
import { motion } from 'framer-motion'
import { Clock, MapPin, Navigation } from 'lucide-react'
import { Ornament, Sparkles } from './ornament'
import { Reveal, RevealStagger } from './reveal'

export function StoryBento({ config }: { config: InvitationConfig }) {
  const events = config.events?.length ? config.events : null
  const multi = (events?.length ?? 0) > 1

  return (
    <section className="invite-section relative overflow-hidden px-6 py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--gold-soft)_22%,transparent),transparent_55%)]"
      />
      <Sparkles count={5} />

      <RevealStagger className="relative text-center" stagger={0.12}>
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-gold">Our Story</p>
        <h2 className="mt-3 font-serif text-[2rem] font-light leading-tight text-foreground sm:text-4xl">
          Two hearts,{' '}
          <span className="italic text-gilded">
            {multi ? 'two celebrations' : 'one celebration'}
          </span>
        </h2>
        <div className="mt-6">
          <Ornament />
        </div>
        <p className="mx-auto mt-6 max-w-md font-sans text-sm leading-relaxed text-muted-foreground">
          {config.storyLine}
        </p>
      </RevealStagger>

      {multi && events ? (
        <div className="relative mx-auto mt-14 flex max-w-md flex-col gap-8">
          {events.map((ev, index) => (
            <Reveal key={ev.id} direction="up" delay={0.08 + index * 0.08}>
              <div className="overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-card via-card to-gold-soft/20 p-6 shadow-[0_18px_40px_-30px_rgba(60,45,25,0.45)]">
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.32em] text-gold">
                  {ev.label}
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-white/50">
                      <Clock className="h-4 w-4 text-gold" strokeWidth={1.5} />
                    </div>
                    <p className="mt-4 font-sans text-[0.55rem] uppercase tracking-[0.28em] text-muted-foreground">
                      When
                    </p>
                    <p className="mt-1.5 font-serif text-xl font-light leading-tight text-foreground">
                      {ev.dateLabel || 'Date to be announced'}
                    </p>
                    {ev.time ? (
                      <p className="mt-1 font-sans text-sm text-muted-foreground">{ev.time}</p>
                    ) : null}
                  </div>
                  <div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-white/50">
                      <MapPin className="h-4 w-4 text-gold" strokeWidth={1.5} />
                    </div>
                    <p className="mt-4 font-sans text-[0.55rem] uppercase tracking-[0.28em] text-muted-foreground">
                      Where
                    </p>
                    <p className="mt-1.5 font-serif text-xl font-light leading-tight text-foreground">
                      {ev.venue || 'Venue to be announced'}
                    </p>
                    {ev.address ? (
                      <p className="mt-1 font-sans text-sm leading-relaxed text-muted-foreground">
                        {ev.address}
                      </p>
                    ) : null}
                    <a
                      href={ev.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-gold px-4 py-2 font-serif text-[0.65rem] uppercase tracking-[0.16em] text-gold transition-all duration-300 hover:bg-gold hover:text-primary-foreground"
                    >
                      <Navigation className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                      Directions
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="relative mx-auto mt-14 grid max-w-md grid-cols-1 gap-5 sm:grid-cols-2">
          <Reveal direction="left" delay={0.08}>
            <motion.div
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.985 }}
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

          <Reveal direction="right" delay={0.16}>
            <motion.div
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.985 }}
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
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-gold px-5 py-2.5 font-serif text-[0.7rem] uppercase tracking-[0.16em] text-gold transition-all duration-300 hover:bg-gold hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Navigation className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                  Get Directions
                </a>
              </div>
            </motion.div>
          </Reveal>
        </div>
      )}
    </section>
  )
}
