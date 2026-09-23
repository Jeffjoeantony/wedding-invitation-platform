'use client'

import Image from 'next/image'

export function WelcomeBanner({
  name,
}: {
  name: string
}) {
  const display = name?.trim() || 'there'
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E6EAF0] shadow-[0_8px_28px_rgba(23,35,63,0.08)]">
      <div className="absolute inset-0">
        <Image
          src="/wedding-hero.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[center_55%]"
          sizes="(max-width: 1200px) 100vw, 1100px"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(28,18,12,0.72) 0%, rgba(28,18,12,0.48) 42%, rgba(28,18,12,0.28) 100%)',
          }}
        />
      </div>

      <div className="relative flex min-h-[168px] flex-col justify-between gap-8 px-8 py-8 sm:min-h-[188px] sm:flex-row sm:items-end sm:px-10 sm:py-9 lg:px-12 lg:py-10">
        <div className="max-w-xl shrink-0">
          <p className="text-[13px] font-medium leading-5 tracking-[0.01em] text-white/80">
            Welcome back,
          </p>
          <h2
            className="mt-2 text-[30px] font-semibold leading-[1.15] tracking-tight text-white sm:text-[34px]"
            style={{ fontFamily: 'var(--font-invite-serif), Georgia, serif' }}
          >
            {display}.
          </h2>
          <p className="mt-3 max-w-md text-[14px] leading-6 text-white/88 sm:text-[15px]">
            Create beautiful moments for their special day.
          </p>
        </div>

        <p
          className="shrink-0 self-end text-right text-[15px] italic leading-[1.45] text-white/92 sm:max-w-[240px] sm:text-[16px]"
          style={{ fontFamily: 'var(--font-invite-serif), Georgia, serif' }}
        >
          Every love story
          <br />
          deserves a beautiful beginning.
        </p>
      </div>
    </div>
  )
}
