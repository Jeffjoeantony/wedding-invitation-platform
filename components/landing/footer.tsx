'use client'

import Link from 'next/link'
import { Instagram, Linkedin, Twitter } from 'lucide-react'
import { LandingContainer, ThinDivider } from './section'
import { CREATE_HREF, NAV_LINKS, SIGN_IN_HREF } from './constants'

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Templates', href: '#templates' },
      { label: 'How It Works', href: '#how-it-works' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#home' },
      { label: 'Start Creating', href: CREATE_HREF },
      { label: 'Sign In', href: SIGN_IN_HREF },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Contact', href: 'mailto:hello@goldleaf.app' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
] as const

export function LandingFooter() {
  return (
    <footer className="relative border-t border-[color:var(--landing-champagne)] bg-[color:var(--landing-beige)]/70 pb-10 pt-16">
      <LandingContainer>
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <Link href="#home" className="inline-flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full border border-[color:var(--landing-gold)]/50 bg-white/60 font-serif text-lg text-[color:var(--landing-gold-dark)]">
                G
              </span>
              <span className="font-serif text-xl font-light text-[color:var(--landing-ink)]">
                Goldleaf
              </span>
            </Link>
            <p className="mt-4 font-sans text-sm font-light leading-relaxed text-[color:var(--landing-muted)]">
              Premium digital invitations with the warmth of fine stationery — for every celebration.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Linkedin, label: 'LinkedIn' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-sm border border-[color:var(--landing-champagne)] text-[color:var(--landing-muted)] transition hover:border-[color:var(--landing-gold)]/50 hover:text-[color:var(--landing-gold-dark)]"
                >
                  <Icon className="size-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-10">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[color:var(--landing-gold-dark)]">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="landing-link font-sans text-sm font-light text-[color:var(--landing-muted)] transition hover:text-[color:var(--landing-ink)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <ThinDivider className="mx-0 w-full max-w-none via-[color:var(--landing-champagne)]" />
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-sans text-xs font-light text-[color:var(--landing-muted)]">
              © {new Date().getFullYear()} Goldleaf. All rights reserved.
            </p>
            <nav className="flex flex-wrap gap-4">
              {NAV_LINKS.slice(0, 4).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--landing-muted)] transition hover:text-[color:var(--landing-ink)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </LandingContainer>
    </footer>
  )
}
