'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useMobileMotion } from './use-mobile-motion'

type Direction = 'up' | 'left' | 'right' | 'scale'

const desktopOffsets: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 36 },
  left: { x: -28 },
  right: { x: 28 },
  scale: { scale: 0.94 },
}

const mobileOffsets: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 22 },
  left: { x: -16 },
  right: { x: 16 },
  scale: { scale: 0.96 },
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
        amount: mobile ? 0.12 : 0.22,
        margin: '0px 0px -8% 0px',
      }}
      transition={{
        duration: mobile ? 0.7 : 0.9,
        delay: mobile ? delay * 0.7 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
