'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ComponentProps, ReactNode } from 'react'

type LandingButtonProps = {
  children: ReactNode
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  onClick?: () => void
  type?: ComponentProps<'button'>['type']
}

const variants = {
  primary:
    'border border-[color:var(--landing-gold)] bg-[color:var(--landing-ivory)] text-[color:var(--landing-ink)] shadow-[0_10px_28px_-14px_rgba(158,131,72,0.45)] hover:bg-[color:var(--landing-gold)] hover:text-[color:var(--landing-ink)] hover:shadow-[0_14px_34px_-12px_rgba(158,131,72,0.5)]',
  secondary:
    'border border-[color:var(--landing-champagne)] bg-[color:var(--landing-card)]/70 text-[color:var(--landing-ink)] hover:border-[color:var(--landing-gold)]/55 hover:bg-[color:var(--landing-beige)]/80',
  ghost:
    'bg-transparent text-[color:var(--landing-charcoal)] hover:text-[color:var(--landing-gold-dark)]',
}

export function LandingButton({
  children,
  href,
  variant = 'primary',
  className,
  onClick,
  type = 'button',
}: LandingButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-sm px-7 py-3.5 font-sans text-[0.7rem] font-medium uppercase tracking-[0.22em] transition-colors duration-300 will-change-transform',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--landing-gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--landing-ivory)]',
    variants[variant],
    className,
  )

  const motionProps = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.985 },
    transition: { type: 'spring' as const, stiffness: 420, damping: 28 },
  }

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-flex w-full sm:w-auto">
        <Link href={href} className={cn(classes, 'w-full sm:w-auto')} onClick={onClick}>
          {children}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button type={type} className={cn(classes, 'w-full sm:w-auto')} onClick={onClick} {...motionProps}>
      {children}
    </motion.button>
  )
}
