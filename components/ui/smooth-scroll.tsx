'use client'

import { ReactLenis } from 'lenis/react'
import { useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, type ReactNode } from 'react'
import { useMobileMotion } from './use-mobile-motion'

/**
 * Lenis lerp scroll on desktop + mobile.
 *
 * Mobile "heavy" feel usually comes from lagging behind the finger
 * (lerp too low) + long inertia. We use a higher syncTouchLerp so it
 * stays buttery without fighting your swipe.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  // Normalize to boolean so hook deps stay a stable shape across renders
  const reduceMotion = useReducedMotion() === true
  const mobile = useMobileMotion()

  useEffect(() => {
    const root = document.documentElement
    if (reduceMotion) {
      root.classList.add('invite-native-smooth')
      root.classList.remove('invite-lenis-active')
    } else {
      root.classList.add('invite-lenis-active')
      root.classList.remove('invite-native-smooth')
    }
    return () => {
      root.classList.remove('invite-native-smooth', 'invite-lenis-active')
    }
  }, [reduceMotion, mobile])

  const options = useMemo(
    () => ({
      autoRaf: true as const,
      smoothWheel: true,
      syncTouch: true,
      lerp: mobile ? 0.18 : 0.08,
      syncTouchLerp: mobile ? 0.22 : 0.075,
      touchInertiaExponent: mobile ? 1.05 : 1.7,
      touchMultiplier: 1,
      wheelMultiplier: 0.92,
      overscroll: true,
      prevent: (node: HTMLElement) =>
        !!node.closest(
          '[data-lenis-prevent],[data-slot="carousel-content"],input,textarea,select,[role="slider"]',
        ),
    }),
    [mobile],
  )

  if (reduceMotion) return <>{children}</>

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  )
}
