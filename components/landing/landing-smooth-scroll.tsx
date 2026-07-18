'use client'

import { ReactLenis } from 'lenis/react'
import { useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'

const DESKTOP_MQ = '(min-width: 1024px)'

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_MQ)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_MQ).matches
}

function getServerSnapshot() {
  return false
}

/** Desktop (≥1024px): Lenis. Mobile / tablet: native scroll. */
export function LandingSmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion() === true
  const isDesktop = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const enableLenis = isDesktop && !reduceMotion

  useEffect(() => {
    const root = document.documentElement
    if (enableLenis) {
      root.classList.add('landing-lenis')
      root.classList.remove('landing-native-smooth')
    } else {
      root.classList.add('landing-native-smooth')
      root.classList.remove('landing-lenis')
    }
    return () => {
      root.classList.remove('landing-lenis', 'landing-native-smooth')
    }
  }, [enableLenis])

  const options = useMemo(
    () => ({
      autoRaf: true as const,
      lerp: 0.075,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      overscroll: true,
    }),
    [],
  )

  if (!enableLenis) return <>{children}</>

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  )
}
