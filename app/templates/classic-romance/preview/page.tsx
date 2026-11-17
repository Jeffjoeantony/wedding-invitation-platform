import { Cormorant_Garamond, Great_Vibes, Jost } from 'next/font/google'
import { ClassicRomanceInvitation } from '@/components/templates/classic-romance'

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

const script = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-invite-script',
  display: 'swap',
})

export const metadata = {
  title: 'Classic Romance Preview · Goldleaf',
  description: 'Preview the Classic Romance wedding invitation template.',
}

export default function ClassicRomancePreviewPage() {
  return (
    <main
      className={`${serif.variable} ${sans.variable} ${script.variable} min-h-dvh pb-6 sm:pb-10`}
      style={{ background: '#EDE3D4' }}
    >
      <ClassicRomanceInvitation preview />
    </main>
  )
}
