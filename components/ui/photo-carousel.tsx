'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import type { MediaItem } from '@/lib/invite-media'
import { Reveal } from './reveal'

export function PhotoCarousel({
  images,
  label = 'Gallery',
  title,
  subtitle,
  hideHeader = false,
}: {
  images: MediaItem[]
  label?: string
  title?: ReactNode
  subtitle?: string
  hideHeader?: boolean
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [autoplay] = useState(() =>
    Autoplay({
      delay: 4000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    }),
  )

  useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  if (!images.length) return null

  const multi = images.length > 1

  return (
    <section className="invite-section relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20">
      {!hideHeader && (
        <Reveal direction="up" className="text-center mb-8">
          {label && (
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-gold">{label}</p>
          )}
          <h2 className="mt-3 font-serif text-2xl font-light text-foreground sm:text-3xl">
            {title ?? (
              <>
                Favourite <span className="italic text-gilded">frames</span>
              </>
            )}
          </h2>
          {subtitle && (
            <p className="mt-3 font-serif text-sm italic text-foreground/65">{subtitle}</p>
          )}
        </Reveal>
      )}

      <Reveal direction="scale" delay={0.08}>
        <div className="relative mx-auto max-w-md">
          <Carousel
            setApi={setApi}
            opts={{
              loop: multi,
              align: 'center',
              dragFree: false,
              containScroll: 'trimSnaps',
            }}
            plugins={multi ? [autoplay] : []}
            data-lenis-prevent
            className="[&_[data-slot=carousel-content]]:touch-pan-y"
            onPointerDownCapture={() => {
              if (multi) autoplay.stop()
            }}
            onPointerUp={() => {
              if (multi) {
                autoplay.reset()
                autoplay.play()
              }
            }}
          >
            <CarouselContent className="-ml-0">
              {images.map((img) => (
                <CarouselItem key={img.id} className="basis-full pl-0">
                  <div className="relative aspect-[4/5] select-none overflow-hidden rounded-2xl border border-gold/20 shadow-[0_24px_60px_-36px_rgba(60,45,25,0.55)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.caption || 'Gallery photo'}
                      className="pointer-events-none h-full w-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    {img.caption && (
                      <p className="pointer-events-none absolute inset-x-4 bottom-4 text-center font-serif text-sm italic text-white/95">
                        {img.caption}
                      </p>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {multi && (
              <>
                <CarouselPrevious className="left-2 z-10 hidden border-gold/40 bg-white/80 text-foreground hover:bg-white sm:flex" />
                <CarouselNext className="right-2 z-10 hidden border-gold/40 bg-white/80 text-foreground hover:bg-white sm:flex" />
              </>
            )}
          </Carousel>

          {multi && (
            <div className="mt-4 flex justify-center gap-1.5">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => api?.scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === current ? 'w-5 bg-gold' : 'w-1.5 bg-gold/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  )
}
