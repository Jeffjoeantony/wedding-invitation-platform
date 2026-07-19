import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-invite-serif',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-invite-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Goldleaf — Create Beautiful Digital Invitations in Minutes',
  description: 'Design, customize, manage RSVPs, share event links, and create memorable invitation experiences for any occasion. Weddings, birthdays, corporate events and more.',
  keywords: 'digital invitations, online invitations, RSVP management, wedding invitation, event management, Goldleaf',
  openGraph: {
    title: 'Goldleaf — Create Beautiful Digital Invitations in Minutes',
    description: 'Create stunning digital invitations for any occasion. Manage RSVPs, track guests, and share with QR codes.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body style={{ background: '#FAFAFA', margin: 0, padding: 0, overflowX: 'clip' }}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
