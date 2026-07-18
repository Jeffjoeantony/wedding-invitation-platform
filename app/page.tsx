import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/landing-page'

export const metadata: Metadata = {
  title: 'Goldleaf — Premium Digital Invitations',
  description:
    'Create elegant digital invitations for weddings, engagements, receptions, birthdays and more. Ivory, champagne, and gold — luxury stationery for every celebration.',
}

export default function Page() {
  return <LandingPage />
}
