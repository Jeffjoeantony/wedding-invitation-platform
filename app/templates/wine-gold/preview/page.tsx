import { Cormorant_Garamond, Jost } from 'next/font/google'
import { WineGoldInvitation } from '@/components/templates/wine-gold'

const serif = Cormorant_Garamond({
  weight: ['300', '400', '600'],
  subsets: ['latin'],
  variable: '--font-invite-serif',
  display: 'swap',
})

const sans = Jost({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-invite-sans',
  display: 'swap',
})

export const metadata = {
  title: 'Wine Gold — Template Preview | Goldleaf',
  description: 'Mobile preview of the Wine Gold wedding invitation template.',
  robots: { index: false, follow: false },
}

/** Preview framed at ~390px — primary mobile reference viewport */
export default function WineGoldPreviewPage() {
  return (
    <div
      className={`${serif.variable} ${sans.variable} min-h-screen`}
      style={{ background: '#EFE5D9' }}
    >
      <div className="mx-auto flex min-h-screen justify-center px-0 py-0 sm:items-start sm:px-4 sm:py-8">
        <div
          className="w-full max-w-[390px] overflow-hidden sm:rounded-[1.75rem] sm:shadow-[0_24px_60px_-28px_rgba(53,18,27,0.45)] md:max-w-[560px] lg:max-w-[680px]"
          style={{ background: '#F8F3EB' }}
        >
          <WineGoldInvitation preview />
        </div>
      </div>
    </div>
  )
}
