'use client'

import { useEffect, useRef, useState } from 'react'

// ── Falling hearts (same as homepage, scoped to invite only) ─────────────────
function FallingHearts() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLOURS = [
      'rgba(190,18,60,0.65)',
      'rgba(225,80,120,0.55)',
      'rgba(251,207,232,0.7)',
      'rgba(244,63,94,0.6)',
      'rgba(255,192,203,0.7)',
      'rgba(160,0,50,0.45)',
    ]

    type Heart = {
      x: number; y: number; size: number; speed: number
      opacity: number; sway: number; swaySpeed: number; phase: number
      colour: string; rotation: number; rotSpeed: number
    }

    const make = (): Heart => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      size: 7 + Math.random() * 16,
      speed: 0.5 + Math.random() * 1.2,
      opacity: 0.35 + Math.random() * 0.55,
      sway: 25 + Math.random() * 55,
      swaySpeed: 0.005 + Math.random() * 0.009,
      phase: Math.random() * Math.PI * 2,
      colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
    })

    const hearts: Heart[] = Array.from({ length: 24 }, make)

    const drawHeart = (ctx: CanvasRenderingContext2D, h: Heart, t: number) => {
      const x = h.x + Math.sin(t * h.swaySpeed + h.phase) * h.sway
      ctx.save()
      ctx.translate(x, h.y)
      ctx.rotate(h.rotation)
      ctx.globalAlpha = h.opacity
      ctx.fillStyle = h.colour
      const s = h.size
      ctx.beginPath()
      ctx.moveTo(0, -s * 0.4)
      ctx.bezierCurveTo( s * 0.8, -s * 1.2,  s * 1.6,  s * 0.2,  0,  s)
      ctx.bezierCurveTo(-s * 1.6,  s * 0.2, -s * 0.8, -s * 1.2,  0, -s * 0.4)
      ctx.fill()
      ctx.restore()
    }

    let t = 0
    let raf: number
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t++
      hearts.forEach((h) => {
        h.y += h.speed
        h.rotation += h.rotSpeed
        if (h.y > canvas.height + 30) Object.assign(h, make(), { y: -20 })
        drawHeart(ctx, h, t)
      })
      raf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

// ── Live countdown ────────────────────────────────────────────────────────────
function useCountdown(targetDate: string) {
  const calc = () => {
    const diff = new Date(targetDate + 'T00:00:00').getTime() - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true }
    const s = Math.floor(diff / 1000)
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
      past: false,
    }
  }
  const [tick, setTick] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTick(calc()), 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return tick
}

function CountCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg tabular-nums"
        style={{
          background: 'linear-gradient(135deg, rgba(190,18,60,0.85), rgba(120,0,40,0.9))',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[9px] uppercase tracking-widest text-rose-300/70 mt-1.5 font-medium">{label}</span>
    </div>
  )
}

// ── Glass card wrapper ────────────────────────────────────────────────────────
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,0.13)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {children}
    </div>
  )
}

// ── Ornament divider ──────────────────────────────────────────────────────────
function Ornament({ text = '♥ ♥ ♥' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />
      <span className="text-rose-400/50 text-xs tracking-widest">{text}</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-rose-400/30 to-transparent" />
    </div>
  )
}

// Formats "HH:MM:SS" (24-hr) to "H:MM AM/PM"
function formatTime(time: string | undefined): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return time
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

// ── Attending step types ──────────────────────────────────────────────────────
type Step = 'view' | 'rsvp-yes' | 'confirmed'

// ── Main component ────────────────────────────────────────────────────────────
export default function InvitationClient({ guest, event }: any) {
  const [step, setStep] = useState<Step>('view')
  const [paxCount, setPaxCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [rsvpResponse, setRsvpResponse] = useState<'yes' | 'no' | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const countdown = useCountdown(event.date)

  const submitRsvp = async (status: string, count: number) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: guest.unique_token,
          status,
          pax_count: count,
        }),
      })
      if (!res.ok) {
        alert('Error submitting RSVP. Please try again.')
      } else {
        setStep('confirmed')
      }
    } catch {
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRsvp = (response: 'yes' | 'no') => {
    setRsvpResponse(response)
    if (response === 'yes') {
      setStep('rsvp-yes')
    } else {
      submitRsvp('no', 0)
    }
  }

  const dateStr = event?.date
    ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  const transitionClass = `transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`

  return (
    <main
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(160deg, #1a0010 0%, #3d0020 35%, #6d1040 65%, #3d0020 100%)',
      }}
    >
      {/* Falling hearts */}
      <FallingHearts />

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] opacity-15 animate-float"
          style={{ background: 'radial-gradient(circle, rgba(255,80,120,0.5), transparent 70%)', borderRadius: '50%' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[350px] h-[350px] opacity-10 animate-float delay-500"
          style={{ background: 'radial-gradient(circle, rgba(255,140,170,0.4), transparent 70%)', borderRadius: '50%' }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-16" style={{ zIndex: 2 }}>

        {/* ── Greeting header ── */}
        <div className={`text-center mb-8 ${transitionClass}`}>
          <p className="text-[11px] uppercase tracking-[0.35em] text-rose-300 font-medium mb-3 animate-fade-in-down delay-100">
            Cordially Invited
          </p>
          <h2
            className="font-light text-white leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)' }}
          >
            Dear{' '}
            <span
              className="font-serif italic"
              style={{
                background: 'linear-gradient(135deg, #fff 20%, #ffb3c6 60%, #fff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 15px rgba(255,100,130,0.4))',
              }}
            >
              {guest.name}
            </span>
          </h2>
        </div>

        {/* ══════════════════════════════════════════════════════════
            STEP: VIEW — Main invitation card
        ═══════════════════════════════════════════════════════════ */}
        {step === 'view' && (
          <GlassCard className={`w-full max-w-xl px-8 py-10 md:px-12 ${transitionClass}`}>

            {/* Top ornament */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-400/40 to-transparent" />
              <span className="text-rose-300 text-lg tracking-widest animate-heart-beat">♥</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-rose-400/40 to-transparent" />
            </div>

            {/* Couple names */}
            <div className="text-center mb-8">
              <h1
                className="font-serif italic leading-tight mb-2"
                style={{
                  fontSize: 'clamp(2.2rem, 8vw, 3.5rem)',
                  background: 'linear-gradient(135deg, #fff 20%, #ffb3c6 55%, #fff 90%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 20px rgba(255,100,130,0.35))',
                  animation: 'shimmer 4s linear infinite',
                }}
              >
                {event?.couple_1}
              </h1>
              <p className="text-rose-300/70 text-2xl font-light my-1">&amp;</p>
              <h1
                className="font-serif italic leading-tight"
                style={{
                  fontSize: 'clamp(2.2rem, 8vw, 3.5rem)',
                  background: 'linear-gradient(135deg, #fff 20%, #ffb3c6 55%, #fff 90%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 20px rgba(255,100,130,0.35))',
                  animation: 'shimmer 4s linear 0.5s infinite',
                }}
              >
                {event?.couple_2}
              </h1>
            </div>

            <p className="text-white/50 text-sm font-light text-center leading-relaxed mb-6">
              Together with their families request the honour of your presence
              at their wedding celebration
            </p>

            <Ornament />

            {/* Date & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div
                className="rounded-2xl p-4 group hover:scale-[1.02] transition-transform duration-300"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span>📅</span>
                  <span className="text-[9px] uppercase tracking-widest text-rose-300/80 font-semibold">Date &amp; Time</span>
                </div>
                <p className="text-white text-sm font-light leading-snug">{dateStr}</p>
                {event.time && <p className="text-rose-300/60 text-xs mt-0.5 font-mono">{formatTime(event.time)}</p>}
              </div>

              <div
                className="rounded-2xl p-4 group hover:scale-[1.02] transition-transform duration-300"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span>📍</span>
                  <span className="text-[9px] uppercase tracking-widest text-rose-300/80 font-semibold">Venue</span>
                </div>
                <p className="text-white text-sm font-light leading-snug">{event.venue}</p>
                {event.location && <p className="text-rose-300/60 text-xs mt-0.5">{event.location}</p>}
                {event.maps_url && (
                  <a
                    href={event.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-400 text-xs mt-1.5 inline-block hover:text-rose-300 transition-colors"
                  >
                    View on Maps →
                  </a>
                )}
              </div>
            </div>

            {/* Countdown */}
            {!countdown.past && (
              <div className="mb-6 text-center">
                <p className="text-[9px] uppercase tracking-widest text-rose-300/50 mb-3">Counting down to forever</p>
                <div className="flex items-start justify-center gap-2 md:gap-3">
                  <CountCell value={countdown.days}    label="Days"    />
                  <div className="h-14 md:h-16 flex items-center justify-center"><span className="text-rose-400 text-xl font-light pb-1">:</span></div>
                  <CountCell value={countdown.hours}   label="Hours"   />
                  <div className="h-14 md:h-16 flex items-center justify-center"><span className="text-rose-400 text-xl font-light pb-1">:</span></div>
                  <CountCell value={countdown.minutes} label="Min"     />
                  <div className="h-14 md:h-16 flex items-center justify-center"><span className="text-rose-400 text-xl font-light pb-1">:</span></div>
                  <CountCell value={countdown.seconds} label="Sec"     />
                </div>
              </div>
            )}

            <Ornament text="✦" />

            {/* RSVP Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleRsvp('yes')}
                className="w-full py-3.5 rounded-2xl text-white font-medium tracking-wide text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-glow-pulse"
                style={{
                  background: 'linear-gradient(135deg, #be123c, #9f1239)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                ✓ &nbsp; Accept with Pleasure
              </button>
              <button
                onClick={() => handleRsvp('no')}
                className="w-full py-3.5 rounded-2xl text-white/60 font-light text-sm transition-all duration-300 hover:text-white/90 hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Regretfully Decline
              </button>
            </div>

            {event?.contact && (
              <p className="text-center text-white/30 text-xs mt-5">
                Questions?{' '}
                <a href={`tel:${event.contact}`} className="text-rose-400/70 hover:text-rose-300 transition-colors">
                  {event.contact}
                </a>
              </p>
            )}

            {/* Bottom ornament */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-400/20 to-transparent" />
              <span className="text-rose-400/30 text-xs">♥</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-rose-400/20 to-transparent" />
            </div>
          </GlassCard>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP: RSVP-YES — Guest count
        ═══════════════════════════════════════════════════════════ */}
        {step === 'rsvp-yes' && (
          <GlassCard className={`w-full max-w-md px-8 py-10 md:px-12 ${transitionClass}`}>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3 animate-heart-beat">💕</div>
              <h3 className="text-white text-2xl font-light">How many will be attending?</h3>
              <p className="text-white/40 text-sm mt-1">Including yourself</p>
            </div>

            {/* Counter */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <button
                onClick={() => setPaxCount(Math.max(0, paxCount - 1))}
                className="w-12 h-12 rounded-full text-white text-2xl font-light transition-all duration-200 hover:scale-110 flex items-center justify-center disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                disabled={paxCount === 0}
              >
                −
              </button>
              <span
                className="text-5xl font-bold tabular-nums"
                style={{
                  background: 'linear-gradient(135deg, #fff, #ffb3c6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {paxCount}
              </span>
              <button
                onClick={() => setPaxCount(paxCount + 1)}
                className="w-12 h-12 rounded-full text-white text-2xl font-light transition-all duration-200 hover:scale-110 flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                +
              </button>
            </div>



            <div className="space-y-3">
              <button
                onClick={() => submitRsvp('yes', paxCount)}
                disabled={submitting || paxCount === 0}
                className="w-full py-3.5 rounded-2xl text-white font-medium text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #be123c, #9f1239)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {submitting ? 'Confirming…' : 'Confirm Attendance'}
              </button>
              <button
                onClick={() => setStep('view')}
                disabled={submitting}
                className="w-full py-3 rounded-2xl text-white/50 font-light text-sm transition-all hover:text-white/80 disabled:opacity-50"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                ← Back
              </button>
            </div>
          </GlassCard>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP: CONFIRMED — Thank you card
        ═══════════════════════════════════════════════════════════ */}
        {step === 'confirmed' && (
          <GlassCard className={`w-full max-w-md px-8 py-12 md:px-12 text-center ${transitionClass}`}>
            {rsvpResponse === 'yes' ? (
              <>
                {/* Accepted */}
                <div className="text-5xl mb-4 animate-heart-beat">🎉</div>
                <h3
                  className="text-3xl font-serif italic mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #fff, #ffb3c6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  We Can't Wait!
                </h3>
                <p className="text-white/50 text-sm font-light mb-6 leading-relaxed">
                  Your RSVP has been confirmed. We look forward to celebrating with you!
                </p>

                {/* Pax summary */}
                <div
                  className="rounded-2xl p-5 mb-6"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-2">You will be attending with</p>
                  <p
                    className="text-4xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #fff, #ffb3c6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {paxCount}
                  </p>
                  <p className="text-white/40 text-sm">{paxCount === 1 ? 'guest' : 'guests'}</p>
                </div>
              </>
            ) : (
              <>
                {/* Declined */}
                <div className="text-5xl mb-4">🙏</div>
                <h3
                  className="text-3xl font-serif italic mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #fff, #ffb3c6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Thank You
                </h3>
                <p className="text-white/50 text-sm font-light mb-6">
                  We appreciate you letting us know. Thank you for your response.
                </p>
              </>
            )}

            <Ornament text="✦" />

            {/* Event summary */}
            <div className="text-left space-y-2 mb-6">
              <p className="text-[9px] uppercase tracking-widest text-rose-300/60 text-center mb-3">Event Details</p>
              <div
                className="rounded-2xl p-4 space-y-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">📅</span>
                  <p className="text-white/70 text-sm">{dateStr} · {formatTime(event?.time)}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">📍</span>
                  <p className="text-white/70 text-sm">{event?.venue}, {event?.location}</p>
                </div>
                {event?.maps_url && (
                  <a
                    href={event.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-400 text-xs inline-block mt-1 hover:text-rose-300 transition-colors ml-6"
                  >
                    View on Maps →
                  </a>
                )}
              </div>
            </div>

            {event?.contact && (
              <p className="text-white/25 text-xs">
                Questions?{' '}
                <a href={`tel:${event.contact}`} className="text-rose-400/60 hover:text-rose-300 transition-colors">
                  {event.contact}
                </a>
              </p>
            )}
          </GlassCard>
        )}

        {/* Footer */}
        <p className="mt-10 text-white/15 text-xs tracking-widest">
          {event?.couple_1} &amp; {event?.couple_2}
        </p>
      </div>
    </main>
  )
}
