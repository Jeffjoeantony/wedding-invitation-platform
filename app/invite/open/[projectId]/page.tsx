import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildInviteMetadata } from '@/lib/invite-metadata'
import OpenInvitePageClient from './OpenInvitePageClient'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type Props = { params: Promise<{ projectId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params
  if (!projectId || !UUID_RE.test(projectId)) {
    return buildInviteMetadata({ event: null, path: `/invite/open/${projectId || ''}` })
  }

  try {
    const supabase = createAdminClient()
    const { data: event } = await supabase
      .from('projects')
      .select('id,couple_1,couple_2,event_template,date')
      .eq('id', projectId)
      .single()

    return buildInviteMetadata({
      event: event ? { ...event, id: projectId } : null,
      path: `/invite/open/${projectId}`,
    })
  } catch {
    return buildInviteMetadata({ event: null, path: `/invite/open/${projectId}` })
  }
}

export default function OpenInvitePage() {
  return <OpenInvitePageClient />
}
