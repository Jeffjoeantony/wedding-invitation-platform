import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { extractFirstName } from '@/lib/extract-first-name'
import { INVITE_OG_HEIGHT, INVITE_OG_WIDTH } from '@/lib/invite-og'
import { getProjectGallery } from '@/lib/invite-media-server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function loadFallbackPortraitDataUrl(): Promise<string> {
  const file = await readFile(join(process.cwd(), 'public/invitations/couple-portrait.png'))
  return `data:image/png;base64,${file.toString('base64')}`
}

async function toImageSrc(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return `data:${contentType};base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')?.trim() || ''

  let imageSrc = await loadFallbackPortraitDataUrl()
  let coupleLabel = 'You are invited'
  let eventLabel = 'Digital Invitation'

  if (projectId && UUID_RE.test(projectId)) {
    try {
      const supabase = createAdminClient()
      const { data: event } = await supabase
        .from('projects')
        .select('couple_1,couple_2,event_template')
        .eq('id', projectId)
        .single()

      if (event) {
        const c1 = extractFirstName(event.couple_1) || event.couple_1?.trim() || ''
        const c2 = extractFirstName(event.couple_2) || event.couple_2?.trim() || ''
        if (c1 && c2) coupleLabel = `${c1} & ${c2}`
        else if (c1 || c2) coupleLabel = c1 || c2
        eventLabel = (event.event_template?.trim() || 'Invitation') + ' Invitation'
      }

      const gallery = await getProjectGallery(projectId)
      const remote = gallery[0]?.url
      if (remote) {
        const src = await toImageSrc(remote)
        if (src) imageSrc = src
      }
    } catch {
      // keep fallback portrait + default labels
    }
  }

  const image = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#1a1510',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageSrc}
          alt=""
          width={INVITE_OG_WIDTH}
          height={INVITE_OG_HEIGHT}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background:
              'linear-gradient(180deg, rgba(20,16,12,0.15) 0%, rgba(20,16,12,0.25) 45%, rgba(20,16,12,0.78) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 56,
            right: 56,
            bottom: 48,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              color: '#F7F1E8',
              fontSize: 54,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {coupleLabel}
          </div>
          <div
            style={{
              display: 'flex',
              color: 'rgba(247,241,232,0.88)',
              fontSize: 28,
              fontWeight: 400,
              letterSpacing: '0.02em',
            }}
          >
            {eventLabel}
          </div>
        </div>
      </div>
    ),
    {
      width: INVITE_OG_WIDTH,
      height: INVITE_OG_HEIGHT,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  )

  return image
}
