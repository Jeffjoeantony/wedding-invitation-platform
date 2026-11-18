'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Plus, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Reveal } from '@/components/ui/reveal'
import { templateHref } from '@/lib/shop/catalog'
import {
  POPULAR_WEBSITES,
  POPULAR_WEBSITES_PAGE_SIZE,
} from './constants'
import { LandingContainer } from './section'

export function LandingPopularWebsites() {
  const [visibleCount, setVisibleCount] = useState(POPULAR_WEBSITES_PAGE_SIZE)
  const visible = POPULAR_WEBSITES.slice(0, visibleCount)
  const hasMore = visibleCount < POPULAR_WEBSITES.length

  const loadMore = () => {
    setVisibleCount((n) =>
      Math.min(n + POPULAR_WEBSITES_PAGE_SIZE, POPULAR_WEBSITES.length),
    )
  }

  return (
    <section
      id="popular"
      className="relative z-10 -mt-8 rounded-t-[2rem] bg-[color:var(--landing-ivory)] pb-16 pt-12 sm:-mt-12 sm:rounded-t-[2.75rem] sm:pb-20 sm:pt-16 md:rounded-t-[3.25rem]"
    >
      <LandingContainer>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <Reveal>
            <div className="inline-flex items-center gap-2.5">
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--landing-ink)] text-[color:var(--landing-gold-soft)]"
              >
                <Sparkles className="size-3" strokeWidth={2} />
              </span>
              <span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--landing-muted)]">
                Trending Designs
              </span>
            </div>
            <h2 className="mt-3 max-w-xl font-sans text-2xl font-bold uppercase leading-[1.1] tracking-[-0.02em] text-[color:var(--landing-ink)] sm:text-3xl md:text-[2.15rem]">
              Popular invitation websites
            </h2>
          </Reveal>

          <Reveal>
            {hasMore ? (
              <button
                type="button"
                onClick={loadMore}
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[color:var(--landing-ink)]/20 bg-transparent px-5 py-2.5 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--landing-ink)] transition hover:border-[color:var(--landing-ink)]/40 hover:bg-white/60 sm:self-auto"
              >
                View More
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </button>
            ) : null}
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-5">
          {visible.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: i >= POPULAR_WEBSITES_PAGE_SIZE ? (i - POPULAR_WEBSITES_PAGE_SIZE) * 0.06 : 0,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group flex flex-col"
            >
              <Link
                href={templateHref(item.slug)}
                className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#F0EEE9]"
              >
                <Image
                  src={item.image}
                  alt={`${item.title} invitation template`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top transition duration-700 group-hover:scale-[1.03]"
                />
              </Link>

              <h3 className="mt-4 font-sans text-sm font-semibold uppercase tracking-[0.04em] text-[color:var(--landing-ink)]">
                {item.title}
              </h3>

              <div className="mt-2.5 flex items-center justify-between gap-3">
                <p className="font-sans text-sm font-medium text-[color:var(--landing-charcoal)]">
                  {item.price}
                </p>
                <Link
                  href={templateHref(item.slug)}
                  aria-label={`View ${item.title}`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--landing-ink)] text-white transition hover:scale-105 hover:bg-[#3A2F27] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--landing-gold)]/55 focus-visible:ring-offset-2"
                >
                  <Plus className="size-4" strokeWidth={2.25} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </LandingContainer>
    </section>
  )
}
