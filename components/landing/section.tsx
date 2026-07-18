'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function LandingContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>
      {children}
    </div>
  )
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.32em] text-[color:var(--landing-gold-dark)]">
      {children}
    </p>
  )
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h2
      className={cn(
        'mt-3 font-serif text-3xl font-light leading-tight text-[color:var(--landing-ink)] sm:text-4xl md:text-5xl',
        className,
      )}
    >
      {children}
    </h2>
  )
}

export function SectionLead({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        'mt-4 max-w-xl font-sans text-base font-light leading-relaxed text-[color:var(--landing-muted)] sm:text-lg',
        className,
      )}
    >
      {children}
    </p>
  )
}

export function ThinDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'mx-auto h-px w-16 bg-gradient-to-r from-transparent via-[color:var(--landing-gold)]/55 to-transparent',
        className,
      )}
    />
  )
}
