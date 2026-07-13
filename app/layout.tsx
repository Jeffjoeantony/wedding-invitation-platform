import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-invite-serif',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-invite-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'InviteFlow — Create Beautiful Digital Invitations in Minutes',
  description: 'Design, customize, manage RSVPs, share event links, and create memorable invitation experiences for any occasion. Weddings, birthdays, corporate events and more.',
  keywords: 'digital invitations, online invitations, RSVP management, wedding invitation, event management, InviteFlow',
  openGraph: {
    title: 'InviteFlow — Create Beautiful Digital Invitations in Minutes',
    description: 'Create stunning digital invitations for any occasion. Manage RSVPs, track guests, and share with QR codes.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} scroll-smooth`}>
      <body style={{ background: '#FAFAFA', margin: 0, padding: 0 }}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
