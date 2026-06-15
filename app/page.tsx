'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ── Utility ────────────────────────────────────────────────────────────────────
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

// ── useInView hook ─────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ── Animated Counter ───────────────────────────────────────────────────────────
function AnimCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView()
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ── Floating Particles ─────────────────────────────────────────────────────────
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; va: number; c: string }
    const colors = ['rgba(139,92,246,', 'rgba(236,72,153,', 'rgba(245,158,11,']
    const particles: P[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: 1 + Math.random() * 3, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      a: Math.random(), va: 0.003 + Math.random() * 0.005,
      c: colors[Math.floor(Math.random() * colors.length)],
    }))
    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.a += p.va
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.c + (0.15 + 0.2 * Math.abs(Math.sin(p.a))) + ')'
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
}

// ── Section Reveal Wrapper ─────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '', style = {} }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(36px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ── Data ───────────────────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { emoji: '💍', label: 'Weddings' },
  { emoji: '💑', label: 'Engagements' },
  { emoji: '🎂', label: 'Birthdays' },
  { emoji: '🏡', label: 'Housewarming' },
  { emoji: '👶', label: 'Baby Showers' },
  { emoji: '🎓', label: 'Graduations' },
  { emoji: '🏢', label: 'Corporate Events' },
  { emoji: '📋', label: 'Conferences' },
  { emoji: '🕌', label: 'Religious Events' },
  { emoji: '💝', label: 'Anniversaries' },
  { emoji: '✨', label: 'Custom Events' },
]

const FEATURES = [
  { icon: '🎭', title: 'Multiple Event Types', desc: 'From weddings to corporate events, create invitations for any occasion with tailored templates.' },
  { icon: '🖱️', title: 'Drag & Drop Builder', desc: 'Intuitive visual editor lets you customize every element without any design skills.' },
  { icon: '✅', title: 'RSVP Management', desc: 'Collect and track guest responses in real-time with automated confirmations.' },
  { icon: '👥', title: 'Guest List Tracking', desc: 'Manage your entire guest list, send reminders, and track attendance effortlessly.' },
  { icon: '📱', title: 'QR Code Invitations', desc: 'Generate unique QR codes for each event. Guests simply scan to RSVP instantly.' },
  { icon: '🌐', title: 'Custom Domains', desc: 'Host invitations on your own domain for a fully branded experience.' },
  { icon: '🗺️', title: 'Google Maps Integration', desc: 'Embed interactive maps so guests can easily find the venue with one tap.' },
  { icon: '📸', title: 'Photo & Video Galleries', desc: 'Add beautiful media galleries to share memories and set the mood.' },
  { icon: '🎵', title: 'Music Support', desc: 'Set the perfect ambiance with background music that plays on invitation open.' },
  { icon: '🌍', title: 'Multi-language Support', desc: 'Reach all your guests with invitations in their preferred language.' },
  { icon: '📲', title: 'Mobile Optimized', desc: 'Every invitation looks stunning on any device — phones, tablets, and desktops.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'See who opened your invitation, when, and from where with detailed insights.' },
]

const STEPS = [
  { num: '01', title: 'Choose Event Type', desc: 'Select from 11+ event categories tailored for your occasion.' },
  { num: '02', title: 'Customize Template', desc: 'Pick a premium template and personalize it with your details.' },
  { num: '03', title: 'Add Guest Details', desc: 'Import your guest list or add guests manually with ease.' },
  { num: '04', title: 'Publish Event', desc: 'Go live with a single click and get your unique event link.' },
  { num: '05', title: 'Share Link or QR Code', desc: 'Share via WhatsApp, email, or print your QR code for events.' },
  { num: '06', title: 'Track RSVPs in Dashboard', desc: 'Monitor responses, confirmations, and guest data in real-time.' },
]

const TEMPLATES = [
  { cat: 'Wedding', emoji: '💍', color: '#D72660', bg: '#FDF2F8', templates: ['Royal Bloom', 'Ivory Grace', 'Garden Love'] },
  { cat: 'Engagement', emoji: '💑', color: '#7C3AED', bg: '#F5F3FF', templates: ['Diamond Ring', 'Soft Lilac', 'Gold Rush'] },
  { cat: 'Birthday', emoji: '🎂', color: '#EA580C', bg: '#FFF7ED', templates: ['Confetti Pop', 'Midnight Glow', 'Pastel Dream'] },
  { cat: 'Corporate', emoji: '🏢', color: '#1D4ED8', bg: '#EFF6FF', templates: ['Executive Blue', 'Minimal Pro', 'Tech Summit'] },
  { cat: 'Housewarming', emoji: '🏡', color: '#059669', bg: '#ECFDF5', templates: ['Home Sweet', 'Green Garden', 'Modern Keys'] },
  { cat: 'Baby Shower', emoji: '👶', color: '#DB2777', bg: '#FDF2F8', templates: ['Cloud Nine', 'Gentle Breeze', 'Pink & Blue'] },
]

const TESTIMONIALS = [
  {
    name: 'Priya Mehta', role: 'Wedding Planner', city: 'Mumbai',
    avatar: '👩‍💼', rating: 5,
    text: 'InviteFlow has completely transformed how I plan events. The RSVP tracking alone saves me hours every week. My clients are always impressed by the beautiful invitations.',
    event: 'Managed 50+ weddings',
  },
  {
    name: 'Rahul Sharma', role: 'Event Organizer', city: 'Delhi',
    avatar: '👨‍💻', rating: 5,
    text: 'The QR code feature is brilliant. For our corporate conference with 800 attendees, we used InviteFlow and the check-in process was seamless. Highly recommend!',
    event: 'Annual Tech Summit 2024',
  },
  {
    name: 'Kavya Nair', role: 'Small Business Owner', city: 'Bangalore',
    avatar: '👩‍🎨', rating: 5,
    text: 'I used InviteFlow for our store anniversary celebration. The analytics showed that 94% of guests opened the invitation within 2 hours. Incredible reach!',
    event: '5th Anniversary Celebration',
  },
  {
    name: 'Arjun Patel', role: 'Corporate HR Manager', city: 'Pune',
    avatar: '👨‍💼', rating: 5,
    text: 'Managing guest lists for 10+ annual events used to be a nightmare. InviteFlow made it effortless. The team collaboration feature is a game-changer.',
    event: 'Corporate Events Manager',
  },
]

const FAQS = [
  { q: 'Can I create multiple event types?', a: 'Absolutely! InviteFlow supports 11+ event types including weddings, birthdays, corporate events, baby showers, graduations, and more. Each type comes with dedicated templates and features.' },
  { q: 'How do RSVPs work?', a: 'Guests receive your unique event link or QR code. They click to open a beautiful invitation and can RSVP with a single tap. All responses are instantly reflected in your dashboard with real-time notifications.' },
  { q: 'Can I use custom branding?', a: 'Yes! Pro and Business plans include custom branding options. You can add your logo, choose custom colors, use your own fonts, and even host invitations on your custom domain.' },
  { q: 'Is there a free plan?', a: 'Yes! Our free plan lets you create 1 event with basic templates, RSVP tracking, and a shareable link — completely free, no credit card required.' },
  { q: 'Can guests access without an account?', a: 'Yes! Guests never need to create an account. They simply open the link or scan the QR code to view the invitation and RSVP. Completely friction-free for your guests.' },
  { q: 'Can I edit after publishing?', a: 'Absolutely. You can edit event details, update venue information, change timings, and add more guests even after publishing. All changes are reflected instantly for all guests.' },
]

const PRICING = [
  {
    name: 'Free', price: '₹0', period: '', badge: null,
    color: '#6B7280', gradient: 'linear-gradient(135deg, #F9FAFB, #F3F4F6)',
    features: ['1 Event', 'Basic Templates', 'RSVP Tracking', 'Shareable Link', 'Guest List (up to 50)'],
    cta: 'Get Started', ctaStyle: 'outline',
  },
  {
    name: 'Pro', price: '₹499', period: '/month', badge: 'Most Popular',
    color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    features: ['Unlimited Events', 'Premium Templates', 'QR Code Invitations', 'Advanced Analytics', 'Custom Branding', 'Guest List (unlimited)', 'Priority Email Support'],
    cta: 'Start Pro', ctaStyle: 'filled',
  },
  {
    name: 'Business', price: '₹1,499', period: '/month', badge: null,
    color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
    features: ['Everything in Pro', 'Team Collaboration', 'Advanced Analytics', 'Custom Domains', 'White-label Solution', 'API Access', 'Dedicated Support'],
    cta: 'Contact Sales', ctaStyle: 'outline-colored',
  },
]

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Templates', href: '#templates' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <nav
      id="navbar"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(139,92,246,0.1)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
          }}>✉️</div>
          <span style={{ fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            InviteFlow
          </span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex" style={{ gap: 8 }}>
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                color: '#374151', fontWeight: 500, fontSize: 14, padding: '8px 14px',
                borderRadius: 8, textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#8B5CF6'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = 'transparent' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a
            id="nav-login"
            href="#"
            style={{
              color: '#374151', fontWeight: 600, fontSize: 14, padding: '8px 16px',
              borderRadius: 8, textDecoration: 'none', border: '1.5px solid #E5E7EB',
              transition: 'all 0.2s', display: 'none',
            }}
            className="hidden md:inline-flex"
          >
            Log in
          </a>
          <a
            id="nav-cta"
            href="#"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              color: '#fff', fontWeight: 700, fontSize: 14, padding: '9px 20px',
              borderRadius: 10, textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
              transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,92,246,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(139,92,246,0.35)' }}
          >
            Start Free →
          </a>

          {/* Hamburger */}
          <button
            id="mobile-menu-toggle"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22 }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid #F3F4F6', padding: '16px 24px 24px',
        }}>
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', color: '#374151', fontWeight: 500, fontSize: 15,
                padding: '12px 0', borderBottom: '1px solid #F3F4F6', textDecoration: 'none',
              }}
            >
              {link.label}
            </a>
          ))}
          <a href="#" style={{
            display: 'block', marginTop: 16,
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px',
            borderRadius: 12, textDecoration: 'none', textAlign: 'center',
          }}>
            Start Creating Free →
          </a>
        </div>
      )}
    </nav>
  )
}

// ── Hero Section ───────────────────────────────────────────────────────────────
function HeroSection() {
  const [activeCard, setActiveCard] = useState(0)
  const cards = [
    { emoji: '💍', label: 'Wedding Invitation', color: '#D72660', bg: '#FDF2F8' },
    { emoji: '🎂', label: 'Birthday Invitation', color: '#EA580C', bg: '#FFF7ED' },
    { emoji: '🏢', label: 'Corporate Event', color: '#1D4ED8', bg: '#EFF6FF' },
    { emoji: '💑', label: 'Engagement Ceremony', color: '#7C3AED', bg: '#F5F3FF' },
  ]
  useEffect(() => {
    const t = setInterval(() => setActiveCard(c => (c + 1) % cards.length), 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(160deg, #FAFAFA 0%, #F5F3FF 40%, #FDF2F8 70%, #FAFAFA 100%)',
        position: 'relative', overflow: 'hidden', paddingTop: 70,
      }}
    >
      <FloatingParticles />

      {/* Gradient orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60, alignItems: 'center' }}>

          {/* Left — Text */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 999, padding: '6px 14px', marginBottom: 24,
              fontSize: 13, fontWeight: 600, color: '#7C3AED',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Now with AI-powered templates ✨
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900,
              color: '#111827', lineHeight: 1.1, marginBottom: 20,
              letterSpacing: '-1px',
            }}>
              Create Beautiful<br />
              <span style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Digital Invitations</span><br />
              in Minutes
            </h1>

            <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              Design, customize, manage RSVPs, share event links, and create memorable invitation experiences for <strong style={{ color: '#374151' }}>any occasion</strong>.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 48 }}>
              <a
                id="hero-cta-primary"
                href="#"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  color: '#fff', fontWeight: 700, fontSize: 16, padding: '14px 28px',
                  borderRadius: 12, textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
                  transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,92,246,0.4)' }}
              >
                🚀 Start Creating Free
              </a>
              <a
                id="hero-cta-secondary"
                href="#templates"
                style={{
                  color: '#8B5CF6', fontWeight: 700, fontSize: 16, padding: '14px 28px',
                  borderRadius: 12, textDecoration: 'none',
                  border: '2px solid rgba(139,92,246,0.3)',
                  background: 'rgba(139,92,246,0.05)',
                  transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.background = 'rgba(139,92,246,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.background = 'rgba(139,92,246,0.05)' }}
              >
                🎨 View Templates
              </a>
            </div>

            {/* Event type pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EVENT_TYPES.slice(0, 6).map(e => (
                <span key={e.label} style={{
                  background: '#fff', border: '1px solid #E5E7EB', borderRadius: 999,
                  padding: '4px 12px', fontSize: 12, fontWeight: 500, color: '#6B7280',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                  {e.emoji} {e.label}
                </span>
              ))}
              <span style={{
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#7C3AED',
              }}>
                +5 more
              </span>
            </div>
          </div>

          {/* Right — Dashboard Mockup */}
          <div style={{ position: 'relative' }}>
            {/* Browser window mockup */}
            <div style={{
              background: '#FFFFFF', borderRadius: 20,
              boxShadow: '0 24px 80px rgba(139,92,246,0.2), 0 4px 20px rgba(0,0,0,0.08)',
              overflow: 'hidden', border: '1px solid rgba(139,92,246,0.15)',
            }}>
              {/* Browser chrome */}
              <div style={{
                background: '#F9FAFB', padding: '12px 16px',
                borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
                    <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <div style={{
                  flex: 1, background: '#fff', borderRadius: 6, border: '1px solid #E5E7EB',
                  padding: '4px 12px', fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  🔒 app.inviteflow.in/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div style={{ padding: '20px', display: 'flex', gap: 16, minHeight: 340 }}>
                {/* Sidebar */}
                <div style={{ width: 44, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', paddingTop: 4 }}>
                  {[{ e: '📊', a: true }, { e: '📋', a: false }, { e: '👥', a: false }, { e: '📈', a: false }, { e: '⚙️', a: false }].map((item, i) => (
                    <div key={i} style={{
                      width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      background: item.a ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : '#F3F4F6',
                      boxShadow: item.a ? '0 4px 12px rgba(139,92,246,0.3)' : 'none',
                    }}>
                      {item.e}
                    </div>
                  ))}
                </div>

                {/* Main */}
                <div style={{ flex: 1 }}>
                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                    {[
                      { label: 'Active Events', val: '12', color: '#8B5CF6' },
                      { label: 'Total RSVPs', val: '847', color: '#EC4899' },
                      { label: 'Confirmed', val: '621', color: '#10B981' },
                    ].map(s => (
                      <div key={s.label} style={{ background: '#F9FAFB', borderRadius: 10, padding: '10px 12px', border: '1px solid #F3F4F6' }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: s.color, margin: 0 }}>{s.val}</p>
                        <p style={{ fontSize: 10, color: '#9CA3AF', margin: '2px 0 0' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Active event cards */}
                  {[
                    { name: 'Priya & Arjun Wedding', type: '💍 Wedding', guests: 240, rsvp: 186, pct: 78, color: '#D72660' },
                    { name: 'Tech Summit 2025', type: '🏢 Corporate', guests: 500, rsvp: 412, pct: 82, color: '#1D4ED8' },
                  ].map((ev, i) => (
                    <div key={i} style={{
                      background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10,
                      padding: '10px 12px', marginBottom: 8,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#1F2937', margin: 0 }}>{ev.name}</p>
                          <p style={{ fontSize: 10, color: '#9CA3AF', margin: '2px 0 0' }}>{ev.type} · {ev.guests} guests</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: ev.color }}>{ev.pct}%</span>
                      </div>
                      <div style={{ height: 4, background: '#F3F4F6', borderRadius: 999 }}>
                        <div style={{ height: 4, width: `${ev.pct}%`, background: `linear-gradient(90deg, ${ev.color}, ${ev.color}aa)`, borderRadius: 999, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}

                  {/* QR Code badge */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))',
                    border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '10px 12px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ fontSize: 24 }}>📱</div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', margin: 0 }}>QR Code Generated</p>
                      <p style={{ fontSize: 10, color: '#9CA3AF', margin: '2px 0 0' }}>Scan to RSVP instantly</p>
                    </div>
                    <div style={{
                      marginLeft: 'auto', background: '#fff', border: '1px solid #E5E7EB',
                      borderRadius: 6, padding: '6px', fontSize: 18,
                    }}>
                      ▦
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating invitation cards */}
            {cards.map((card, i) => {
              const positions = [
                { top: -20, right: -24, rotate: 8 },
                { top: '30%', right: -36, rotate: -5 },
                { bottom: 60, right: -20, rotate: 6 },
                { bottom: -20, left: -24, rotate: -8 },
              ]
              const { rotate, ...posStyles } = positions[i]
              const isActive = activeCard === i
              return (
                <div
                  key={card.label}
                  style={{
                    position: 'absolute',
                    ...posStyles,
                    background: card.bg,
                    border: `2px solid ${card.color}30`,
                    borderRadius: 14,
                    padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: isActive ? `0 8px 24px ${card.color}30` : '0 4px 12px rgba(0,0,0,0.08)',
                    transform: `rotate(${rotate}deg) scale(${isActive ? 1.05 : 1})`,
                    transition: 'all 0.4s ease',
                    zIndex: isActive ? 10 : 5,
                    minWidth: 160,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{card.emoji}</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: card.color, margin: 0 }}>{card.label}</p>
                    <p style={{ fontSize: 10, color: '#9CA3AF', margin: '2px 0 0' }}>Template ready</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Trust / Stats Section ──────────────────────────────────────────────────────
function TrustSection() {
  const stats = [
    { value: 1000, suffix: '+', label: 'Invitations Created', icon: '✉️' },
    { value: 10, suffix: '+', label: 'Events Hosted', icon: '🎉' },
    { value: 98, suffix: '%', label: 'RSVP Response Rate', icon: '✅' },
    { value: 50, suffix: '+', label: 'Premium Templates', icon: '🎨' },
  ]
  return (
    <section style={{ background: '#FFFFFF', padding: '72px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal className="text-center" style={{ marginBottom: 48 } as any}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Trusted Platform
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#111827', margin: 0 }}>
            Numbers that speak for themselves
          </h2>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 100}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #FAFAFA, #F5F3FF)',
                  border: '1.5px solid rgba(139,92,246,0.12)',
                  borderRadius: 20, padding: '32px 24px', textAlign: 'center',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
                <p style={{
                  fontSize: 48, fontWeight: 900, margin: '0 0 8px',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  <AnimCounter target={s.value} suffix={s.suffix} />
                </p>
                <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500, margin: 0 }}>{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Features Section ───────────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section id="features" style={{ background: '#FAFAFA', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 64 } as any}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#EC4899', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Everything You Need
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#111827', marginBottom: 16 }}>
            Powerful features for every event
          </h2>
          <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 520, margin: '0 auto' }}>
            All the tools you need to create, manage, and share stunning digital invitations.
          </p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 80}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
                  border: '1.5px solid rgba(139,92,246,0.1)', borderRadius: 18,
                  padding: '28px 24px', height: '100%',
                  transition: 'all 0.3s ease', cursor: 'default',
                  boxShadow: '0 2px 8px rgba(139,92,246,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(139,92,246,0.16)'
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(139,92,246,0.06)'
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.1)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14, marginBottom: 18,
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.12))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How It Works ───────────────────────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ background: '#FFFFFF', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 72 } as any}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Simple Process
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#111827', marginBottom: 16 }}>
            From idea to invitation in 6 easy steps
          </h2>
          <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 520, margin: '0 auto' }}>
            No design skills needed. Start for free and create your first invitation in minutes.
          </p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
          {STEPS.map((step, i) => (
            <Reveal key={step.num} delay={i * 100}>
              <div
                style={{
                  position: 'relative', padding: '28px 24px',
                  background: i % 2 === 0 ? 'linear-gradient(135deg, #F5F3FF, #FDF2F8)' : '#FFFFFF',
                  border: '1.5px solid rgba(139,92,246,0.12)', borderRadius: 20,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                {/* Connecting line */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    display: 'none', // hidden on mobile; visible logic via CSS is complex here
                  }} />
                )}
                <div style={{
                  width: 48, height: 48, borderRadius: 14, marginBottom: 18,
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(139,92,246,0.35)',
                }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>{step.num}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>

                {/* Step number watermark */}
                <div style={{
                  position: 'absolute', top: 16, right: 20, fontSize: 52, fontWeight: 900,
                  color: 'rgba(139,92,246,0.06)', lineHeight: 1, userSelect: 'none',
                }}>
                  {step.num}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Template Showcase ──────────────────────────────────────────────────────────
function TemplatesSection() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState<string | null>(null)
  const filters = ['All', ...TEMPLATES.map(t => t.cat)]

  const displayed = activeFilter === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.cat === activeFilter)

  return (
    <section id="templates" style={{ background: '#FAFAFA', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 48 } as any}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            50+ Premium Templates
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#111827', marginBottom: 16 }}>
            Beautiful templates for every occasion
          </h2>
          <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 520, margin: '0 auto' }}>
            Professionally designed and ready to customize in minutes.
          </p>
        </Reveal>

        {/* Filter tabs */}
        <Reveal>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 48 }}>
            {filters.map(f => (
              <button
                key={f}
                id={`filter-${f.toLowerCase()}`}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: activeFilter === f ? 'none' : '1.5px solid #E5E7EB',
                  background: activeFilter === f ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : '#fff',
                  color: activeFilter === f ? '#fff' : '#6B7280',
                  boxShadow: activeFilter === f ? '0 4px 14px rgba(139,92,246,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {displayed.map((tpl, i) => (
            <Reveal key={tpl.cat} delay={i * 80}>
              <div
                onClick={() => setModalOpen(tpl.cat)}
                style={{
                  background: tpl.bg, border: `2px solid ${tpl.color}20`, borderRadius: 20,
                  overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 48px ${tpl.color}25`; e.currentTarget.style.borderColor = `${tpl.color}50` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${tpl.color}20` }}
              >
                {/* Preview area */}
                <div style={{
                  height: 180, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', position: 'relative',
                  background: `linear-gradient(135deg, ${tpl.bg}, ${tpl.color}15)`,
                }}>
                  <div style={{ fontSize: 64, marginBottom: 8 }}>{tpl.emoji}</div>
                  <div style={{
                    position: 'absolute', bottom: 12, right: 12,
                    background: 'rgba(255,255,255,0.9)', borderRadius: 8, padding: '4px 10px',
                    fontSize: 11, fontWeight: 700, color: tpl.color,
                  }}>
                    {tpl.templates.length} templates
                  </div>

                  {/* Hover overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(135deg, ${tpl.color}90, ${tpl.color}60)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.3s',
                    borderRadius: '16px 16px 0 0',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
                  >
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Preview Templates →</span>
                  </div>
                </div>

                {/* Card footer */}
                <div style={{ padding: '16px 20px' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                    {tpl.cat} Templates
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {tpl.templates.map(name => (
                      <span key={name} style={{
                        fontSize: 11, fontWeight: 500, color: tpl.color,
                        background: `${tpl.color}15`, borderRadius: 6, padding: '3px 8px',
                      }}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div
            onClick={() => setModalOpen(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 24, maxWidth: 500, width: '100%',
                boxShadow: '0 40px 100px rgba(0,0,0,0.2)', overflow: 'hidden',
              }}
            >
              {(() => {
                const tpl = TEMPLATES.find(t => t.cat === modalOpen)!
                return (
                  <>
                    <div style={{
                      background: `linear-gradient(135deg, ${tpl.bg}, ${tpl.color}20)`,
                      padding: '40px', textAlign: 'center', borderBottom: `1px solid ${tpl.color}20`,
                    }}>
                      <div style={{ fontSize: 72, marginBottom: 12 }}>{tpl.emoji}</div>
                      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>{tpl.cat} Invitations</h2>
                      <p style={{ color: '#6B7280', marginTop: 8 }}>Choose from {tpl.templates.length} beautiful templates</p>
                    </div>
                    <div style={{ padding: '24px 28px' }}>
                      {tpl.templates.map(name => (
                        <div key={name} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', marginBottom: 10,
                          background: `${tpl.color}08`, border: `1px solid ${tpl.color}20`, borderRadius: 12,
                        }}>
                          <span style={{ fontWeight: 600, color: '#374151' }}>{name}</span>
                          <a href="#" style={{
                            background: `linear-gradient(135deg, ${tpl.color}, ${tpl.color}cc)`,
                            color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 14px',
                            borderRadius: 8, textDecoration: 'none',
                          }}>
                            Use →
                          </a>
                        </div>
                      ))}
                      <button
                        onClick={() => setModalOpen(null)}
                        style={{
                          width: '100%', marginTop: 8, padding: '12px', borderRadius: 12,
                          border: '1.5px solid #E5E7EB', background: '#F9FAFB',
                          color: '#6B7280', fontWeight: 600, cursor: 'pointer', fontSize: 14,
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Dashboard Preview ──────────────────────────────────────────────────────────
function DashboardPreview() {
  return (
    <section style={{ background: 'linear-gradient(160deg, #F5F3FF 0%, #FDF2F8 100%)', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60, alignItems: 'center' }}>
          <div>
            <Reveal>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
                Powerful Dashboard
              </p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: '#111827', marginBottom: 16 }}>
                Manage everything from one beautiful dashboard
              </h2>
              <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginBottom: 28 }}>
                Your command center for all events. Monitor RSVPs, track guest responses, analyze engagement, and manage billing — all in one place.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: '📋', text: 'Projects & Invitations overview' },
                  { icon: '📈', text: 'Real-time analytics & insights' },
                  { icon: '👥', text: 'Guest management & RSVP tracking' },
                  { icon: '💳', text: 'Billing & subscription management' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, fontSize: 16,
                      background: 'rgba(139,92,246,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.icon}
                    </div>
                    <span style={{ color: '#374151', fontWeight: 500, fontSize: 15 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Dashboard mock */}
          <Reveal delay={150}>
            <div style={{
              background: '#fff', borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(139,92,246,0.2)',
              border: '1px solid rgba(139,92,246,0.15)',
            }}>
              {/* Browser bar */}
              <div style={{ background: '#F9FAFB', padding: '10px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 6, alignItems: 'center' }}>
                {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
                <div style={{ flex: 1, background: '#fff', borderRadius: 6, border: '1px solid #E5E7EB', padding: '3px 10px', fontSize: 10, color: '#9CA3AF', marginLeft: 8 }}>
                  🔒 app.inviteflow.in/dashboard/analytics
                </div>
              </div>

              {/* Sidebar + content */}
              <div style={{ display: 'flex' }}>
                <div style={{ width: 56, background: '#FAFAFA', borderRight: '1px solid #F3F4F6', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { e: '📊', label: 'Dashboard', active: false },
                    { e: '📋', label: 'Projects', active: false },
                    { e: '📈', label: 'Analytics', active: true },
                    { e: '👥', label: 'Guests', active: false },
                    { e: '💳', label: 'Billing', active: false },
                    { e: '⚙️', label: 'Settings', active: false },
                  ].map(item => (
                    <div key={item.label} title={item.label} style={{
                      width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                      background: item.active ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'transparent',
                      cursor: 'default',
                    }}>
                      {item.e}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, padding: '16px' }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: '#111827', margin: '0 0 14px' }}>Analytics Overview</p>
                  {/* Mini chart bars */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 72, marginBottom: 14 }}>
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div key={i} style={{
                        flex: 1, borderRadius: '4px 4px 0 0',
                        height: `${h}%`,
                        background: i === 10 ? 'linear-gradient(180deg, #8B5CF6, #EC4899)' : `rgba(139,92,246,${0.15 + h * 0.004})`,
                      }} />
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Opens', val: '2,847', delta: '+12%', pos: true },
                      { label: 'RSVPs', val: '1,203', delta: '+8%', pos: true },
                      { label: 'Avg. Open Rate', val: '94.2%', delta: '+3%', pos: true },
                      { label: 'Conversion', val: '82.4%', delta: '+5%', pos: true },
                    ].map(m => (
                      <div key={m.label} style={{ background: '#F9FAFB', borderRadius: 10, padding: '10px 12px', border: '1px solid #F3F4F6' }}>
                        <p style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: 0 }}>{m.val}</p>
                        <p style={{ fontSize: 10, color: '#9CA3AF', margin: '2px 0' }}>{m.label}</p>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981' }}>{m.delta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ── Comparison Section ─────────────────────────────────────────────────────────
function ComparisonSection() {
  const rows = [
    { label: 'Cost per Invite', traditional: '₹20–₹80', inviteflow: 'Free / from ₹499/mo', win: true },
    { label: 'Delivery Time', traditional: '7–14 days', inviteflow: 'Instant', win: true },
    { label: 'RSVP Tracking', traditional: '❌ Manual', inviteflow: '✅ Automated', win: true },
    { label: 'Updates After Send', traditional: '❌ Reprint needed', inviteflow: '✅ Edit anytime', win: true },
    { label: 'Analytics & Insights', traditional: '❌ None', inviteflow: '✅ Real-time', win: true },
    { label: 'Eco Friendly', traditional: '❌ Paper waste', inviteflow: '✅ 100% digital', win: true },
    { label: 'QR Code Sharing', traditional: '❌ Not available', inviteflow: '✅ Included', win: true },
    { label: 'Guest Experience', traditional: '📮 Physical card', inviteflow: '✨ Interactive page', win: true },
  ]
  return (
    <section style={{ background: '#FFFFFF', padding: '96px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 56 } as any}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#EC4899', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Why InviteFlow?
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#111827', marginBottom: 16 }}>
            Traditional vs. InviteFlow
          </h2>
          <p style={{ fontSize: 17, color: '#6B7280' }}>
            See why thousands are switching to digital invitations.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div style={{
            background: '#fff', border: '1.5px solid rgba(139,92,246,0.15)', borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(139,92,246,0.08)',
          }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr', background: '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ padding: '16px 24px', fontWeight: 700, color: '#6B7280', fontSize: 13 }}>Feature</div>
              <div style={{ padding: '16px 24px', fontWeight: 700, color: '#6B7280', fontSize: 13, borderLeft: '1px solid #F3F4F6' }}>Traditional Invites</div>
              <div style={{
                padding: '16px 24px', fontWeight: 800, fontSize: 13, borderLeft: '1px solid rgba(139,92,246,0.15)',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.08))',
                color: '#7C3AED',
              }}>
                ✨ InviteFlow
              </div>
            </div>
            {rows.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr',
                  borderBottom: i < rows.length - 1 ? '1px solid #F9FAFB' : 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FAFAFA' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ padding: '14px 24px', fontWeight: 600, color: '#374151', fontSize: 14 }}>{row.label}</div>
                <div style={{ padding: '14px 24px', color: '#EF4444', fontSize: 14, borderLeft: '1px solid #F3F4F6' }}>{row.traditional}</div>
                <div style={{
                  padding: '14px 24px', fontSize: 14, fontWeight: 600, color: '#7C3AED',
                  borderLeft: '1px solid rgba(139,92,246,0.15)',
                  background: 'rgba(139,92,246,0.03)',
                }}>
                  {row.inviteflow}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── Pricing Section ────────────────────────────────────────────────────────────
function PricingSection() {
  return (
    <section id="pricing" style={{ background: '#FAFAFA', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 64 } as any}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Simple Pricing
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#111827', marginBottom: 16 }}>
            Plans for every need
          </h2>
          <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 480, margin: '0 auto' }}>
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'start' }}>
          {PRICING.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100}>
              <div
                style={{
                  background: '#fff', border: plan.badge ? '2px solid #8B5CF6' : '1.5px solid #E5E7EB',
                  borderRadius: 24, overflow: 'hidden', position: 'relative',
                  boxShadow: plan.badge ? '0 16px 48px rgba(139,92,246,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    color: '#fff', fontSize: 11, fontWeight: 800, padding: '6px 16px',
                    borderRadius: '0 24px 0 14px', letterSpacing: '0.05em',
                  }}>
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div style={{
                  padding: '32px 28px 24px',
                  background: plan.badge ? 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(236,72,153,0.06))' : '#fff',
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: plan.color, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {plan.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 44, fontWeight: 900, color: '#111827',
                      background: plan.badge ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'none',
                      WebkitBackgroundClip: plan.badge ? 'text' : 'unset',
                      WebkitTextFillColor: plan.badge ? 'transparent' : '#111827',
                    }}>
                      {plan.price}
                    </span>
                    <span style={{ color: '#9CA3AF', fontSize: 14 }}>{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div style={{ padding: '0 28px 28px' }}>
                  <div style={{ height: 1, background: '#F3F4F6', marginBottom: 20 }} />
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${plan.color}22, ${plan.color}11)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                      }}>
                        <span style={{ color: plan.color }}>✓</span>
                      </div>
                      <span style={{ fontSize: 14, color: '#374151' }}>{f}</span>
                    </div>
                  ))}

                  <a
                    id={`pricing-cta-${plan.name.toLowerCase()}`}
                    href="#"
                    style={{
                      display: 'block', textAlign: 'center', marginTop: 24, padding: '13px',
                      borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15,
                      transition: 'all 0.2s',
                      ...(plan.ctaStyle === 'filled' ? {
                        background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                        color: '#fff', boxShadow: '0 6px 20px rgba(139,92,246,0.35)',
                      } : plan.ctaStyle === 'outline-colored' ? {
                        border: `2px solid ${plan.color}`, color: plan.color, background: 'transparent',
                      } : {
                        border: '2px solid #E5E7EB', color: '#374151', background: '#F9FAFB',
                      }),
                    }}
                    onMouseEnter={e => {
                      if (plan.ctaStyle === 'filled') {
                        e.currentTarget.style.boxShadow = '0 10px 28px rgba(139,92,246,0.45)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = plan.ctaStyle === 'filled' ? '0 6px 20px rgba(139,92,246,0.35)' : 'none'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {plan.cta}
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Testimonials Section ───────────────────────────────────────────────────────
function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % TESTIMONIALS.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <section style={{ background: 'linear-gradient(160deg, #F5F3FF 0%, #FDF2F8 100%)', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 64 } as any}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#EC4899', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Customer Love
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#111827' }}>
            Loved by event creators worldwide
          </h2>
        </Reveal>

        {/* Featured testimonial */}
        <Reveal>
          <div style={{
            background: '#fff', borderRadius: 24, padding: '40px 48px', marginBottom: 32,
            boxShadow: '0 16px 48px rgba(139,92,246,0.15)', border: '1.5px solid rgba(139,92,246,0.12)',
            position: 'relative', transition: 'all 0.5s ease',
          }}>
            <div style={{
              position: 'absolute', top: 24, left: 32, fontSize: 64,
              color: 'rgba(139,92,246,0.12)', lineHeight: 1, fontFamily: 'Georgia, serif',
            }}>
              "
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', fontSize: 28,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(139,92,246,0.2)',
              }}>
                {TESTIMONIALS[current].avatar}
              </div>
              <div>
                <p style={{ fontWeight: 800, color: '#111827', fontSize: 16, margin: 0 }}>{TESTIMONIALS[current].name}</p>
                <p style={{ color: '#8B5CF6', fontSize: 13, margin: '2px 0 0', fontWeight: 600 }}>
                  {TESTIMONIALS[current].role} · {TESTIMONIALS[current].city}
                </p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} style={{ color: '#F59E0B', fontSize: 16 }}>{s}</span>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 17, color: '#374151', lineHeight: 1.75, fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
              "{TESTIMONIALS[current].text}"
            </p>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: 'rgba(139,92,246,0.1)', color: '#7C3AED',
                fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999,
              }}>
                {TESTIMONIALS[current].event}
              </span>
            </div>
          </div>

          {/* Carousel dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                id={`testimonial-dot-${i}`}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? 24 : 8, height: 8, borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: i === current ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : '#D1D5DB',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </Reveal>

        {/* All testimonial cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div
                onClick={() => setCurrent(i)}
                style={{
                  background: i === current ? '#fff' : 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: i === current ? '2px solid rgba(139,92,246,0.3)' : '1.5px solid rgba(139,92,246,0.1)',
                  borderRadius: 18, padding: '20px', cursor: 'pointer',
                  boxShadow: i === current ? '0 8px 24px rgba(139,92,246,0.15)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                  {'★★★★★'.split('').map((s, j) => <span key={j} style={{ color: '#F59E0B', fontSize: 13 }}>{s}</span>)}
                </div>
                <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6, marginBottom: 14, fontStyle: 'italic' }}>
                  "{t.text.slice(0, 100)}..."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', fontSize: 18,
                    background: 'rgba(139,92,246,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#111827', fontSize: 13, margin: 0 }}>{t.name}</p>
                    <p style={{ color: '#9CA3AF', fontSize: 11, margin: '1px 0 0' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FAQ Section ────────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" style={{ background: '#FFFFFF', padding: '96px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 56 } as any}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Got Questions?
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#111827' }}>
            Frequently asked questions
          </h2>
        </Reveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                style={{
                  background: open === i ? 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(236,72,153,0.04))' : '#FAFAFA',
                  border: open === i ? '1.5px solid rgba(139,92,246,0.25)' : '1.5px solid #F3F4F6',
                  borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s ease',
                }}
              >
                <button
                  id={`faq-${i}`}
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{faq.q}</span>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginLeft: 16,
                    background: open === i ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: open === i ? '#fff' : '#9CA3AF',
                    transition: 'all 0.3s', transform: open === i ? 'rotate(45deg)' : 'rotate(0)',
                  }}>
                    +
                  </span>
                </button>
                {open === i && (
                  <div style={{ padding: '0 24px 20px' }}>
                    <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Final CTA ──────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 30%, #EC4899 70%, #DB2777 100%)',
      padding: '96px 24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated gradient orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', animation: 'float 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'float 8s ease-in-out 2s infinite' }} />
      <div style={{ position: 'absolute', top: '50%', right: '20%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', animation: 'float 5s ease-in-out 1s infinite' }} />

      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.2)', borderRadius: 999,
            padding: '6px 16px', marginBottom: 24, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
          }}>
            🚀 Join 5,000+ event creators today
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff',
            marginBottom: 20, lineHeight: 1.1, letterSpacing: '-0.5px',
          }}>
            Ready to Create Your First<br />Digital Invitation?
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 40, lineHeight: 1.6 }}>
            Start for free. No credit card required. Create beautiful invitations in minutes.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <a
              id="final-cta-primary"
              href="#"
              style={{
                background: '#fff', color: '#8B5CF6', fontWeight: 800, fontSize: 16,
                padding: '15px 32px', borderRadius: 12, textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'all 0.2s',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
            >
              ✉️ Create Invitation
            </a>
            <a
              id="final-cta-secondary"
              href="#templates"
              style={{
                background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: 16,
                padding: '15px 32px', borderRadius: 12, textDecoration: 'none',
                border: '2px solid rgba(255,255,255,0.4)', transition: 'all 0.2s',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
            >
              🎨 Explore Templates
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const footerLinks = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Templates', href: '#templates' },
      { label: 'How It Works', href: '#how-it-works' },
    ],
    Resources: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Status', href: '#' },
    ],
    Company: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  }

  return (
    <footer style={{ background: '#111827', color: '#fff', padding: '72px 24px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Top grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 48, marginBottom: 60 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>✉️</div>
              <span style={{ fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg, #A78BFA, #F9A8D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                InviteFlow
              </span>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Create beautiful digital invitations for any occasion. Manage RSVPs, track guests, and share with ease.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { icon: '𝕏', label: 'Twitter', href: '#', id: 'social-twitter' },
                { icon: 'in', label: 'LinkedIn', href: '#', id: 'social-linkedin' },
                { icon: 'f', label: 'Facebook', href: '#', id: 'social-facebook' },
                { icon: '▶', label: 'YouTube', href: '#', id: 'social-youtube' },
              ].map(s => (
                <a
                  key={s.id}
                  id={s.id}
                  href={s.href}
                  title={s.label}
                  style={{
                    width: 36, height: 36, borderRadius: 10, fontSize: 14, fontWeight: 700,
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF',
                    textDecoration: 'none', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.3)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                {group}
              </p>
              {links.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  style={{
                    display: 'block', color: '#9CA3AF', fontSize: 14, marginBottom: 10,
                    textDecoration: 'none', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#A78BFA' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <p style={{ fontWeight: 700, color: '#fff', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Newsletter
            </p>
            <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Get tips, templates, and event inspiration delivered to your inbox.
            </p>
            {subscribed ? (
              <div style={{
                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 10, padding: '12px 16px', color: '#6EE7B7', fontSize: 13, fontWeight: 600,
              }}>
                ✅ You're subscribed! Welcome aboard.
              </div>
            ) : (
              <div>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, marginBottom: 10,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button
                  id="newsletter-submit"
                  onClick={() => { if (email.includes('@')) setSubscribed(true) }}
                  style={{
                    width: '100%', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    border: 'none', borderRadius: 10, padding: '11px', color: '#fff',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(139,92,246,0.3)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,92,246,0.45)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(139,92,246,0.3)' }}
                >
                  Subscribe →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 28, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>
            © 2025 InviteFlow. All rights reserved. Made with ❤️ in India.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(label => (
              <a key={label} href="#" style={{ color: '#6B7280', fontSize: 13, textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#A78BFA' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6B7280' }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Back To Top ────────────────────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      id="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Back to top"
      style={{
        position: 'fixed', bottom: 32, right: 32, zIndex: 999,
        width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
        color: '#fff', fontSize: 20,
        boxShadow: '0 6px 20px rgba(139,92,246,0.4)',
        transition: 'all 0.3s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.8)',
        pointerEvents: visible ? 'auto' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.8)' }}
    >
      ↑
    </button>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #FAFAFA;
          color: #111827;
          overflow-x: hidden;
        }
        
        html { scroll-behavior: smooth; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        a { transition: all 0.2s ease; }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F3F4F6; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #8B5CF6, #EC4899); border-radius: 999px; }
        
        .hidden { display: none !important; }
        @media (min-width: 768px) { .hidden { display: none !important; } .md\\:flex { display: flex !important; } .md\\:inline-flex { display: inline-flex !important; } }
        @media (max-width: 767px) { .md\\:hidden { display: none !important; } }
      `}</style>

      <Navbar />
      <main>
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TemplatesSection />
        <DashboardPreview />
        <ComparisonSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
