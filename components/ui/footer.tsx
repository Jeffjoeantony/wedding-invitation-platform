'use client'

import type { InvitationConfig } from '@/lib/invitation-config'
import { motion } from 'framer-motion'
import { Ornament } from './ornament'
import { Reveal } from './reveal'

export function Footer({ config }: { config: InvitationConfig }) {
  return (
    <footer className="relative overflow-hidden px-6 pb-20 pt-10 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gold-soft/20 to-transparent"
      />

      <Reveal direction="up">
        <div className="relative mx-auto flex max-w-xs flex-col items-center">
          <Ornament />
          <motion.p
            className="mt-7 font-serif text-3xl font-light tracking-wide text-gilded"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {config.couple1} &amp; {config.couple2}
          </motion.p>
          <p className="mt-3 font-sans text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
            {config.dateLabel}
          </p>
          <p className="mt-6 max-w-[16rem] font-serif text-sm italic leading-relaxed text-foreground/70">
            With love, we look forward to celebrating this day with you.
          </p>
        </div>
      </Reveal>
    </footer>
  )
}
