'use client'

import Image from 'next/image'

export function LandingSpecialBanner() {
  return (
    <section
      aria-label="Make your day special"
      className="relative w-full overflow-hidden leading-none"
    >
      <div className="relative aspect-[2167/301] w-full">
        <Image
          src="/landing/make-your-day-special-banner.png"
          alt="Make your day special"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  )
}
