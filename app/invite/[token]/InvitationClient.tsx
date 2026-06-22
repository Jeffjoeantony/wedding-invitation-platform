'use client'

import { useEffect, useRef, useState } from 'react'
import { getEventCopy } from '@/lib/eventCopy'
import { allBirthdayPersons, formatBirthdayPersonsDisplay } from '@/lib/birthdayPersons'

// ─────────────────────────────────────────────────────────────
//  SHARED UTILITIES
// ─────────────────────────────────────────────────────────────

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

function formatTime(time: string | undefined): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return time
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

type Step = 'view' | 'rsvp-yes' | 'confirmed'

// ─────────────────────────────────────────────────────────────
//  WEDDING / ENGAGEMENT THEME COMPONENTS
// ─────────────────────────────────────────────────────────────

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
      'rgba(190,18,60,0.65)', 'rgba(225,80,120,0.55)',
      'rgba(251,207,232,0.7)', 'rgba(244,63,94,0.6)',
      'rgba(255,192,203,0.7)', 'rgba(160,0,50,0.45)',
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
      ctx.bezierCurveTo(s * 0.8, -s * 1.2, s * 1.6, s * 0.2, 0, s)
      ctx.bezierCurveTo(-s * 1.6, s * 0.2, -s * 0.8, -s * 1.2, 0, -s * 0.4)
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

function WeddingCountCell({ value, label }: { value: number; label: string }) {
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

function WeddingGlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
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

function WeddingOrnament({ text = '♥ ♥ ♥' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />
      <span className="text-rose-400/50 text-xs tracking-widest">{text}</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-rose-400/30 to-transparent" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  BIRTHDAY THEME COMPONENTS
// ─────────────────────────────────────────────────────────────

function FallingConfetti() {
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

    // Birthday colour palette: gold, purple, pink, cyan, orange
    const COLOURS = [
      'rgba(251,191,36,0.85)',   // gold
      'rgba(167,139,250,0.8)',   // purple
      'rgba(244,114,182,0.8)',   // pink
      'rgba(34,211,238,0.75)',   // cyan
      'rgba(251,146,60,0.8)',    // orange
      'rgba(52,211,153,0.75)',   // emerald
      'rgba(255,255,255,0.7)',   // white
    ]

    type Piece = {
      x: number; y: number; w: number; h: number; speed: number
      colour: string; rotation: number; rotSpeed: number
      sway: number; swaySpeed: number; phase: number
      shape: 'rect' | 'circle' | 'star'
    }

    const make = (): Piece => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 300,
      w: 6 + Math.random() * 10,
      h: 4 + Math.random() * 8,
      speed: 0.8 + Math.random() * 1.8,
      colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.07,
      sway: 20 + Math.random() * 50,
      swaySpeed: 0.004 + Math.random() * 0.008,
      phase: Math.random() * Math.PI * 2,
      shape: (['rect', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
    })

    const pieces: Piece[] = Array.from({ length: 55 }, make)

    const drawStar = (ctx: CanvasRenderingContext2D, r: number) => {
      const spikes = 5
      const outerR = r
      const innerR = r * 0.4
      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes - Math.PI / 2
        const radius = i % 2 === 0 ? outerR : innerR
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
    }

    let t = 0
    let raf: number
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t++
      pieces.forEach((p) => {
        p.y += p.speed
        p.rotation += p.rotSpeed
        if (p.y > canvas.height + 30) Object.assign(p, make(), { y: -20 })

        const x = p.x + Math.sin(t * p.swaySpeed + p.phase) * p.sway
        ctx.save()
        ctx.translate(x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = 0.8
        ctx.fillStyle = p.colour

        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.shape === 'star') {
          drawStar(ctx, p.w / 2)
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        }

        ctx.restore()
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

function BirthdayCountCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg tabular-nums"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(79,70,229,0.95))',
          border: '1px solid rgba(251,191,36,0.35)',
          boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
        }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[9px] uppercase tracking-widest text-yellow-300/70 mt-1.5 font-medium">{label}</span>
    </div>
  )
}

function BirthdayGlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(251,191,36,0.2)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(251,191,36,0.12)',
      }}
    >
      {children}
    </div>
  )
}

function BirthdayOrnament({ text = '🎂 🎉 🎈' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
      <span className="text-yellow-400/60 text-xs tracking-widest">{text}</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-yellow-400/30 to-transparent" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  BIRTHDAY INVITATION VIEW
// ─────────────────────────────────────────────────────────────

function BirthdayInvitation({ guest, event, copy, step, setStep, paxCount, setPaxCount, submitting, handleRsvp, submitRsvp, rsvpResponse, transitionClass }: any) {
  const countdown = useCountdown(event.date)
  const dateStr = event?.date
    ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  return (
    <main
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(160deg, #0f0520 0%, #1e0938 30%, #2d1060 60%, #1a0530 100%)',
      }}
    >
      <FallingConfetti />

      {/* Ambient glows — purple + gold */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div
          className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.6), transparent 70%)', borderRadius: '50%' }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-[400px] h-[400px] opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.5), transparent 70%)', borderRadius: '50%' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-10"
          style={{ background: 'radial-gradient(ellipse, rgba(244,114,182,0.4), transparent 70%)', borderRadius: '50%' }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-16" style={{ zIndex: 2 }}>

        {/* ── Greeting header ── */}
        <div className={`text-center mb-8 ${transitionClass}`}>
          <p className="text-[11px] uppercase tracking-[0.35em] text-yellow-300/80 font-medium mb-3">
            🎉 You&apos;re Invited!
          </p>
          <h2
            className="font-light text-white leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)' }}
          >
            Hey,{' '}
            <span
              className="font-bold"
              style={{
                background: 'linear-gradient(135deg, #fde68a 20%, #f59e0b 55%, #fde68a 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 18px rgba(251,191,36,0.5))',
              }}
            >
              {guest.name}
            </span>
            !
          </h2>
        </div>

        {/* ══ STEP: VIEW ══ */}
        {step === 'view' && (
          <BirthdayGlassCard className={`w-full max-w-xl px-8 py-10 md:px-12 ${transitionClass}`}>

            {/* Balloons header decoration */}
            <div className="flex items-center justify-center gap-2 mb-6 text-2xl">
              <span style={{ filter: 'drop-shadow(0 0 6px rgba(244,114,182,0.6))' }}>🎈</span>
              <span style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.6))' }}>🎂</span>
              <span style={{ filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.6))' }}>🎈</span>
            </div>

            {/* Celebrant name */}
            <div className="text-center mb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-300/60 mb-2">{copy.preHeading}</p>
              <h1
                className="font-extrabold leading-tight mb-1"
                style={{ fontSize: 'clamp(2.4rem, 9vw, 4rem)' }}
              >
                {allBirthdayPersons(event?.couple_1, event?.couple_2).map((name, index) => (
                  <span key={`${name}-${index}`}>
                    {index > 0 && <span className="text-yellow-300/80 font-semibold"> & </span>}
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #fde68a 10%, #a78bfa 50%, #f472b6 80%, #fde68a 100%)',
                        backgroundSize: '300% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 20px rgba(167,139,250,0.4))',
                        animation: 'shimmer 5s linear infinite',
                      }}
                    >
                      {name}
                    </span>
                  </span>
                ))}
              </h1>
            </div>

            <p className="text-white/50 text-sm font-light text-center leading-relaxed mb-6">
              {copy.requestLine}
              <br />
              {copy.atLine}
            </p>

            <BirthdayOrnament />

            {/* Date & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div
                className="rounded-2xl p-4 group hover:scale-[1.02] transition-transform duration-300"
                style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span>📅</span>
                  <span className="text-[9px] uppercase tracking-widest text-purple-300/80 font-semibold">Date & Time</span>
                </div>
                <p className="text-white text-sm font-light leading-snug">{dateStr}</p>
                {event.time && <p className="text-purple-300/60 text-xs mt-0.5 font-mono">{formatTime(event.time)}</p>}
              </div>

              <div
                className="rounded-2xl p-4 group hover:scale-[1.02] transition-transform duration-300"
                style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span>📍</span>
                  <span className="text-[9px] uppercase tracking-widest text-yellow-300/80 font-semibold">Venue</span>
                </div>
                <p className="text-white text-sm font-light leading-snug">{event.venue}</p>
                {event.location && <p className="text-yellow-300/50 text-xs mt-0.5">{event.location}</p>}
                {event.maps_url && (
                  <a
                    href={event.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 text-xs mt-1.5 inline-block hover:text-yellow-200 transition-colors"
                  >
                    View on Maps →
                  </a>
                )}
              </div>
            </div>

            {/* Countdown */}
            {event?.date && (
              <div className="mb-6 text-center">
                <p className="text-[9px] uppercase tracking-widest text-yellow-300/40 mb-3">{copy.countdownLabel}</p>
                <div className="flex items-start justify-center gap-2 md:gap-3">
                  <BirthdayCountCell value={countdown.days} label="Days" />
                  <div className="h-14 md:h-16 flex items-center justify-center"><span className="text-yellow-400 text-xl font-light pb-1">:</span></div>
                  <BirthdayCountCell value={countdown.hours} label="Hours" />
                  <div className="h-14 md:h-16 flex items-center justify-center"><span className="text-yellow-400 text-xl font-light pb-1">:</span></div>
                  <BirthdayCountCell value={countdown.minutes} label="Min" />
                  <div className="h-14 md:h-16 flex items-center justify-center"><span className="text-yellow-400 text-xl font-light pb-1">:</span></div>
                  <BirthdayCountCell value={countdown.seconds} label="Sec" />
                </div>
              </div>
            )}

            <BirthdayOrnament text="✨ 🎉 ✨" />

            {/* RSVP Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleRsvp('yes')}
                className="w-full py-3.5 rounded-2xl text-white font-semibold tracking-wide text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9, #5b21b6)',
                  border: '1px solid rgba(251,191,36,0.25)',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                }}
              >
                🎉 &nbsp; Accept with Joy!
              </button>
              <button
                onClick={() => handleRsvp('no')}
                className="w-full py-3.5 rounded-2xl text-white/50 font-light text-sm transition-all duration-300 hover:text-white/80 hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Regretfully Decline
              </button>
            </div>

            {event?.contact && (
              <p className="text-center text-white/30 text-xs mt-5">
                Questions?{' '}
                <a href={`tel:${event.contact}`} className="text-purple-400/70 hover:text-purple-300 transition-colors">
                  {event.contact}
                </a>
              </p>
            )}

            {/* Bottom decoration */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
              <span className="text-yellow-400/30 text-xs">🎂</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-yellow-400/20 to-transparent" />
            </div>
          </BirthdayGlassCard>
        )}

        {/* ══ STEP: RSVP-YES ══ */}
        {step === 'rsvp-yes' && (
          <BirthdayGlassCard className={`w-full max-w-md px-8 py-10 md:px-12 ${transitionClass}`}>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🥳</div>
              <h3 className="text-white text-2xl font-light">How many will be partying?</h3>
              <p className="text-white/40 text-sm mt-1">Including yourself</p>
            </div>

            <div className="flex items-center justify-center gap-6 mb-8">
              <button
                onClick={() => setPaxCount(Math.max(0, paxCount - 1))}
                className="w-12 h-12 rounded-full text-white text-2xl font-light transition-all duration-200 hover:scale-110 flex items-center justify-center disabled:opacity-30"
                style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)' }}
                disabled={paxCount === 0}
              >
                −
              </button>
              <span
                className="text-5xl font-bold tabular-nums"
                style={{
                  background: 'linear-gradient(135deg, #fde68a, #a78bfa)',
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
                style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)' }}
              >
                +
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => submitRsvp('yes', paxCount)}
                disabled={submitting || paxCount === 0}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  border: '1px solid rgba(251,191,36,0.2)',
                }}
              >
                {submitting ? 'Confirming…' : '🎊 Confirm Attendance'}
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
          </BirthdayGlassCard>
        )}

        {/* ══ STEP: CONFIRMED ══ */}
        {step === 'confirmed' && (
          <BirthdayGlassCard className={`w-full max-w-md px-8 py-12 md:px-12 text-center ${transitionClass}`}>
            {rsvpResponse === 'yes' ? (
              <>
                <div className="text-5xl mb-4">🎊</div>
                <h3
                  className="text-3xl font-bold mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #fde68a, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Can&apos;t Wait to Party!
                </h3>
                <p className="text-white/50 text-sm font-light mb-6 leading-relaxed">
                  Your RSVP is confirmed. Get ready for a fantastic celebration!
                </p>

                <div
                  className="rounded-2xl p-5 mb-6"
                  style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}
                >
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Attending with</p>
                  <p
                    className="text-4xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #fde68a, #a78bfa)',
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
                <div className="text-5xl mb-4">🙏</div>
                <h3
                  className="text-3xl font-bold mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #fde68a, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Thank You
                </h3>
                <p className="text-white/50 text-sm font-light mb-6">
                  We appreciate you letting us know. You will be missed!
                </p>
              </>
            )}

            <BirthdayOrnament text="✨ 🎂 ✨" />

            <div className="text-left space-y-2 mb-6">
              <p className="text-[9px] uppercase tracking-widest text-yellow-300/50 text-center mb-3">Event Details</p>
              <div
                className="rounded-2xl p-4 space-y-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.15)' }}
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
                    className="text-yellow-400 text-xs inline-block mt-1 hover:text-yellow-200 transition-colors ml-6"
                  >
                    View on Maps →
                  </a>
                )}
              </div>
            </div>

            {event?.contact && (
              <p className="text-white/25 text-xs">
                Questions?{' '}
                <a href={`tel:${event.contact}`} className="text-purple-400/60 hover:text-purple-300 transition-colors">
                  {event.contact}
                </a>
              </p>
            )}
          </BirthdayGlassCard>
        )}

        {/* Footer */}
        <p className="mt-10 text-white/15 text-xs tracking-widest">
          {formatBirthdayPersonsDisplay(event?.couple_1, event?.couple_2)}
        </p>
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────
//  WEDDING / ENGAGEMENT INVITATION VIEW
// ─────────────────────────────────────────────────────────────

function WeddingInvitation({ guest, event, copy, step, setStep, paxCount, setPaxCount, submitting, handleRsvp, submitRsvp, rsvpResponse, transitionClass }: any) {
  const countdown = useCountdown(event.date)
  const dateStr = event?.date
    ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  return (
    <main
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(160deg, #1a0010 0%, #3d0020 35%, #6d1040 65%, #3d0020 100%)',
      }}
    >
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

        {/* ══ STEP: VIEW ══ */}
        {step === 'view' && (
          <WeddingGlassCard className={`w-full max-w-xl px-8 py-10 md:px-12 ${transitionClass}`}>

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
              {copy.requestLine}
              <br />
              {copy.atLine}
            </p>

            <WeddingOrnament />

            {/* Date & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div
                className="rounded-2xl p-4 group hover:scale-[1.02] transition-transform duration-300"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span>📅</span>
                  <span className="text-[9px] uppercase tracking-widest text-rose-300/80 font-semibold">Date & Time</span>
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
            {event?.date && (
              <div className="mb-6 text-center">
                <p className="text-[9px] uppercase tracking-widest text-rose-300/50 mb-3">{copy.countdownLabel}</p>
                <div className="flex items-start justify-center gap-2 md:gap-3">
                  <WeddingCountCell value={countdown.days} label="Days" />
                  <div className="h-14 md:h-16 flex items-center justify-center"><span className="text-rose-400 text-xl font-light pb-1">:</span></div>
                  <WeddingCountCell value={countdown.hours} label="Hours" />
                  <div className="h-14 md:h-16 flex items-center justify-center"><span className="text-rose-400 text-xl font-light pb-1">:</span></div>
                  <WeddingCountCell value={countdown.minutes} label="Min" />
                  <div className="h-14 md:h-16 flex items-center justify-center"><span className="text-rose-400 text-xl font-light pb-1">:</span></div>
                  <WeddingCountCell value={countdown.seconds} label="Sec" />
                </div>
              </div>
            )}

            <WeddingOrnament text="✦" />

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
          </WeddingGlassCard>
        )}

        {/* ══ STEP: RSVP-YES ══ */}
        {step === 'rsvp-yes' && (
          <WeddingGlassCard className={`w-full max-w-md px-8 py-10 md:px-12 ${transitionClass}`}>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3 animate-heart-beat">💕</div>
              <h3 className="text-white text-2xl font-light">How many will be attending?</h3>
              <p className="text-white/40 text-sm mt-1">Including yourself</p>
            </div>

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
          </WeddingGlassCard>
        )}

        {/* ══ STEP: CONFIRMED ══ */}
        {step === 'confirmed' && (
          <WeddingGlassCard className={`w-full max-w-md px-8 py-12 md:px-12 text-center ${transitionClass}`}>
            {rsvpResponse === 'yes' ? (
              <>
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
                  We Can&apos;t Wait!
                </h3>
                <p className="text-white/50 text-sm font-light mb-6 leading-relaxed">
                  Your RSVP has been confirmed. We look forward to celebrating with you!
                </p>

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

            <WeddingOrnament text="✦" />

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
          </WeddingGlassCard>
        )}

        {/* Footer */}
        <p className="mt-10 text-white/15 text-xs tracking-widest">
          {event?.couple_1} &amp; {event?.couple_2}
        </p>
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT — routes to correct theme
// ─────────────────────────────────────────────────────────────

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

  const copy = getEventCopy(event.event_template)

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

  const transitionClass = `transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`

  const sharedProps = {
    guest, event, copy, step, setStep,
    paxCount, setPaxCount, submitting,
    handleRsvp, submitRsvp, rsvpResponse, transitionClass,
  }

  // Route to the correct themed experience
  if (event.event_template === 'Birthday') {
    return <BirthdayInvitation {...sharedProps} />
  }

  return <WeddingInvitation {...sharedProps} />
}
