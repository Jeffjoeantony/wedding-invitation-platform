'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { LandingButton } from './landing-button'
import { CREATE_HREF, NAV_LINKS, SIGN_IN_HREF } from './constants'
import { cn } from '@/lib/utils'

const iconBtn =
  'inline-flex size-9 items-center justify-center rounded-full text-[color:var(--landing-ink)] transition-colors hover:bg-white/45'

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <motion.header
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-6xl">
        <div
          className={cn(
            'landing-glass-nav relative flex h-14 items-center gap-3 rounded-full px-4 sm:h-[3.75rem] sm:px-5 lg:px-6',
            scrolled && 'landing-glass-nav--solid',
          )}
        >
          {/* Brand — unchanged */}
          <Link
            href="#home"
            className="group relative z-10 flex min-w-0 shrink-0 items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/55 font-serif text-lg text-[color:var(--landing-ink)] shadow-sm backdrop-blur-sm transition group-hover:bg-white/75"
            >
              G
            </span>
            <span className="truncate font-serif text-lg font-light tracking-wide text-[color:var(--landing-ink)] sm:text-xl">
              Goldleaf
            </span>
          </Link>

          {/* Centered links — Aloha layout */}
          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 lg:flex lg:gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-full px-2.5 py-2 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--landing-charcoal)] transition-colors hover:bg-white/40 hover:text-[color:var(--landing-ink)] lg:px-3.5 lg:text-[0.68rem] lg:tracking-[0.18em]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icon trio — search / bag / account */}
          <div className="relative z-10 ml-auto hidden items-center gap-1 lg:flex">
            <Link href="#templates" aria-label="Search templates" className={iconBtn}>
              <Search className="size-[1.15rem]" strokeWidth={1.6} />
            </Link>
            <Link href={CREATE_HREF} aria-label="Start creating" className={iconBtn}>
              <ShoppingBag className="size-[1.15rem]" strokeWidth={1.6} />
            </Link>
            <Link href={SIGN_IN_HREF} aria-label="Sign in" className={iconBtn}>
              <UserRound className="size-[1.15rem]" strokeWidth={1.6} />
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="relative z-10 ml-auto inline-flex size-10 items-center justify-center rounded-full border border-white/40 bg-white/35 text-[color:var(--landing-ink)] backdrop-blur-md lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="landing-glass-panel pointer-events-auto mx-auto mt-2 max-w-6xl overflow-hidden rounded-[1.75rem] lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-3 py-3 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--landing-ink)]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 flex items-center justify-center gap-2 border-t border-white/35 pt-4">
                <Link
                  href="#templates"
                  aria-label="Search templates"
                  className={cn(iconBtn, 'size-11 bg-white/35')}
                  onClick={() => setOpen(false)}
                >
                  <Search className="size-5" strokeWidth={1.6} />
                </Link>
                <Link
                  href={CREATE_HREF}
                  aria-label="Start creating"
                  className={cn(iconBtn, 'size-11 bg-white/35')}
                  onClick={() => setOpen(false)}
                >
                  <ShoppingBag className="size-5" strokeWidth={1.6} />
                </Link>
                <Link
                  href={SIGN_IN_HREF}
                  aria-label="Sign in"
                  className={cn(iconBtn, 'size-11 bg-white/35')}
                  onClick={() => setOpen(false)}
                >
                  <UserRound className="size-5" strokeWidth={1.6} />
                </Link>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <LandingButton href={SIGN_IN_HREF} variant="glass" onClick={() => setOpen(false)}>
                  Sign In
                </LandingButton>
                <LandingButton href={CREATE_HREF} onClick={() => setOpen(false)}>
                  Start Creating
                </LandingButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
