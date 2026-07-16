'use client'

import { ReactLenis } from 'lenis/react'
import { useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, type ReactNode } from 'react'
import { useMobileMotion } from './use-mobile-motion'

/**
 * Desktop: Lenis lerp smooth scroll (buttery wheel / trackpad).
 * Mobile: native momentum scroll only — Lenis syncTouch shortens each
 * swipe so you need many more flicks to reach the bottom.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion() === true
  const mobile = useMobileMotion()

  useEffect(() => {
    const root = document.documentElement
    if (mobile || reduceMotion) {
      root.classList.add('invite-native-smooth')
      root.classList.remove('invite-lenis-active')
    } else {
      root.classList.add('invite-lenis-active')
      root.classList.remove('invite-native-smooth')
    }
    return () => {
      root.classList.remove('invite-native-smooth', 'invite-lenis-active')
    }
  }, [mobile, reduceMotion])

  const options = useMemo(
    () => ({
      autoRaf: true as const,
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.92,
      overscroll: true,
      prevent: (node: HTMLElement) =>
        !!node.closest(
          '[data-lenis-prevent],[data-slot="carousel-content"],input,textarea,select,[role="slider"]',
        ),
    }),
    [],
  )

  // Touch devices: native scroll (full swipe distance + OS momentum)
  if (mobile || reduceMotion) return <>{children}</>

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  )
}
