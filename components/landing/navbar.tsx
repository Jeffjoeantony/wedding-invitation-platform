'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { LandingContainer } from './section'
import { LandingButton } from './landing-button'
import { CREATE_HREF, NAV_LINKS, SIGN_IN_HREF } from './constants'
import { cn } from '@/lib/utils'

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
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
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500',
        scrolled
          ? 'border-b border-[color:var(--landing-champagne)]/80 bg-[color:var(--landing-ivory)]/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <LandingContainer className="flex h-[4.25rem] items-center justify-between gap-4">
        <Link
          href="#home"
          className="group flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-full border border-[color:var(--landing-gold)]/50 bg-white/50 font-serif text-lg text-[color:var(--landing-gold-dark)] shadow-sm transition group-hover:border-[color:var(--landing-gold)]"
          >
            G
          </span>
          <span className="font-serif text-xl font-light tracking-wide text-[color:var(--landing-ink)]">
            Goldleaf
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="landing-link font-sans text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[color:var(--landing-muted)] transition-colors hover:text-[color:var(--landing-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LandingButton href={SIGN_IN_HREF} variant="ghost" className="px-4 py-2.5">
            Sign In
          </LandingButton>
          <LandingButton href={CREATE_HREF} className="px-5 py-2.5">
            Start Creating
          </LandingButton>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="inline-flex size-10 items-center justify-center rounded-sm border border-[color:var(--landing-champagne)] text-[color:var(--landing-ink)] lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </LandingContainer>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="border-t border-[color:var(--landing-champagne)] bg-[color:var(--landing-ivory)]/95 backdrop-blur-md lg:hidden"
          >
            <LandingContainer className="flex flex-col gap-1 py-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-sm px-2 py-3 font-sans text-sm uppercase tracking-[0.18em] text-[color:var(--landing-ink)]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-[color:var(--landing-champagne)] pt-4">
                <LandingButton href={SIGN_IN_HREF} variant="secondary" onClick={() => setOpen(false)}>
                  Sign In
                </LandingButton>
                <LandingButton href={CREATE_HREF} onClick={() => setOpen(false)}>
                  Start Creating
                </LandingButton>
              </div>
            </LandingContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
