'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import InvitationClient from '@/app/invite/[token]/InvitationClient'
import { getInvitePageTheme } from '@/lib/invitePageTheme'

export default function OpenInvitePage() {
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
      setEvent(event)
      setLoading(false)
    }
    if (projectId) fetchData()
  }, [projectId])

  const theme = getInvitePageTheme(event?.event_template)

  if (loading) {
    const loadingTheme = getInvitePageTheme()
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: loadingTheme.background }}
      >
        <div className="relative w-20 h-20">
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{ border: `2px solid ${loadingTheme.ringColor}` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-3xl animate-heart-beat">
            💌
          </div>
        </div>
        <p className={`text-sm tracking-widest animate-pulse ${loadingTheme.loadingTextClass}`}>
          Loading invitation…
        </p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: theme.background }}>
        <div
          className="text-center max-w-sm p-10 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="text-5xl mb-4">💌</div>
          <h1 className="text-2xl font-serif italic text-white mb-3">Invitation Not Found</h1>
          <p className="text-white/50 text-sm font-light mb-6">
            We couldn&apos;t find this invitation. Please check your link and try again.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 rounded-full text-sm text-white font-medium transition-all hover:scale-105"
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
