'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Invitation } from '@/components/ui/invitation'
import { allBirthdayPersons, formatBirthdayPersonsDisplay } from '@/lib/birthdayPersons'
import { getEventCopy } from '@/lib/eventCopy'
import { buildInvitationConfig } from '@/lib/invitation-config'

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

function getMapsUrl(raw: string | undefined): string {
  if (!raw) return ''
  // Already a full URL — use as-is
  if (/^https?:\/\//i.test(raw)) return raw
  // Plain address, plus code, or partial URL — open via Google Maps search
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw)}`
}

type Step = 'view' | 'rsvp-yes' | 'confirmed'

// ─────────────────────────────────────────────────────────────
//  WEDDING / ENGAGEMENT — MODERN LUXURY THEME
// ─────────────────────────────────────────────────────────────

const WEDDING_IMAGES = {
  hero: '/invitations/couple-standing.png',
  accent: '/invitations/couple-sitting.png',
  groomBw: '/invitations/groom-portrait.png',
  coupleBw: '/invitations/couple-portrait.png',
  bride: '/invitations/bride-portrait.png',
}

const LUXURY = {
  ivory: '#FAF7F2',
  beige: '#F5F0E8',
  champagne: '#E8DFD0',
  gold: '#C9A96E',
  goldDark: '#A68B4B',
  black: '#1A1A1A',
  charcoal: '#2D2A26',
  muted: '#6B6560',
}

function useScrollReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return { ref, visible }
}

function Reveal({
  children,
  className = '',
  delay = 0,
  scale = false,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  scale?: boolean
}) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>(delay)
  return (
    <div
      ref={ref}
      className={`reveal-init ${scale ? 'reveal-scale' : ''} ${visible ? 'reveal-visible' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

function LiquidGlass({
  children,
  className = '',
  dark = false,
}: {
  children: React.ReactNode
  className?: string
  dark?: boolean
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${dark ? 'liquid-glass-dark' : 'liquid-glass'} ${className}`}>
      <div className="absolute inset-0 liquid-glass-shine pointer-events-none" aria-hidden />
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}

function BentoImage({
  src,
  alt,
  className = '',
  grayscale = false,
  priority = false,
  sizes = '50vw',
}: {
  src: string
  alt: string
  className?: string
  grayscale?: boolean
  priority?: boolean
  sizes?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl bento-tile ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`object-cover object-center animate-ken-burns ${grayscale ? 'img-bw' : ''}`}
        sizes={sizes}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.15) 0%, transparent 45%)' }}
      />
    </div>
  )
}

function FullBleedBwImage({ src, alt, grayscale = true }: { src: string; alt: string; grayscale?: boolean }) {
  return (
    <div className="relative w-full h-[52vw] max-h-[420px] min-h-[240px] overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover object-center ${grayscale ? 'img-bw' : 'animate-ken-burns'}`}
        sizes="100vw"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(250,247,242,0.3) 0%, transparent 20%, transparent 80%, rgba(250,247,242,0.5) 100%)' }}
      />
    </div>
  )
}

function WeddingCountCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-14 h-14 md:w-16 md:h-16 rounded-sm flex items-center justify-center text-xl md:text-2xl font-invite-serif font-medium tabular-nums"
        style={{
          background: LUXURY.ivory,
          border: `1px solid ${LUXURY.gold}`,
          color: LUXURY.black,
        }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span
        className="text-[9px] uppercase tracking-[0.22em] mt-1.5 font-invite-sans font-medium"
        style={{ color: LUXURY.muted }}
      >
        {label}
      </span>
    </div>
  )
}

function WeddingLuxuryCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-sm ${className}`}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${LUXURY.champagne}`,
        boxShadow: '0 20px 60px rgba(26, 26, 26, 0.06)',
      }}
    >
      {children}
    </div>
  )
}

function WeddingOrnament({ text = '—' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-4 my-7">
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${LUXURY.gold}55, transparent)` }} />
      <span className="text-[10px] tracking-[0.35em] font-invite-sans uppercase" style={{ color: LUXURY.gold }}>
        {text}
      </span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(270deg, transparent, ${LUXURY.gold}55, transparent)` }} />
    </div>
  )
}

function WeddingHeroImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <div className="relative w-full mx-auto" style={{ maxWidth: 380 }}>
      <div
        className="relative overflow-hidden animate-luxury-reveal"
        style={{
          borderRadius: '50% 50% 12px 12px / 38% 38% 12px 12px',
          border: `1.5px solid ${LUXURY.gold}`,
          boxShadow: '0 24px 48px rgba(26, 26, 26, 0.08)',
          aspectRatio: '3 / 4',
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover object-center animate-ken-burns"
          sizes="(max-width: 768px) 90vw, 380px"
        />
      </div>
      <div
        className="absolute -top-2 -left-2 w-16 h-16 rounded-full opacity-40 pointer-events-none"
        style={{ border: `1px solid ${LUXURY.gold}` }}
      />
      <div
        className="absolute -bottom-1 -right-1 w-12 h-12 rounded-full opacity-30 pointer-events-none"
        style={{ border: `1px solid ${LUXURY.gold}` }}
      />
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

function BirthdayInvitation({ guest, event, copy, step, setStep, paxCount, setPaxCount, submitting, handleRsvp, submitRsvp, rsvpResponse, transitionClass, open }: any) {
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
          {!open && (
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
          )}
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
                    href={getMapsUrl(event.maps_url)}
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

            {!open && (
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
            )}

            {event?.contact && (
              <p className="text-center text-white/30 text-xs mt-5">
                <a href={`tel:${event.contact}`} className="text-purple-400/70 hover:text-purple-300 transition-colors">
                  Contact Us
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
        {!open && step === 'rsvp-yes' && (
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
        {!open && step === 'confirmed' && (
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
                    href={getMapsUrl(event.maps_url)}
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
                <a href={`tel:${event.contact}`} className="text-purple-400/60 hover:text-purple-300 transition-colors">
                  Contact Us
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

function WeddingInvitation({ guest, event, copy, step, setStep, paxCount, setPaxCount, submitting, handleRsvp, submitRsvp, rsvpResponse, transitionClass, open }: any) {
  const countdown = useCountdown(event.date)
  const dateStr = event?.date
    ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''
  const dateUpper = event?.date
    ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      }).toUpperCase()
    : ''
  const coupleLabel = `${event?.couple_1 ?? ''} & ${event?.couple_2 ?? ''}`.trim()

  return (
    <main
      className="min-h-screen relative overflow-x-hidden font-invite-sans invite-smooth-scroll"
      style={{ background: `linear-gradient(180deg, ${LUXURY.ivory} 0%, ${LUXURY.beige} 40%, ${LUXURY.champagne} 100%)` }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full animate-float-soft opacity-40"
          style={{ background: `radial-gradient(circle, ${LUXURY.gold}33, transparent 70%)` }}
        />
        <div
          className="absolute bottom-1/4 -left-16 w-56 h-56 rounded-full animate-float-soft opacity-30"
          style={{ background: `radial-gradient(circle, ${LUXURY.champagne}, transparent 70%)`, animationDelay: '2s' }}
        />
      </div>

      <div className="relative max-w-xl mx-auto" style={{ zIndex: 2 }}>

        {/* ══ STEP: VIEW — scrollable editorial layout ══ */}
        {step === 'view' && (
          <>
            {/* ── Hero ── */}
            <section className="px-5 pt-10 pb-4">
              <Reveal className="text-center mb-8">
                <p className="text-[10px] uppercase tracking-[0.42em] font-medium mb-4" style={{ color: LUXURY.goldDark }}>
                  Cordially invites you
                </p>
                {!open && (
                  <h2
                    className="font-invite-serif font-light leading-snug"
                    style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: LUXURY.black }}
                  >
                    Dear <span className="italic" style={{ color: LUXURY.charcoal }}>{guest.name}</span>
                  </h2>
                )}
              </Reveal>

              <Reveal delay={100} scale>
                <WeddingHeroImage src={WEDDING_IMAGES.hero} alt={coupleLabel || 'Couple portrait'} priority />
              </Reveal>

              {/* Overlapping liquid-glass name card */}
              <Reveal delay={200} className="-mt-8 mx-1 mb-10">
                <LiquidGlass className="px-7 py-8 md:px-9 md:py-10">
                  <div className="text-center">
                    <h1
                      className="font-invite-serif font-semibold leading-none tracking-[0.06em] uppercase"
                      style={{ fontSize: 'clamp(1.6rem, 6.5vw, 2.5rem)', color: LUXURY.black }}
                    >
                      {event?.couple_1}
                    </h1>
                    <p className="font-invite-serif italic my-2 text-xl" style={{ color: LUXURY.gold }}>&amp;</p>
                    <h1
                      className="font-invite-serif font-semibold leading-none tracking-[0.06em] uppercase"
                      style={{ fontSize: 'clamp(1.6rem, 6.5vw, 2.5rem)', color: LUXURY.black }}
                    >
                      {event?.couple_2}
                    </h1>
                    <WeddingOrnament />
                    <p className="font-invite-serif italic leading-relaxed mb-1" style={{ color: LUXURY.muted }}>
                      {copy.requestLine}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.28em] font-medium" style={{ color: LUXURY.goldDark }}>
                      {copy.atLine}
                    </p>
                  </div>
                </LiquidGlass>
              </Reveal>
            </section>

            {/* ── Full-bleed portrait ── */}
            <Reveal>
              <FullBleedBwImage
                src={WEDDING_IMAGES.accent}
                alt={`${coupleLabel} together`}
                grayscale={false}
              />
            </Reveal>

            {/* ── Bento grid ── */}
            <section className="px-5 py-10">
              <Reveal>
                <p className="text-[10px] uppercase tracking-[0.35em] text-center mb-5 font-medium" style={{ color: LUXURY.goldDark }}>
                  Our Story
                </p>
              </Reveal>

              <div className="grid grid-cols-2 gap-3 auto-rows-[130px] md:auto-rows-[150px]">
                <Reveal delay={0} scale className="col-span-1 row-span-2">
                  <BentoImage
                    src={WEDDING_IMAGES.bride}
                    alt={`${event?.couple_2 ?? 'Bride'} portrait`}
                    grayscale
                    className="h-full min-h-[270px] md:min-h-[310px]"
                    sizes="40vw"
                  />
                </Reveal>

                <Reveal delay={80} className="col-span-1 row-span-1">
                  <LiquidGlass className="h-full p-4 flex flex-col justify-center">
                    <p className="text-[9px] uppercase tracking-[0.26em] mb-1 font-medium" style={{ color: LUXURY.goldDark }}>Date</p>
                    <p className="font-invite-serif text-sm leading-snug" style={{ color: LUXURY.black }}>{dateStr || '—'}</p>
                    {event?.time && (
                      <p className="font-invite-serif italic text-xs mt-1" style={{ color: LUXURY.muted }}>{formatTime(event.time)}</p>
                    )}
                  </LiquidGlass>
                </Reveal>

                <Reveal delay={160} className="col-span-1 row-span-1">
                  <BentoImage
                    src={WEDDING_IMAGES.groomBw}
                    alt={`${event?.couple_1 ?? 'Groom'} portrait`}
                    grayscale
                    className="h-full"
                    sizes="40vw"
                  />
                </Reveal>

                <Reveal delay={240} className="col-span-2 row-span-1">
                  <LiquidGlass dark className="h-full min-h-[120px] p-5 flex flex-col justify-center">
                    <p className="text-[9px] uppercase tracking-[0.26em] mb-1.5 font-medium" style={{ color: LUXURY.gold }}>Venue</p>
                    <p className="font-invite-serif text-base leading-snug text-white">{event?.venue}</p>
                    {event?.location && (
                      <p className="text-xs mt-1 text-white/60">{event.location}</p>
                    )}
                    {event?.maps_url && (
                      <a
                        href={getMapsUrl(event.maps_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-[9px] uppercase tracking-[0.22em] font-medium transition-opacity hover:opacity-70"
                        style={{ color: LUXURY.gold }}
                      >
                        View on Maps →
                      </a>
                    )}
                  </LiquidGlass>
                </Reveal>
              </div>
            </section>

            {/* ── B&W couple portrait — full bleed ── */}
            <Reveal>
              <FullBleedBwImage src={WEDDING_IMAGES.coupleBw} alt={`${coupleLabel} portrait`} />
            </Reveal>

            {/* ── Countdown + RSVP ── */}
            <section className="px-5 py-10 pb-16">
              {event?.date && (
                <Reveal className="mb-8">
                  <LiquidGlass className="px-6 py-8 text-center">
                    <p className="text-[9px] uppercase tracking-[0.3em] mb-5 font-medium" style={{ color: LUXURY.muted }}>
                      {copy.countdownLabel}
                    </p>
                    <div className="flex items-start justify-center gap-2 md:gap-3">
                      <WeddingCountCell value={countdown.days} label="Days" />
                      <div className="h-14 md:h-16 flex items-center justify-center">
                        <span className="text-xl font-light pb-1" style={{ color: LUXURY.gold }}>:</span>
                      </div>
                      <WeddingCountCell value={countdown.hours} label="Hours" />
                      <div className="h-14 md:h-16 flex items-center justify-center">
                        <span className="text-xl font-light pb-1" style={{ color: LUXURY.gold }}>:</span>
                      </div>
                      <WeddingCountCell value={countdown.minutes} label="Min" />
                      <div className="h-14 md:h-16 flex items-center justify-center">
                        <span className="text-xl font-light pb-1" style={{ color: LUXURY.gold }}>:</span>
                      </div>
                      <WeddingCountCell value={countdown.seconds} label="Sec" />
                    </div>
                  </LiquidGlass>
                </Reveal>
              )}

              {!open && (
                <Reveal delay={100}>
                  <LiquidGlass className="px-6 py-7 space-y-3">
                    <button
                      onClick={() => handleRsvp('yes')}
                      className="w-full py-3.5 rounded-xl text-white font-medium tracking-[0.12em] uppercase text-[11px] transition-all duration-500 hover:opacity-90 hover:scale-[1.01] animate-glow-pulse-gold"
                      style={{ background: LUXURY.black, border: `1px solid ${LUXURY.gold}` }}
                    >
                      Accept with Pleasure
                    </button>
                    <button
                      onClick={() => handleRsvp('no')}
                      className="w-full py-3.5 rounded-xl font-light text-[11px] uppercase tracking-[0.12em] transition-all duration-300 hover:bg-black/[0.04]"
                      style={{ border: `1px solid ${LUXURY.champagne}`, color: LUXURY.muted }}
                    >
                      Regretfully Decline
                    </button>
                  </LiquidGlass>
                </Reveal>
              )}

              {event?.contact && (
                <Reveal delay={150} className="text-center mt-8">
                  <p className="text-xs tracking-wide" style={{ color: LUXURY.muted }}>
                    Questions?{' '}
                    <a href={`tel:${event.contact}`} className="transition-opacity hover:opacity-70" style={{ color: LUXURY.goldDark }}>
                      {event.contact}
                    </a>
                  </p>
                </Reveal>
              )}

              <Reveal delay={200} className="mt-12 text-center">
                <p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: LUXURY.muted }}>
                  {event?.couple_1} &amp; {event?.couple_2}
                </p>
              </Reveal>
            </section>
          </>
        )}

        {/* ══ STEP: RSVP-YES ══ */}
        {!open && step === 'rsvp-yes' && (
          <section className="px-5 py-14 min-h-[70vh] flex items-center">
            <Reveal className="w-full">
              <LiquidGlass className={`w-full px-8 py-10 md:px-12 ${transitionClass}`}>
                <div className="text-center mb-8">
                  <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: LUXURY.goldDark }}>
                    Attendance
                  </p>
                  <h3 className="font-invite-serif text-2xl font-light" style={{ color: LUXURY.black }}>
                    How many will be attending?
                  </h3>
                  <p className="text-sm mt-1" style={{ color: LUXURY.muted }}>Including yourself</p>
                </div>

                <div className="flex items-center justify-center gap-6 mb-8">
                  <button
                    onClick={() => setPaxCount(Math.max(0, paxCount - 1))}
                    className="w-12 h-12 rounded-xl text-2xl font-light transition-all duration-300 hover:scale-105 flex items-center justify-center disabled:opacity-30"
                    style={{ background: LUXURY.beige, border: `1px solid ${LUXURY.champagne}`, color: LUXURY.black }}
                    disabled={paxCount === 0}
                  >
                    −
                  </button>
                  <span className="text-5xl font-invite-serif font-semibold tabular-nums" style={{ color: LUXURY.black }}>
                    {paxCount}
                  </span>
                  <button
                    onClick={() => setPaxCount(paxCount + 1)}
                    className="w-12 h-12 rounded-xl text-2xl font-light transition-all duration-300 hover:scale-105 flex items-center justify-center"
                    style={{ background: LUXURY.beige, border: `1px solid ${LUXURY.champagne}`, color: LUXURY.black }}
                  >
                    +
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => submitRsvp('yes', paxCount)}
                    disabled={submitting || paxCount === 0}
                    className="w-full py-3.5 rounded-xl text-white font-medium text-[11px] uppercase tracking-[0.12em] transition-all duration-300 hover:opacity-90 disabled:opacity-60"
                    style={{ background: LUXURY.black, border: `1px solid ${LUXURY.gold}` }}
                  >
                    {submitting ? 'Confirming…' : 'Confirm Attendance'}
                  </button>
                  <button
                    onClick={() => setStep('view')}
                    disabled={submitting}
                    className="w-full py-3 rounded-xl font-light text-sm transition-all hover:opacity-70 disabled:opacity-50"
                    style={{ border: `1px solid ${LUXURY.champagne}`, color: LUXURY.muted }}
                  >
                    ← Back
                  </button>
                </div>
              </LiquidGlass>
            </Reveal>
          </section>
        )}

        {/* ══ STEP: CONFIRMED ══ */}
        {!open && step === 'confirmed' && (
          <section className="px-5 py-14 min-h-[70vh] flex items-center">
            <Reveal className="w-full">
              <LiquidGlass className={`w-full px-8 py-12 md:px-12 text-center ${transitionClass}`}>
            {rsvpResponse === 'yes' ? (
              <>
                <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: LUXURY.goldDark }}>
                  Confirmed
                </p>
                <h3 className="font-invite-serif text-3xl font-light mb-2" style={{ color: LUXURY.black }}>
                  We Can&apos;t Wait!
                </h3>
                <p className="text-sm font-light mb-6 leading-relaxed" style={{ color: LUXURY.muted }}>
                  Your RSVP has been confirmed. We look forward to celebrating with you.
                </p>

                <div
                  className="rounded-sm p-5 mb-6"
                  style={{ background: LUXURY.beige, border: `1px solid ${LUXURY.champagne}` }}
                >
                  <p className="text-[9px] uppercase tracking-[0.26em] mb-2" style={{ color: LUXURY.muted }}>
                    You will be attending with
                  </p>
                  <p className="text-4xl font-invite-serif font-semibold" style={{ color: LUXURY.black }}>
                    {paxCount}
                  </p>
                  <p className="text-sm" style={{ color: LUXURY.muted }}>{paxCount === 1 ? 'guest' : 'guests'}</p>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-invite-serif text-3xl font-light mb-2" style={{ color: LUXURY.black }}>
                  Thank You
                </h3>
                <p className="text-sm font-light mb-6" style={{ color: LUXURY.muted }}>
                  We appreciate you letting us know. Thank you for your response.
                </p>
              </>
            )}

            <WeddingOrnament text="✦" />

            <div
              className="rounded-xl p-4 space-y-2 text-left liquid-glass-dark"
            >
              <p className="text-[9px] uppercase tracking-[0.26em] text-center mb-3" style={{ color: LUXURY.gold }}>
                Event Details
              </p>
              <p className="text-sm font-invite-serif text-white">{dateStr} · {formatTime(event?.time)}</p>
              <p className="text-sm font-light text-white/75">{event?.venue}, {event?.location}</p>
              {event?.maps_url && (
                <a
                  href={getMapsUrl(event.maps_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase tracking-[0.2em] inline-block mt-1 transition-opacity hover:opacity-80"
                  style={{ color: LUXURY.gold }}
                >
                  View on Maps →
                </a>
              )}
            </div>

            {event?.contact && (
              <p className="text-xs mt-5" style={{ color: LUXURY.muted }}>
                <a href={`tel:${event.contact}`} className="transition-opacity hover:opacity-70" style={{ color: LUXURY.goldDark }}>
                  Contact Us
                </a>
              </p>
            )}
              </LiquidGlass>
            </Reveal>
          </section>
        )}

        {step !== 'view' && (
          <p
            className="px-5 pb-10 text-center text-[10px] uppercase tracking-[0.35em]"
            style={{ color: LUXURY.muted }}
          >
            {event?.couple_1} &amp; {event?.couple_2}
          </p>
        )}
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT — routes to correct theme
// ─────────────────────────────────────────────────────────────

export default function InvitationClient({ guest, event, open = false }: { guest?: any; event: any; open?: boolean }) {
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
    open,
  }

  // Route to the correct themed experience
  if (event.event_template === 'Birthday') {
    return <BirthdayInvitation {...sharedProps} />
  }

  const config = buildInvitationConfig(event, guest)
  return (
    <div className="invite-root relative">
      <Invitation config={config} openInvite={open} />
    </div>
  )
}
