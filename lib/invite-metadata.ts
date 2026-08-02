import type { Metadata } from 'next'
import { extractFirstName } from '@/lib/extract-first-name'
import { inviteOgImageMeta } from '@/lib/invite-og'

export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, '')
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

type ProjectForMeta = {
  id?: string
  couple_1?: string | null
  couple_2?: string | null
  event_template?: string | null
  date?: string | null
}

function formatDateLabel(date: string | null | undefined): string {
  if (!date) return ''
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function clipDescription(text: string, max = 140): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}

export async function buildInviteMetadata(opts: {
  event: ProjectForMeta | null | undefined
  path: string
  guestName?: string | null
}): Promise<Metadata> {
  const { event, path, guestName } = opts
  const origin = getSiteOrigin()
  const url = `${origin}${path.startsWith('/') ? path : `/${path}`}`

  if (!event) {
    const title = 'Invitation'
    const description = 'You are invited. Open to view details and RSVP.'
    const image = inviteOgImageMeta(origin, { alt: title })
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url,
        images: [image],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image.url],
      },
    }
  }

  const couple1 = extractFirstName(event.couple_1) || event.couple_1?.trim() || 'Our'
  const couple2 = extractFirstName(event.couple_2) || event.couple_2?.trim() || 'Celebration'
  const template = event.event_template?.trim() || 'Event'
  const title = `${couple1} & ${couple2} — ${template} Invitation`
  const dateLabel = formatDateLabel(event.date)
  const description = clipDescription(
    guestName?.trim()
      ? `Dear ${guestName.trim()}, you are invited. Open to RSVP${dateLabel ? ` · ${dateLabel}` : ''}.`
      : `You are invited. Open to view details and RSVP${dateLabel ? ` · ${dateLabel}` : ''}.`,
  )

  const image = inviteOgImageMeta(origin, {
    projectId: event.id,
    alt: `${couple1} and ${couple2}`,
  })

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
  }
}
