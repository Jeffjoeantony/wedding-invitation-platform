'use client'

import Image from 'next/image'
import { useRef, type MouseEvent } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Reveal } from '@/components/ui/reveal'
import { TEMPLATES } from './constants'
import {
  LandingContainer,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
  ThinDivider,
} from './section'

function TiltCard({
  category,
  title,
  image,
}: {
  category: string
  title: string
  image: string
}) {
  const ref = useRef<HTMLElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })

  const onMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="group relative w-[240px] shrink-0 snap-center overflow-hidden rounded-sm border border-[color:var(--landing-champagne)] bg-[color:var(--landing-card)] shadow-[0_18px_50px_-28px_rgba(45,42,38,0.4)] will-change-transform sm:w-[280px]"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image}
          alt={`${category} template — ${title}`}
          fill
          sizes="280px"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--landing-ink)]/70 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-[color:var(--landing-gold)]">
            {category}
          </p>
          <h3 className="mt-1 font-serif text-2xl font-light text-white">{title}</h3>
        </div>
      </div>
    </motion.article>
  )
}

export function LandingTemplates() {
  return (
    <section id="templates" className="relative py-16 md:py-24">
      <LandingContainer>
        <div className="max-w-2xl">
          <Reveal>
            <SectionEyebrow>Templates</SectionEyebrow>
            <SectionTitle>A gallery of celebrations</SectionTitle>
            <SectionLead>
              Browse refined starting points — then make each one unmistakably yours.
            </SectionLead>
            <div className="mt-6">
              <ThinDivider className="mx-0" />
            </div>
          </Reveal>
        </div>
      </LandingContainer>

      <Reveal className="mt-12">
        <div className="flex gap-5 overflow-x-auto px-5 pb-4 snap-x snap-mandatory scrollbar-landing sm:px-8 lg:px-[max(2rem,calc((100vw-72rem)/2+2rem))]">
          {TEMPLATES.map((t) => (
            <TiltCard key={`${t.category}-${t.title}`} {...t} />
          ))}
        </div>
      </Reveal>
    </section>
  )
}
