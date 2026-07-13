'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type Direction = 'up' | 'left' | 'right' | 'scale'

const offsets: Record<Direction, { x?: number; y?: number; scale?: number; filter?: string }> = {
  up: { y: 42, filter: 'blur(8px)' },
  left: { x: -40, filter: 'blur(6px)' },
  right: { x: 40, filter: 'blur(6px)' },
  scale: { scale: 0.92, filter: 'blur(8px)' },
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
  const from = offsets[direction]

  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, ...from }}
      whileInView={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }
      }
      viewport={{ once: true, amount: 0.22, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1.05, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
