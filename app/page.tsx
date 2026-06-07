'use client'

import { useEffect, useRef, useState } from 'react'
import { getEventCopy } from '@/lib/eventCopy'

// ── Falling hearts canvas ─────────────────────────────────────────────────────
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
      'rgba(190,18,60,0.7)',
      'rgba(225,80,120,0.6)',
      'rgba(251,207,232,0.8)',
      'rgba(244,63,94,0.65)',
      'rgba(255,192,203,0.75)',
      'rgba(160,0,50,0.5)',
    ]

    type Heart = {
      x: number; y: number; size: number; speed: number
      opacity: number; sway: number; swaySpeed: number; phase: number
      colour: string; rotation: number; rotSpeed: number
    }

    const make = (): Heart => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      size: 8 + Math.random() * 18,
      speed: 0.6 + Math.random() * 1.4,
      opacity: 0.4 + Math.random() * 0.6,
      sway: 30 + Math.random() * 60,
      swaySpeed: 0.005 + Math.random() * 0.01,
      phase: Math.random() * Math.PI * 2,
      colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
    })

    const hearts: Heart[] = Array.from({ length: 28 }, make)

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
        if (h.y > canvas.height + 30) {
          Object.assign(h, make(), { y: -20 })
        }
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
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  )
}

// ── Countdown helpers ─────────────────────────────────────────────────────────
function useCountdown(targetDate: string | undefined) {
  const calc = () => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: false }
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
    if (!targetDate) return
    const id = setInterval(() => setTick(calc()), 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return tick
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

function CountCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(190,18,60,0.9), rgba(120,0,40,0.95))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-rose-300 mt-2 font-medium">{label}</span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [splashDone, setSplashDone] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const countdown = useCountdown(event?.date)
  const copy = getEventCopy(event?.event_template)

  useEffect(() => {
    fetch('/api/event')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setEvent(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Splash fades after 2.8 s, content fades in 0.3 s later
  useEffect(() => {
    const t1 = setTimeout(() => setSplashDone(true), 2800)
    const t2 = setTimeout(() => setContentVisible(true), 3100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const dateStr = event?.date
    ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  // ── Splash screen ─────────────────────────────────────────────────────────
  if (!splashDone) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3d0020 0%, #6d0035 40%, #3d0020 100%)',
          transition: 'opacity 0.6s ease',
        }}
      >
        {/* Soft glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 animate-pulse-ring"
          style={{ background: 'radial-gradient(circle, rgba(255,100,130,0.6), transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15 animate-pulse-ring delay-500"
          style={{ background: 'radial-gradient(circle, rgba(255,150,180,0.5), transparent 70%)' }} />

        {/* Spinning ring */}
        <div className="relative mb-8">
          <div
            className="w-28 h-28 rounded-full animate-rotate-slow"
            style={{
              border: '1px solid transparent',
              borderTopColor: 'rgba(255,150,180,0.6)',
              borderRightColor: 'rgba(255,100,130,0.3)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl animate-heart-beat select-none">💍</span>
          </div>
        </div>

        <p className="animate-fade-in-up text-rose-200 text-sm uppercase tracking-[0.3em] font-light mb-3">
          You are cordially invited
        </p>
        <h1
          className="animate-fade-in-up delay-300 text-4xl md:text-5xl font-serif italic text-white text-center px-6"
          style={{ textShadow: '0 0 40px rgba(255,100,130,0.5)' }}
        >
          {copy.splashHeading}
        </h1>
        <p className="animate-fade-in delay-700 text-rose-300/70 text-xs tracking-widest mt-4">
          ✦ &nbsp; ✦ &nbsp; ✦
        </p>
      </div>
    )
  }

  // ── Main invitation ───────────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(160deg, #1a0010 0%, #3d0020 30%, #6d1040 60%, #3d0020 100%)',
      }}
    >
      {/* Ambient glow blobs — behind everything */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-0 w-[600px] h-[600px] opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, rgba(255,80,120,0.5) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-15 animate-float delay-500"
          style={{ background: 'radial-gradient(circle, rgba(255,140,170,0.4) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* ── Hero section ── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-16" style={{ zIndex: 1 }}>

        {/* Falling hearts — scoped only to this section */}
        <FallingHearts />

        {/* Glass card */}
        <div
          className={`relative w-full max-w-2xl mx-auto rounded-3xl px-8 py-14 md:px-14 text-center shadow-2xl transition-all duration-1000 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            zIndex: 3,
          }}
        >
          {/* Decorative top ornament */}
          <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in-down">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />
            <span className="text-rose-300 text-xl tracking-widest">♥ ♥ ♥</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-rose-400/50 to-transparent" />
          </div>

          {/* Pre-heading */}
          <p className="animate-fade-in-up opacity-0-init delay-200 text-rose-300 text-[11px] uppercase tracking-[0.35em] font-medium mb-5">
            Together with their families
          </p>

          {/* Couple names */}
          {loading ? (
            <div className="space-y-3 mb-8">
              <div className="h-12 bg-white/10 rounded-xl animate-pulse mx-auto w-3/4" />
              <div className="h-6 bg-white/5 rounded-xl animate-pulse mx-auto w-1/2" />
            </div>
          ) : (
            <div className="mb-8">
              <h1
                className="animate-scale-in opacity-0-init delay-300 font-serif italic leading-tight"
                style={{
                  fontSize: 'clamp(2.4rem, 8vw, 4rem)',
                  background: 'linear-gradient(135deg, #fff 20%, #ffb3c6 60%, #fff 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 20px rgba(255,100,130,0.4))',
                  animation: 'scaleIn 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s forwards, shimmer 4s linear 1s infinite',
                  opacity: 0,
                }}
              >
                {event?.couple_1}
                <span
                  className="mx-3 md:mx-4 text-rose-300 not-italic animate-heart-beat inline-block"
                  style={{ WebkitTextFillColor: 'initial', filter: 'none', fontSize: '0.7em' }}
                >
                  ♥
                </span>
                {event?.couple_2}
              </h1>
            </div>
          )}

          {/* Sub-tagline */}
          <p className="animate-fade-in-up opacity-0-init delay-500 text-white/70 text-lg font-light leading-relaxed mb-2">
            Request the honour of your presence
          </p>
          <p className="animate-fade-in-up opacity-0-init delay-600 text-rose-300/80 text-sm font-light tracking-wide mb-10">
            {copy.atLine}
          </p>

          {/* Divider */}
          <div className="animate-fade-in opacity-0-init delay-700 flex items-center justify-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />
            <span className="text-rose-400/60 text-xs tracking-widest">✦</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-rose-400/30 to-transparent" />
          </div>

          {/* Date & Venue cards */}
          {!loading && event && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 animate-fade-in-up opacity-0-init delay-700">
              {/* Date card */}
              <div
                className="rounded-2xl p-5 text-left group hover:scale-105 transition-transform duration-300 cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📅</span>
                  <span className="text-[10px] uppercase tracking-widest text-rose-300 font-semibold">Date & Time</span>
                </div>
                <p className="text-white font-light text-sm leading-relaxed">{dateStr || 'To Be Announced'}</p>
                {event.time && (
                  <p className="text-rose-300/70 text-xs mt-1 font-mono">{formatTime(event.time)}</p>
                )}
              </div>

              {/* Venue card */}
              <div
                className="rounded-2xl p-5 text-left group hover:scale-105 transition-transform duration-300 cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📍</span>
                  <span className="text-[10px] uppercase tracking-widest text-rose-300 font-semibold">Venue</span>
                </div>
                <p className="text-white font-light text-sm">{event.venue || 'TBD'}</p>
                {event.location && (
                  <p className="text-rose-300/70 text-xs mt-1">{event.location}</p>
                )}
              </div>
            </div>
          )}

          {/* Live countdown */}
          {!loading && event?.date && !countdown.past && (
            <div className="animate-fade-in-up opacity-0-init delay-800 mb-10">
              <p className="text-rose-300/60 text-[10px] uppercase tracking-widest mb-4">{copy.countdownLabel}</p>
              <div className="flex items-start justify-center gap-2 md:gap-5">
                <CountCell value={countdown.days}    label="Days"    />
                <div className="h-16 md:h-20 flex items-center justify-center"><span className="text-rose-400 text-2xl font-light pb-2">:</span></div>
                <CountCell value={countdown.hours}   label="Hours"   />
                <div className="h-16 md:h-20 flex items-center justify-center"><span className="text-rose-400 text-2xl font-light pb-2">:</span></div>
                <CountCell value={countdown.minutes} label="Minutes" />
                <div className="h-16 md:h-20 flex items-center justify-center"><span className="text-rose-400 text-2xl font-light pb-2">:</span></div>
                <CountCell value={countdown.seconds} label="Seconds" />
              </div>
            </div>
          )}



          {/* Bottom ornament */}
          <div className="animate-fade-in opacity-0-init delay-1200 flex items-center justify-center gap-3 mt-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />
            <span className="text-rose-400/50 text-xs tracking-widest">♥ ♥ ♥</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-rose-400/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className={`relative text-center py-10 px-4 transition-all duration-1000 delay-1000 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ zIndex: 1 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-rose-700/40" />
          <span className="text-rose-700/50 text-lg">♥</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-rose-700/40" />
        </div>
        <p className="text-white/30 text-xs tracking-widest uppercase">{copy.footerTagline}</p>
        {event?.contact && (
          <p className="text-white/20 text-xs mt-2">Contact: {event.contact}</p>
        )}
        <p className="text-white/10 text-[10px] mt-4">
          {event ? `${event.couple_1} & ${event.couple_2}` : ''}
        </p>
      </footer>
    </main>
  )
}
