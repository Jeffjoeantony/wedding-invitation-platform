import Image from 'next/image'
import Link from 'next/link'
import { Cormorant_Garamond, Jost } from 'next/font/google'

const serif = Cormorant_Garamond({
  weight: ['300', '400', '600'],
  subsets: ['latin'],
  variable: '--font-invite-serif',
  display: 'swap',
})

const sans = Jost({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-invite-sans',
  display: 'swap',
})

export const metadata = {
  title: 'Wine Gold — Wedding Invitation Template | Goldleaf',
  description:
    'Luxury burgundy, champagne ivory, gold names, and a torn-edge invitation experience.',
}

export default function WineGoldProductPage() {
  return (
    <div
      className={`${serif.variable} ${sans.variable} min-h-screen`}
      style={{ background: '#F8F3EB', color: '#35252A' }}
    >
      <div className="mx-auto max-w-lg px-5 pb-16 pt-10">
        <Link
          href="/#popular"
          className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#78676A]"
          style={{ fontFamily: 'var(--font-invite-sans), system-ui, sans-serif' }}
        >
          ← All templates
        </Link>

        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-3xl bg-[#2d0202]">
          <Image
            src="/landing/templates/wine-gold.jpg"
            alt="Wine Gold template"
            fill
            priority
            className="object-cover object-center"
            sizes="500px"
          />
        </div>

        <h1
          className="mt-8 text-4xl font-light"
          style={{ color: '#42121F', fontFamily: 'var(--font-invite-serif), Georgia, serif' }}
        >
          Wine Gold
        </h1>
        <p
          className="mt-2 text-sm leading-relaxed text-[#78676A]"
          style={{ fontFamily: 'var(--font-invite-sans), system-ui, sans-serif' }}
        >
          Luxury burgundy overlays, champagne paper, gold names, a torn-edge transition, countdown
          card, program timeline, and RSVP — designed from classic wedding stationery.
        </p>
        <p
          className="mt-4 text-lg font-medium"
          style={{ fontFamily: 'var(--font-invite-sans), system-ui, sans-serif', color: '#641D2C' }}
        >
          ₹999
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/templates/wine-gold/preview"
            className="inline-flex items-center justify-center rounded-full bg-[#641D2C] px-6 py-3.5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#FFF9F0]"
            style={{ fontFamily: 'var(--font-invite-sans), system-ui, sans-serif' }}
          >
            Preview invitation
          </Link>
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-[#C5A16A] px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#641D2C] opacity-70"
            style={{ fontFamily: 'var(--font-invite-sans), system-ui, sans-serif' }}
          >
            Add to cart · Coming soon
          </button>
        </div>
      </div>
    </div>
  )
}
