import type { Metadata } from 'next'
import { getProjectGallery } from '@/lib/invite-media-server'

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

export async function buildInviteMetadata(opts: {
  event: ProjectForMeta | null | undefined
  path: string
  guestName?: string | null
}): Promise<Metadata> {
  const { event, path, guestName } = opts
  const origin = getSiteOrigin()
  const url = `${origin}${path.startsWith('/') ? path : `/${path}`}`

  if (!event) {
    return {
      title: 'Invitation',
      description: 'You are invited. Open to view details and RSVP.',
      openGraph: {
        title: 'Invitation',
        description: 'You are invited. Open to view details and RSVP.',
        type: 'website',
        url,
        images: [{ url: `${origin}/invitations/couple-portrait.png` }],
      },
    }
  }

  const couple1 = event.couple_1?.trim() || 'Our'
  const couple2 = event.couple_2?.trim() || 'Celebration'
  const template = event.event_template?.trim() || 'Event'
  const title = `${couple1} & ${couple2} — ${template} Invitation`
  const dateLabel = formatDateLabel(event.date)
  const description = guestName?.trim()
    ? `Dear ${guestName.trim()}, you are invited. Open to view details and RSVP${dateLabel ? ` · ${dateLabel}` : ''}.`
    : `You are invited. Open to view details and RSVP${dateLabel ? ` · ${dateLabel}` : ''}.`

  let imageUrl = `${origin}/invitations/couple-portrait.png`
  if (event.id) {
    try {
      const gallery = await getProjectGallery(event.id)
      if (gallery[0]?.url) imageUrl = gallery[0].url
    } catch {
      // keep fallback
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      images: [
        {
          url: imageUrl,
          alt: `${couple1} and ${couple2}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}
