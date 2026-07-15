import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildInviteMetadata } from '@/lib/invite-metadata'
import InvitePageClient from './InvitePageClient'

type Props = { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  if (!token || !/^[a-zA-Z0-9_-]{6,64}$/.test(token)) {
    return buildInviteMetadata({ event: null, path: `/invite/${token || ''}` })
  }

  try {
    const supabase = createAdminClient()
    const { data: guest } = await supabase
      .from('guests')
      .select('name,project_id')
      .eq('unique_token', token)
      .single()

    if (!guest?.project_id) {
      return buildInviteMetadata({ event: null, path: `/invite/${token}` })
    }

    const { data: event } = await supabase
      .from('projects')
      .select('id,couple_1,couple_2,event_template,date')
      .eq('id', guest.project_id)
      .single()

    return buildInviteMetadata({
      event: event ? { ...event, id: guest.project_id } : null,
      path: `/invite/${token}`,
      guestName: guest.name,
    })
  } catch {
    return buildInviteMetadata({ event: null, path: `/invite/${token}` })
  }
}

export default function InvitePage() {
  return <InvitePageClient />
}
