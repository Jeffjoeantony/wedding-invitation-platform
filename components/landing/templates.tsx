'use client'

import { Reveal } from '@/components/ui/reveal'
import { LandingGalleryCarousel } from './gallery-carousel'

export function LandingTemplates() {
  return (
    <section
      id="templates"
      className="relative overflow-x-clip bg-[color:var(--landing-ivory)] py-20 md:py-28"
    >
      <div className="mx-auto max-w-[100vw] px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="font-serif text-[1.65rem] font-light tracking-[0.08em] text-[color:var(--landing-ink)] sm:text-3xl md:text-[2.35rem] md:tracking-[0.1em]">
            one moment at a time
          </h2>
        </Reveal>
      </div>

      <Reveal className="mt-12 md:mt-16">
        <LandingGalleryCarousel />
      </Reveal>
    </section>
  )
}
