'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import InvitationClient from '@/app/invite/[token]/InvitationClient'
import { getInvitePageTheme } from '@/lib/invitePageTheme'

export default function OpenInvitePageClient() {
  const params = useParams()
  const projectId = params.projectId as string
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/invite/open?projectId=${encodeURIComponent(projectId)}`)
      if (!res.ok) {
        setError(true)
        setLoading(false)
        return
      }
      const { event } = await res.json()
      setEvent({ ...event, id: projectId })
      setLoading(false)
    }
    if (projectId) fetchData()
  }, [projectId])

  const theme = getInvitePageTheme(event?.event_template)

  if (loading) {
    return <div className="min-h-screen bg-[oklch(0.965_0.011_85)]" aria-hidden="true" />
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: theme.background }}>
        <div className="max-w-sm rounded-3xl border border-black/10 bg-white/80 p-10 text-center shadow-sm backdrop-blur-xl">
          <div className="mb-4 text-5xl" aria-hidden="true">
            💌
          </div>
          <h1 className="mb-3 font-serif text-2xl italic text-neutral-900">Invitation Not Found</h1>
          <p className="mb-6 text-sm font-light text-neutral-600">
            We couldn&apos;t find this invitation. Please check your link and try again.
          </p>
          <a
            href="/"
            className="inline-block rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all hover:scale-105"
            style={{ background: theme.buttonGradient }}
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }

  return <InvitationClient event={event} open />
}
