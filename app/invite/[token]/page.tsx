'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import InvitationClient from './InvitationClient'

export default function InvitePage() {
  const params = useParams()
  const token = params.token as string
  const [guest, setGuest] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/invite?token=${encodeURIComponent(token)}`)
      if (!res.ok) {
        setError(true)
        setLoading(false)
        return
      }
      const { guest, event } = await res.json()
      setGuest(guest)
      setEvent(event)
      setLoading(false)
    }
    if (token) fetchData()
  }, [token])

  const isBirthday = event?.event_template === 'Birthday'

  // Background and accent adapt to the event type once loaded
  const bg = isBirthday
    ? { background: 'linear-gradient(160deg, #0f0520 0%, #1e0938 30%, #2d1060 60%, #1a0530 100%)' }
    : { background: 'linear-gradient(160deg, #1a0010 0%, #3d0020 35%, #6d1040 65%, #3d0020 100%)' }

  const loadingEmoji = isBirthday ? '🎂' : '💍'
  const loadingColor = isBirthday ? 'rgba(251,191,36,0.5)' : 'rgba(255,100,130,0.5)'
  const loadingText = isBirthday ? 'text-yellow-300/70' : 'text-rose-300/70'

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: 'linear-gradient(160deg, #0f0318 0%, #1e0530 50%, #0f0318 100%)' }}
      >
        {/* Pulsing ring */}
        <div className="relative w-20 h-20">
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{ border: '2px solid rgba(167,139,250,0.4)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-3xl animate-heart-beat">
            🎉
          </div>
        </div>
        <p className="text-purple-300/60 text-sm tracking-widest animate-pulse">
          Loading your invitation…
        </p>
      </div>
    )
  }

  if (error || !guest) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={bg}
      >
        <div
          className="text-center max-w-sm p-10 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="text-5xl mb-4">💌</div>
          <h1 className="text-2xl font-serif italic text-white mb-3">
            Invitation Not Found
          </h1>
          <p className="text-white/50 text-sm font-light mb-6">
            We couldn&apos;t find your invitation. Please check your link and try again.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 rounded-full text-sm text-white font-medium transition-all hover:scale-105"
            style={{ background: isBirthday ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'linear-gradient(135deg, #be123c, #9f1239)' }}
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }

  return <InvitationClient guest={guest} event={event} />
}
