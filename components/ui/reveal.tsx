'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useMobileMotion } from './use-mobile-motion'

type Direction = 'up' | 'left' | 'right' | 'scale' | 'fade'

const easeOut = [0.16, 1, 0.3, 1] as const

const desktopOffsets: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 48 },
  left: { x: -36 },
  right: { x: 36 },
  scale: { scale: 0.92 },
  fade: {},
}

const mobileOffsets: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 28 },
  left: { x: -18 },
  right: { x: 18 },
  scale: { scale: 0.95 },
  fade: {},
}

export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className,
}: {
  children: ReactNode
  direction?: Direction
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const mobile = useMobileMotion()
  const from = (mobile ? mobileOffsets : desktopOffsets)[direction]

  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, ...from }}
      whileInView={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, x: 0, y: 0, scale: 1 }
      }
      viewport={{
        once: true,
        amount: mobile ? 0.1 : 0.18,
        margin: '0px 0px -10% 0px',
      }}
      transition={{
        duration: mobile ? 0.85 : 1.15,
        delay: mobile ? delay * 0.65 : delay,
        ease: easeOut,
      }}
    >
      {children}
    </motion.div>
  )
}

/** Stagger children as the block enters the viewport. */
export function RevealStagger({
  children,
  className,
  stagger = 0.1,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
}) {
  const reduce = useReducedMotion()
  const mobile = useMobileMotion()

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: mobile ? 0.12 : 0.2, margin: '0px 0px -8% 0px' }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: mobile ? stagger * 0.7 : stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={i}
              className="h-full"
              variants={{
                hidden: reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: mobile ? 20 : 32 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: mobile ? 0.75 : 1, ease: easeOut },
                },
              }}
            >
              {child}
            </motion.div>
          ))
        : (
            <motion.div
              className="h-full"
              variants={{
                hidden: reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: mobile ? 20 : 32 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: mobile ? 0.75 : 1, ease: easeOut },
                },
              }}
            >
              {children}
            </motion.div>
          )}
    </motion.div>
  )
}
