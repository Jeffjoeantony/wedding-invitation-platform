'use client'

import { ReactLenis } from 'lenis/react'
import { useReducedMotion } from 'framer-motion'
import { useMemo, type ReactNode } from 'react'
import { useMobileMotion } from './use-mobile-motion'

/**
 * Lerp-based smooth scrolling for the invitation (desktop wheel + mobile touch).
 * Concept: current += (target - current) * lerp each frame.
 *
 * Carousel / form elements use data-lenis-prevent so swipe still works.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const mobile = useMobileMotion()

  const options = useMemo(
    () => ({
      autoRaf: true as const,
      // Desktop: softer butter (~0.08). Mobile: slightly snappier so it
      // doesn't feel laggy behind the finger.
      lerp: mobile ? 0.12 : 0.08,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: mobile ? 0.1 : 0.075,
      touchInertiaExponent: mobile ? 1.35 : 1.7,
      touchMultiplier: mobile ? 1.2 : 1,
      wheelMultiplier: 0.92,
      overscroll: true,
      prevent: (node: HTMLElement) =>
        !!node.closest(
          '[data-lenis-prevent],[data-slot="carousel-content"],input,textarea,select,[role="slider"]',
        ),
    }),
    [mobile],
  )

  if (reduce) return <>{children}</>

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  )
}
