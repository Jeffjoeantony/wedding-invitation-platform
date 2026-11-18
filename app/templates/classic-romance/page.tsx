import Image from 'next/image'
import Link from 'next/link'
import { Cormorant_Garamond, Great_Vibes, Jost } from 'next/font/google'

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

const script = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-invite-script',
  display: 'swap',
})

export const metadata = {
  title: 'Classic Romance — Wedding Invitation Template | Goldleaf',
  description:
    'Burgundy florals, cream paper, script names, venue map, dress code palette, and RSVP — a classic romance invitation.',
}

export default function ClassicRomanceProductPage() {
  return (
    <div
      className={`${serif.variable} ${sans.variable} ${script.variable} min-h-screen`}
      style={{ background: '#F6EFE4', color: '#3A2428' }}
    >
      <div className="mx-auto max-w-lg px-5 pb-16 pt-10">
        <Link
          href="/admin/templates"
          className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#7A6468]"
          style={{ fontFamily: 'var(--font-invite-sans), system-ui, sans-serif' }}
        >
          ← All templates
        </Link>

        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-3xl bg-[#3D0A10]">
          <Image
            src="/landing/templates/classic-romance/classic-romance.jpg"
            alt="Classic Romance template"
            fill
            priority
            className="object-cover object-top"
            sizes="500px"
          />
        </div>

        <h1
          className="mt-8 text-4xl font-light"
          style={{ color: '#5C1018', fontFamily: 'var(--font-invite-serif), Georgia, serif' }}
        >
          Classic Romance
        </h1>
        <p
          className="mt-2 text-sm leading-relaxed text-[#7A6468]"
          style={{ fontFamily: 'var(--font-invite-sans), system-ui, sans-serif' }}
        >
          Deep burgundy florals, cream paper, script names, venue details, dress-code palette, celebration
          notes, and a guest questionnaire — a timeless romantic invitation.
        </p>
        <p
          className="mt-4 text-lg font-medium"
          style={{ fontFamily: 'var(--font-invite-sans), system-ui, sans-serif', color: '#5C1018' }}
        >
          Free
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/templates/classic-romance/preview"
            className="inline-flex items-center justify-center rounded-full bg-[#5C1018] px-6 py-3.5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#F6EFE4]"
            style={{ fontFamily: 'var(--font-invite-sans), system-ui, sans-serif' }}
          >
            Preview invitation
          </Link>
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-[#A67C52] px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#5C1018] opacity-70"
            style={{ fontFamily: 'var(--font-invite-sans), system-ui, sans-serif' }}
          >
            Add to cart · Coming soon
          </button>
        </div>
      </div>
    </div>
  )
}
